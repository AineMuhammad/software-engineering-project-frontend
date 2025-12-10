import { useState } from 'react';
import useSWR from 'swr';
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Chip,
  Fade,
  Grid,
} from '@mui/material';
import {
  Close,
  MusicNote,
  OpenInNew,
} from '@mui/icons-material';
import { getSpotifyPlaylistsFetcher } from '../utils/api';
import toast from 'react-hot-toast';

const SpotifyModal = ({ open, onClose, mood }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  // Fetch playlists based on mood
  const { data: playlistsData, isLoading } = useSWR(
    mood ? `/spotify/playlists?mood=${mood}` : null,
    getSpotifyPlaylistsFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const playlists = playlistsData?.success ? playlistsData.data : [];
  const moodLabels = {
    happy: 'Happy',
    calm: 'Calm',
    sad: 'Sad',
    angry: 'Angry',
    neutral: 'Neutral',
  };

  const handlePlaylistClick = (playlist) => {
    window.open(playlist.spotifyUrl, '_blank');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      aria-labelledby="spotify-modal-title"
      aria-describedby="spotify-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1400,
            maxHeight: '90vh',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            borderRadius: '32px',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.2), 0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            outline: 'none',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 4,
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(29, 185, 84, 0.4)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(5deg)',
                  },
                }}
              >
                <MusicNote sx={{ color: '#FFFFFF', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  id="spotify-modal-title"
                  variant="h4"
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 800,
                    color: '#1d1d1f',
                    letterSpacing: '-0.03em',
                  }}
                >
                  A Soundtrack for Your Day
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    color: '#6e6e73',
                    fontSize: '0.9375rem',
                    mt: 0.5,
                  }}
                >
                  {mood ? `${moodLabels[mood] || mood} playlists` : 'Discover playlists'}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={onClose} 
              sx={{ 
                color: '#6e6e73',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'rgba(0, 0, 0, 0.08)',
                  transform: 'rotate(90deg) scale(1.1)',
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 4,
            }}
          >
            {isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 10,
                }}
              >
                <CircularProgress size={48} />
              </Box>
            ) : playlists.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 10,
                  textAlign: 'center',
                }}
              >
                <MusicNote sx={{ fontSize: 80, color: '#6e6e73', mb: 3, opacity: 0.5 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 700,
                    color: '#1d1d1f',
                    mb: 1,
                  }}
                >
                  No playlists found
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    color: '#6e6e73',
                  }}
                >
                  Try logging your mood to get personalized recommendations
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: 3,
                  width: '100%',
                }}
              >
                {playlists.map((playlist, index) => (
                  <Card
                    key={playlist.id}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: '24px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      height: '100%',
                      width: {
                        xs: '100%',
                        sm: 'calc((100vw - 200px) / 2)',
                        md: 'calc((100vw - 300px) / 3)',
                        lg: 'calc((100vw - 400px) / 4)',
                      },
                      maxWidth: {
                        xs: '100%',
                        sm: 'calc((1400px - 48px) / 2)',
                        md: 'calc((1400px - 72px) / 3)',
                        lg: 'calc((1400px - 96px) / 4)',
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '320px',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1)',
                          borderColor: '#1DB954',
                        },
                      }}
                      onClick={() => handlePlaylistClick(playlist)}
                    >
                      <Box
                        sx={{
                          height: '160px',
                          width: '100%',
                          overflow: 'hidden',
                          flexShrink: 0,
                          bgcolor: '#1DB954',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          component="img"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                          src={playlist.image || '/placeholder-playlist.png'}
                          alt={playlist.name}
                        />
                      </Box>
                      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', height: '160px', flexShrink: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 700,
                            fontSize: '1rem',
                            mb: 1,
                            color: '#1d1d1f',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '3rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {playlist.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'Manrope, sans-serif',
                            color: '#6e6e73',
                            fontSize: '0.8125rem',
                            mb: 1.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {playlist.owner}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: 'auto',
                          }}
                        >
                          <Chip
                            label={`${playlist.tracks} tracks`}
                            size="small"
                            sx={{
                              fontFamily: 'Manrope, sans-serif',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: 'rgba(0, 0, 0, 0.06)',
                            }}
                          />
                          <Button
                            size="small"
                            startIcon={<OpenInNew />}
                            variant="contained"
                            sx={{
                              fontFamily: 'Manrope, sans-serif',
                              textTransform: 'none',
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
                              color: '#FFFFFF',
                              borderRadius: '12px',
                              px: 2.5,
                              boxShadow: '0 4px 16px rgba(29, 185, 84, 0.4)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #1ed760 0%, #1DB954 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px rgba(29, 185, 84, 0.5)',
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlaylistClick(playlist);
                            }}
                          >
                            Open
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SpotifyModal;
