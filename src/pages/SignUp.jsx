import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import useSWRMutation from 'swr/mutation';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Google as GoogleIcon, Visibility, VisibilityOff, Email, Lock, Person, TrendingUp, Psychology, LocalFlorist, Explore } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../firebaseConfig';
import toast from 'react-hot-toast';
import { signupFetcher, setAuthToken } from '../utils/api';

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // SWR Mutation for signup
  const { trigger: signup, isMutating: loading } = useSWRMutation('/signup', signupFetcher);

  const handleGoogleSignUp = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await signup({ name, email, password });
      
      if (response.success) {
        // Store token
        setAuthToken(response.token);
        // Store user info
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        toast.success(response.message || 'Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
        background: '#fefae0',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Left side - Branding (65%) */}
      <Box
        sx={{
          width: { xs: '0%', md: '65%' },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%', maxWidth: '500px', px: 4 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUp sx={{ fontSize: 48, color: '#5b9279', mr: 2 }} />
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 800,
                color: '#000000',
                letterSpacing: '-0.02em',
              }}
            >
              Vibelytics
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Manrope, sans-serif',
              color: '#666666',
              fontWeight: 400,
              mb: 5,
              lineHeight: 1.6,
            }}
          >
            Begin your journey of emotional intelligence and personalized wellness
          </Typography>

          {/* Feature Boxes */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                p: 2.5,
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  backgroundColor: '#f0f7f4',
                  borderRadius: '8px',
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Explore sx={{ fontSize: 28, color: '#5b9279' }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 700,
                    color: '#000000',
                    fontSize: '1.1rem',
                    mb: 0.5,
                  }}
                >
                  Discover Insights
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    color: '#666666',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                  }}
                >
                  Understand your emotional patterns and triggers.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                p: 2.5,
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  backgroundColor: '#f0f7f4',
                  borderRadius: '8px',
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp sx={{ fontSize: 28, color: '#5b9279' }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 700,
                    color: '#000000',
                    fontSize: '1.1rem',
                    mb: 0.5,
                  }}
                >
                  Promote Growth
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    color: '#666666',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                  }}
                >
                  Develop healthier habits for a balanced mind.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                p: 2.5,
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  backgroundColor: '#f0f7f4',
                  borderRadius: '8px',
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LocalFlorist sx={{ fontSize: 28, color: '#5b9279' }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 700,
                    color: '#000000',
                    fontSize: '1.1rem',
                    mb: 0.5,
                  }}
                >
                  Find Calm
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    color: '#666666',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                  }}
                >
                  Access tools and techniques to manage stress.
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Right side - Sign Up Form (35%) */}
      <Box
        sx={{
          width: { xs: '100%', md: '35%' },
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          pr: 0,
          pl: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}
        >
          <Box
            sx={{
              background: '#5b9279',
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, sm: 4, md: 5 },
              boxShadow: '0 0 40px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Mobile Logo */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 2, justifyContent: 'center' }}>
              <TrendingUp sx={{ fontSize: 28, color: '#ffffff', mr: 1.5 }} />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                Vibelytics
              </Typography>
            </Box>

            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 700,
                color: '#ffffff',
                mb: 0.5,
                letterSpacing: '-0.01em',
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
              }}
            >
              Create Account
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Manrope, sans-serif',
                color: '#e0e0e0',
                mb: 3,
                fontSize: '0.875rem',
              }}
            >
              Start tracking your moods and discover insights
            </Typography>

            <Box component="form" onSubmit={handleEmailSignUp} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    fontSize: '1rem',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#000000',
                    '&:hover fieldset': {
                      borderColor: '#000000',
                      borderWidth: '2px',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000',
                      borderWidth: '2px',
                    },
                    '& fieldset': {
                      borderColor: '#d0d0d0',
                      borderWidth: '1.5px',
                    },
                    '& input': {
                      color: '#000000',
                      '&::placeholder': {
                        color: '#000000',
                        opacity: 0.6,
                        fontFamily: 'Manrope, sans-serif',
                      },
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#666666', fontSize: '1.3rem' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    fontSize: '1rem',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#000000',
                    '&:hover fieldset': {
                      borderColor: '#000000',
                      borderWidth: '2px',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000',
                      borderWidth: '2px',
                    },
                    '& fieldset': {
                      borderColor: '#d0d0d0',
                      borderWidth: '1.5px',
                    },
                    '& input': {
                      color: '#000000',
                      '&::placeholder': {
                        color: '#000000',
                        opacity: 0.6,
                        fontFamily: 'Manrope, sans-serif',
                      },
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#666666', fontSize: '1.3rem' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    fontSize: '1rem',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#000000',
                    '&:hover fieldset': {
                      borderColor: '#000000',
                      borderWidth: '2px',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000',
                      borderWidth: '2px',
                    },
                    '& fieldset': {
                      borderColor: '#d0d0d0',
                      borderWidth: '1.5px',
                    },
                    '& input': {
                      color: '#000000',
                      '&::placeholder': {
                        color: '#000000',
                        opacity: 0.6,
                        fontFamily: 'Manrope, sans-serif',
                      },
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#666666', fontSize: '1.3rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#666666' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                placeholder="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="outlined"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    fontSize: '1rem',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#000000',
                    '&:hover fieldset': {
                      borderColor: '#000000',
                      borderWidth: '2px',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000',
                      borderWidth: '2px',
                    },
                    '& fieldset': {
                      borderColor: '#d0d0d0',
                      borderWidth: '1.5px',
                    },
                    '& input': {
                      color: '#000000',
                      '&::placeholder': {
                        color: '#000000',
                        opacity: 0.6,
                        fontFamily: 'Manrope, sans-serif',
                      },
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#666666', fontSize: '1.3rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: '#666666' }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: '#fefae0',
                  color: '#000000',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 700,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    background: '#f5f0d8',
                    color: '#000000',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Sign Up
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
              <Box sx={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
              <Typography variant="body2" sx={{ fontFamily: 'Manrope, sans-serif', px: 1.5, color: '#e0e0e0', fontSize: '0.8rem' }}>
                OR
              </Typography>
              <Box sx={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
            </Box>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignUp}
              disabled={loading}
              sx={{
                py: 1.5,
                borderColor: '#5b9279',
                borderWidth: '2px',
                color: '#000000',
                textTransform: 'none',
                fontSize: '1rem',
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 600,
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#4a7a65',
                  borderWidth: '2px',
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Continue with Google
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Manrope, sans-serif', color: '#e0e0e0', fontSize: '0.85rem' }}>
                Already have an account?{' '}
                <Link
                  to="/signin"
                  style={{
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default SignUp;

