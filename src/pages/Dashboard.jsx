import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Modal,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  WbSunny,
  Cloud,
  CloudQueue,
  AcUnit,
  Thunderstorm,
  WaterDrop,
  MusicNote,
  Movie,
  Psychology,
  SentimentVerySatisfied,
  SentimentSatisfied,
  SentimentNeutral,
  SentimentDissatisfied,
  SentimentVeryDissatisfied,
} from '@mui/icons-material';
import { useMood } from '../context/MoodContext';
import { getTodayMoodFetcher, getCurrentUserFetcher, getMoodsRangeFetcher, getCurrentWeatherFetcher } from '../utils/api';
import { themes, defaultTheme } from '../themes';
import Header from '../components/Header';
import toast from 'react-hot-toast';
import MoodLogModal from '../components/MoodLogModal';
import SpotifyModal from '../components/SpotifyModal';
import MovieModal from '../components/MovieModal';
import ReflectionModal from '../components/ReflectionModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, currentMood, actions } = useMood();
  const [openModal, setOpenModal] = useState(false);
  const [openSpotifyModal, setOpenSpotifyModal] = useState(false);
  const [openMovieModal, setOpenMovieModal] = useState(false);
  const [openReflectionModal, setOpenReflectionModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Check authentication and validate token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    // Token exists, but we'll validate it via the API call below
    // If the API call fails with 401, we'll redirect in the error handler
  }, [navigate]);

  // Request user location permission
  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    // Check if we have stored location in localStorage
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation);
        setUserLocation(location);
        return;
      } catch (e) {
        // Invalid stored location, clear it
        localStorage.removeItem('userLocation');
      }
    }

    // Request current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setUserLocation(location);
        // Store in localStorage for future use
        localStorage.setItem('userLocation', JSON.stringify(location));
        setLocationError(null);
        toast.success('Location detected! Showing weather for your area.');
      },
      (error) => {
        // Handle location errors
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Using default location.';
            toast.error('Location permission denied. Using default location (New York).');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Using default location.';
            toast.error('Location unavailable. Using default location.');
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Using default location.';
            toast.error('Location request timed out. Using default location.');
            break;
        }
        setLocationError(errorMessage);
        // Use default location (New York) if permission denied
        setUserLocation({ lat: '40.7128', lon: '-74.0060' });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3600000, // Cache for 1 hour
      }
    );
  }, []);

  // Fetch user data using SWR
  const { data: userData, isLoading: userLoading, error: userError } = useSWR(
    '/user/me',
    getCurrentUserFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      onError: (error) => {
        // If authentication fails (401), redirect to signin
        if (error.status === 401 || error.message?.includes('token') || error.message?.includes('Unauthorized')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/signin');
        }
      },
    }
  );

  // Handle authentication errors
  useEffect(() => {
    if (userError) {
      // Check if it's an authentication error
      if (userError.status === 401 || userError.message?.includes('token') || userError.message?.includes('Unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/signin');
      }
    }
  }, [userError, navigate]);

  // Update context when user data changes
  useEffect(() => {
    if (userData?.success && userData.data) {
      actions.setUser(userData.data);
    }
  }, [userData, actions.setUser]);

  // Fetch today's mood using SWR
  const { data: moodData, isLoading: moodLoading, mutate } = useSWR(
    '/mood/today',
    getTodayMoodFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Fetch moods for the last 7 days for the chart
  const { data: moodsRangeData, mutate: mutateRange } = useSWR(
    '/mood/range?limit=168', // Last 168 hours (7 days)
    getMoodsRangeFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Fetch current weather using SWR (with user location if available)
  // Use user location if available, otherwise use default (New York)
  const location = userLocation || { lat: '40.7128', lon: '-74.0060' };
  const weatherUrl = `/weather/current?lat=${location.lat}&lon=${location.lon}`;
  
  const { data: weatherData, isLoading: weatherLoading } = useSWR(
    weatherUrl,
    getCurrentWeatherFetcher,
    {
      revalidateOnFocus: false, // Don't refetch on focus to avoid too many API calls
      revalidateOnReconnect: true,
      refreshInterval: 3600000, // Refresh every hour (3600000ms)
    }
  );

  // Update context when mood data changes (most recent mood entry)
  useEffect(() => {
    if (moodData?.success && moodData.data) {
      actions.setTodayMood(moodData.data); // This sets currentMood in context
    } else if (moodData?.success && !moodData.data) {
      actions.setTodayMood(null);
    }
  }, [moodData, actions.setTodayMood]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const username = currentUser?.name || 'User';
  const greeting = getGreeting();
  
  // Typewriter effect for greeting
  const [displayedText, setDisplayedText] = useState('');
  const fullGreeting = `${greeting}, ${username}!`;
  
  useEffect(() => {
    if (!userLoading && username) {
      setDisplayedText(''); // Reset when user data loads
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex < fullGreeting.length) {
          setDisplayedText(fullGreeting.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50); // Adjust speed here (50ms per character)
      
      return () => clearInterval(typeInterval);
    }
  }, [userLoading, username, fullGreeting]);

  const handleMoodLogged = () => {
    mutate(); // Refresh current mood
    mutateRange(); // Refresh chart data
    setOpenModal(false);
  };

  // Process mood data for chart (group by day and get average mood for last 7 days)
  const processChartData = () => {
    if (!moodsRangeData?.success || !moodsRangeData.data || moodsRangeData.data.length === 0) {
      return [];
    }

    const moods = moodsRangeData.data;
    const moodValues = { happy: 5, calm: 4, neutral: 3, sad: 2, angry: 1 };

    // Group by date (YYYY-MM-DD) to handle multiple entries per day
    const dailyData = {};
    moods.forEach((mood) => {
      const date = new Date(mood.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          day: dayKey,
          date: dateLabel,
          dateKey: dateKey,
          moods: [],
          avgMood: 0,
        };
      }
      dailyData[dateKey].moods.push(moodValues[mood.mood] || 3);
    });

    // Calculate average for each day
    Object.keys(dailyData).forEach((key) => {
      const day = dailyData[key];
      day.avgMood = day.moods.reduce((a, b) => a + b, 0) / day.moods.length;
    });

    // Get last 7 days in order (most recent first, then going back)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (dailyData[dateKey]) {
        last7Days.push(dailyData[dateKey]);
      } else {
        last7Days.push({
          day: dayKey,
          date: dateLabel,
          dateKey: dateKey,
          avgMood: 0,
        });
      }
    }

    return last7Days;
  };

  const chartData = processChartData();

  // Get mood label helper
  const getMoodLabel = (moodValue) => {
    const moodMap = { happy: 'Happy', calm: 'Calm', neutral: 'Neutral', sad: 'Sad', angry: 'Angry' };
    return moodMap[moodValue] || 'Neutral';
  };

  // Get mood-based playlist name
  const getMoodPlaylistName = (mood) => {
    const playlistNames = {
      happy: 'Happy Vibes',
      calm: 'Calm Acoustic',
      sad: 'Melancholic Mood',
      angry: 'Intense Energy',
      neutral: 'Chill Vibes',
    };
    return playlistNames[mood] || 'Your Playlist';
  };

  // Get mood-based movie genre name
  const getMoodMovieGenre = (mood) => {
    const genreNames = {
      happy: 'Comedy',
      calm: 'Animation',
      sad: 'Drama',
      angry: 'Action',
      neutral: 'Documentary',
    };
    return genreNames[mood] || 'Movies';
  };

  // Get weather icon based on weather condition icon code
  const getWeatherIcon = (iconCode) => {
    if (!iconCode) return WbSunny;
    
    // Icon codes mapped from weather conditions (compatible with standard weather icon codes)
    const iconMap = {
      '01d': WbSunny, // clear sky day
      '01n': WbSunny, // clear sky night
      '02d': CloudQueue, // few clouds day
      '02n': CloudQueue, // few clouds night
      '03d': Cloud, // scattered clouds
      '03n': Cloud,
      '04d': Cloud, // broken clouds
      '04n': Cloud,
      '09d': WaterDrop, // shower rain
      '09n': WaterDrop,
      '10d': WaterDrop, // rain
      '10n': WaterDrop,
      '11d': Thunderstorm, // thunderstorm
      '11n': Thunderstorm,
      '13d': AcUnit, // snow
      '13n': AcUnit,
      '50d': CloudQueue, // mist
      '50n': CloudQueue,
    };
    
    return iconMap[iconCode] || WbSunny;
  };

  // Get weather icon color based on weather condition
  const getWeatherIconColor = (main) => {
    const colorMap = {
      'Clear': '#FFC107', // Yellow for sunny
      'Clouds': '#757575', // Grey for clouds
      'Rain': '#2196F3', // Blue for rain
      'Drizzle': '#2196F3',
      'Thunderstorm': '#9C27B0', // Purple for thunderstorm
      'Snow': '#E3F2FD', // Light blue for snow
      'Mist': '#BDBDBD', // Light grey for mist
      'Fog': '#BDBDBD',
      'Haze': '#BDBDBD',
    };
    return colorMap[main] || '#2196F3';
  };

  // Get weather background color
  const getWeatherBackground = (main) => {
    const bgMap = {
      'Clear': '#FFF9C4', // Light yellow
      'Clouds': '#F5F5F5', // Light grey
      'Rain': '#E3F2FD', // Light blue
      'Drizzle': '#E3F2FD',
      'Thunderstorm': '#F3E5F5', // Light purple
      'Snow': '#E1F5FE', // Very light blue
      'Mist': '#FAFAFA', // Very light grey
      'Fog': '#FAFAFA',
      'Haze': '#FAFAFA',
    };
    return bgMap[main] || '#E3F2FD';
  };

  if (moodLoading || userLoading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Get theme colors based on current mood
  const theme = currentMood 
    ? themes[currentMood.mood] || defaultTheme
    : defaultTheme;
  
  const backgroundColor = theme.palette.background.default;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${theme.palette.background.paper} 100%)`,
        pb: 4,
        transition: 'background 0.8s ease-in-out',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '400px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.light}08 100%)`,
          borderRadius: '0 0 50% 50%',
          transform: 'scale(1.2)',
          transition: 'background 0.8s ease-in-out',
        },
      }}
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <Box
        sx={{
          maxWidth: '1600px',
          mx: 'auto',
          p: { xs: 2, sm: 3, md: 4, lg: 5 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            mb: 5,
            animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 800,
              color: theme.palette.text.primary,
              mb: 1,
              transition: 'color 0.8s ease-in-out',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
            }}
          >
            {userLoading ? (
              <span>{greeting}, {username}!</span>
            ) : (
              <span>
                {displayedText || fullGreeting}
                {displayedText.length < fullGreeting.length && (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: '3px',
                      height: '1.2em',
                      bgcolor: theme.palette.primary.main,
                      ml: 0.5,
                      animation: 'blink 1s infinite',
                      borderRadius: '2px',
                    }}
                  />
                )}
              </span>
            )}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 400,
              color: theme.palette.text.secondary,
              transition: 'color 0.8s ease-in-out',
              fontSize: { xs: '1rem', sm: '1.125rem' },
            }}
          >
            Track your mood and discover personalized recommendations
          </Typography>
        </Box>

        {/* Main Grid Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(12, 1fr)',
            },
            gap: 3,
          }}
        >
          {/* Mood Status Card - Large Hero Card */}
          <Card
            sx={{
              gridColumn: { xs: '1', lg: '1 / 7' },
              borderRadius: '32px',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper}ee 100%)`,
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.06)',
              border: `1px solid ${theme.palette.divider || 'rgba(255, 255, 255, 0.2)'}`,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: currentMood
                  ? `radial-gradient(circle, ${themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main}20 0%, transparent 70%)`
                  : `radial-gradient(circle, ${theme.palette.primary.main}15 0%, transparent 70%)`,
                borderRadius: '50%',
                transform: 'translate(30%, -30%)',
                transition: 'background 0.8s ease-in-out',
              },
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.15), 0 12px 32px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Mood Icon and Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box
                    sx={{
                      width: { xs: 100, sm: 120 },
                      height: { xs: 100, sm: 120 },
                      borderRadius: '24px',
                      background: currentMood 
                        ? `linear-gradient(135deg, ${themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main}20 0%, ${themes[currentMood.mood]?.palette?.primary?.light || theme.palette.primary.light}10 100%)`
                        : `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.light}08 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.8s ease-in-out',
                      boxShadow: currentMood 
                        ? `0 8px 24px ${themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main}20`
                        : `0 8px 24px ${theme.palette.primary.main}15`,
                    }}
                  >
                    {currentMood ? (
                      (() => {
                        const moodIcons = {
                          happy: SentimentVerySatisfied,
                          calm: SentimentSatisfied,
                          neutral: SentimentNeutral,
                          sad: SentimentDissatisfied,
                          angry: SentimentVeryDissatisfied,
                        };
                        const Icon = moodIcons[currentMood.mood] || SentimentNeutral;
                        const moodColor = themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main;
                        return (
                          <Icon
                            sx={{
                              fontSize: { xs: '3.5rem', sm: '4.5rem' },
                              color: moodColor,
                              transition: 'color 0.8s ease-in-out',
                            }}
                          />
                        );
                      })()
                    ) : (
                      <SentimentVerySatisfied
                        sx={{
                          fontSize: { xs: '3.5rem', sm: '4.5rem' },
                          color: theme.palette.primary.main,
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    {currentMood ? (
                      <>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 1,
                            transition: 'color 0.8s ease-in-out',
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                          }}
                        >
                          You're feeling {getMoodLabel(currentMood.mood)}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: 'Manrope, sans-serif',
                            color: theme.palette.text.secondary,
                            transition: 'color 0.8s ease-in-out',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          {currentMood.notes 
                            ? currentMood.notes 
                            : `Logged at ${new Date(currentMood.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                          }
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 1,
                            transition: 'color 0.8s ease-in-out',
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                          }}
                        >
                          How are you feeling?
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: 'Manrope, sans-serif',
                            color: theme.palette.text.secondary,
                            transition: 'color 0.8s ease-in-out',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          Log your mood to unlock personalized insights
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>

                {/* Action Button */}
                <Button
                  variant="contained"
                  onClick={() => setOpenModal(true)}
                  size="large"
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: theme.palette.primary.contrastText,
                    px: 4,
                    py: 2,
                    borderRadius: '16px',
                    textTransform: 'none',
                    fontSize: '1.125rem',
                    boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px ${theme.palette.primary.main}60`,
                    },
                    '&:active': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {currentMood ? 'Update Mood' : 'Log Your Mood'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Chart Card - Spans full width below mood card */}
          <Card
            sx={{
              gridColumn: { xs: '1', lg: '1 / 13' },
              borderRadius: '32px',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper}ee 100%)`,
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.06)',
              border: `1px solid ${theme.palette.divider || 'rgba(255, 255, 255, 0.2)'}`,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.15), 0 12px 32px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 }, position: 'relative', zIndex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Manrope, sans-serif',
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '0.75rem',
                  transition: 'color 0.8s ease-in-out',
                  mb: 1,
                }}
              >
                Your 7-Day Mood Journey
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 3,
                  transition: 'color 0.8s ease-in-out',
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
              >
                Weekly Vibe Trend
              </Typography>
              {chartData.length > 0 ? (
                  <Box sx={{ height: { xs: 250, sm: 320, md: 380 }, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider || '#e0e0e0'} />
                        <XAxis 
                          dataKey="day" 
                          stroke={theme.palette.text.secondary}
                          style={{ fontFamily: 'Manrope, sans-serif', fontSize: '0.75rem' }}
                        />
                        <YAxis 
                          domain={[0, 5]}
                          stroke={theme.palette.text.secondary}
                          style={{ fontFamily: 'Manrope, sans-serif', fontSize: '0.75rem' }}
                          tickFormatter={(value) => {
                            const moodMap = { 5: 'Happy', 4: 'Calm', 3: 'Neutral', 2: 'Sad', 1: 'Angry' };
                            return moodMap[value] || '';
                          }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider || '#e0e0e0'}`,
                            borderRadius: '8px',
                            fontFamily: 'Manrope, sans-serif',
                          }}
                          formatter={(value) => {
                            const moodMap = { 5: 'Happy', 4: 'Calm', 3: 'Neutral', 2: 'Sad', 1: 'Angry' };
                            return [moodMap[Math.round(value)] || 'Neutral', 'Mood'];
                          }}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="avgMood"
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                          fill="url(#colorMood)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.palette.text.secondary,
                      transition: 'color 0.8s ease-in-out',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'Manrope, sans-serif',
                        color: theme.palette.text.secondary,
                        transition: 'color 0.8s ease-in-out',
                      }}
                    >
                      Log your mood to see your weekly trend
                    </Typography>
                  </Box>
                )}
              </CardContent>
          </Card>

          {/* Weather Card */}
          <Card
            sx={{
              gridColumn: { xs: '1', sm: '1 / 3', lg: '1 / 4' }, // 25% width (3 columns)
              borderRadius: '24px',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper}ee 100%)`,
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.06)',
              border: `1px solid ${theme.palette.divider || 'rgba(255, 255, 255, 0.2)'}`,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'slideUp 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.15), 0 12px 32px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
              {weatherLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : weatherData?.success && weatherData.data ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '20px',
                      background: getWeatherBackground(weatherData.data.main),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'center',
                      boxShadow: `0 8px 24px ${getWeatherIconColor(weatherData.data.main)}30`,
                    }}
                  >
                    {(() => {
                      const WeatherIcon = getWeatherIcon(weatherData.data.icon);
                      return (
                        <WeatherIcon
                          sx={{
                            color: getWeatherIconColor(weatherData.data.main),
                            fontSize: 40,
                          }}
                        />
                      );
                    })()}
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 0.5,
                        transition: 'color 0.8s ease-in-out',
                      }}
                    >
                      {weatherData.data.temperature}°C
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 500,
                        color: theme.palette.text.secondary,
                        mb: 1,
                        transition: 'color 0.8s ease-in-out',
                      }}
                    >
                      {weatherData.data.description.charAt(0).toUpperCase() + weatherData.data.description.slice(1)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Manrope, sans-serif',
                        color: theme.palette.text.secondary,
                        fontSize: '0.875rem',
                        transition: 'color 0.8s ease-in-out',
                      }}
                    >
                      {weatherData.data.city}, {weatherData.data.country}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
                  <WbSunny sx={{ color: theme.palette.text.secondary, fontSize: 48 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Manrope, sans-serif',
                      color: theme.palette.text.secondary,
                      textAlign: 'center',
                    }}
                  >
                    Unable to load weather
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Soundtrack Card */}
          <Card
            sx={{
              gridColumn: { xs: '1', sm: '3 / 5', lg: '4 / 7' }, // 25% width (3 columns)
              borderRadius: '24px',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper}ee 100%)`,
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.06)',
              border: `1px solid ${theme.palette.divider || 'rgba(255, 255, 255, 0.2)'}`,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'slideUp 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
                transition: 'left 0.6s',
              },
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.15), 0 12px 32px rgba(0, 0, 0, 0.1)',
                borderColor: currentMood 
                  ? `${themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main}50`
                  : `${theme.palette.primary.main}50`,
                '&::before': {
                  left: '100%',
                },
              },
            }}
            onClick={() => setOpenSpotifyModal(true)}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '20px',
                    background: currentMood 
                      ? `linear-gradient(135deg, ${themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main}20 0%, ${themes[currentMood.mood]?.palette?.primary?.light || theme.palette.primary.light}10 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.light}08 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: currentMood 
                      ? `0 8px 24px ${themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main}30`
                      : `0 8px 24px ${theme.palette.primary.main}20`,
                  }}
                >
                  <MusicNote 
                    sx={{ 
                      color: currentMood 
                        ? themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main
                        : theme.palette.primary.main,
                      fontSize: 40,
                      transition: 'color 0.8s ease-in-out',
                    }} 
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      mb: 0.5,
                      transition: 'color 0.8s ease-in-out',
                    }}
                  >
                    A Soundtrack for Your Day
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Manrope, sans-serif',
                      color: theme.palette.text.secondary,
                      transition: 'color 0.8s ease-in-out',
                    }}
                  >
                    {currentMood 
                      ? `${getMoodPlaylistName(currentMood.mood)}`
                      : 'Discover playlists'
                    }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Watchlist Card */}
          <Card
            sx={{
              gridColumn: { xs: '1', sm: '1 / 3', lg: '7 / 10' }, // 25% width (3 columns)
              borderRadius: '24px',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper}ee 100%)`,
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.06)',
              border: `1px solid ${theme.palette.divider || 'rgba(255, 255, 255, 0.2)'}`,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'slideUp 1s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
                transition: 'left 0.6s',
              },
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.15), 0 12px 32px rgba(0, 0, 0, 0.1)',
                borderColor: currentMood 
                  ? `${themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main}50`
                  : `${theme.palette.primary.main}50`,
                '&::before': {
                  left: '100%',
                },
              },
            }}
            onClick={() => setOpenMovieModal(true)}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '20px',
                    background: currentMood 
                      ? `linear-gradient(135deg, ${themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main}20 0%, ${themes[currentMood.mood]?.palette?.primary?.light || theme.palette.primary.light}10 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.light}08 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: currentMood 
                      ? `0 8px 24px ${themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main}30`
                      : `0 8px 24px ${theme.palette.primary.main}20`,
                  }}
                >
                  <Movie 
                    sx={{ 
                      color: currentMood 
                        ? themes[currentMood.mood]?.palette?.primary?.main || theme.palette.primary.main
                        : theme.palette.primary.main,
                      fontSize: 40,
                      transition: 'color 0.8s ease-in-out',
                    }} 
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      mb: 0.5,
                      transition: 'color 0.8s ease-in-out',
                    }}
                  >
                    Tonight's Watchlist
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Manrope, sans-serif',
                      color: theme.palette.text.secondary,
                      transition: 'color 0.8s ease-in-out',
                    }}
                  >
                    {currentMood 
                      ? `${getMoodMovieGenre(currentMood.mood)} Movies`
                      : 'Discover movies'
                    }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Reflection Card */}
          <Card
            sx={{
              gridColumn: { xs: '1', sm: '3 / 5', lg: '10 / 13' }, // 25% width (3 columns)
              borderRadius: '24px',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper}ee 100%)`,
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.06)',
              border: `1px solid ${theme.palette.divider || 'rgba(255, 255, 255, 0.2)'}`,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'slideUp 1.1s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
                transition: 'left 0.6s',
              },
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.15), 0 12px 32px rgba(0, 0, 0, 0.1)',
                borderColor: '#4CAF5050',
                '&::before': {
                  left: '100%',
                },
              },
            }}
            onClick={() => setOpenReflectionModal(true)}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #4CAF5020 0%, #81C78410 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px #4CAF5030',
                  }}
                >
                  <Psychology sx={{ color: '#4CAF50', fontSize: 40 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      mb: 0.5,
                      transition: 'color 0.8s ease-in-out',
                    }}
                  >
                    A Moment of Reflection
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Manrope, sans-serif',
                      color: theme.palette.text.secondary,
                      transition: 'color 0.8s ease-in-out',
                    }}
                  >
                    What's one small thing you can do for yourself today?
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Mood Log Modal */}
      <MoodLogModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onMoodLogged={handleMoodLogged}
        currentMood={currentMood}
      />

      {/* Spotify Modal */}
      <SpotifyModal
        open={openSpotifyModal}
        onClose={() => setOpenSpotifyModal(false)}
        mood={currentMood?.mood || null}
      />

      {/* Movie Modal */}
      <MovieModal
        open={openMovieModal}
        onClose={() => setOpenMovieModal(false)}
        mood={currentMood?.mood || null}
      />

      {/* Reflection Modal */}
      <ReflectionModal
        open={openReflectionModal}
        onClose={() => setOpenReflectionModal(false)}
        mood={currentMood?.mood || null}
        weather={weatherData?.success && weatherData.data ? {
          description: weatherData.data.description,
          temperature: weatherData.data.temperature,
        } : null}
      />
    </Box>
  );
};

export default Dashboard;
