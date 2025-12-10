import { useState, useEffect, useCallback } from 'react';
import useSWRMutation from 'swr/mutation';
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Close,
  Psychology,
  Refresh,
} from '@mui/icons-material';
import { getReflectionRecommendationFetcher } from '../utils/api';
import toast from 'react-hot-toast';

const ReflectionModal = ({ open, onClose, mood, weather }) => {
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { trigger: getRecommendation, isMutating } = useSWRMutation(
    '/reflection/recommendation',
    getReflectionRecommendationFetcher
  );

  const fetchRecommendation = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getRecommendation({
        mood: mood || 'neutral',
        weather: weather || null,
        preferences: {},
      });

      if (response.success) {
        setRecommendation(response.data.recommendation);
      } else {
        toast.error(response.message || 'Failed to get recommendation');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to get recommendation');
      console.error('Reflection fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getRecommendation, mood, weather]);

  useEffect(() => {
    if (open) {
      fetchRecommendation();
    } else {
      setRecommendation(null);
    }
  }, [open, fetchRecommendation]);

  const handleRefresh = () => {
    fetchRecommendation();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
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
            maxWidth: 600,
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
                  background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(5deg)',
                  },
                }}
              >
                <Psychology sx={{ color: '#FFFFFF', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 800,
                    color: '#1d1d1f',
                    letterSpacing: '-0.03em',
                  }}
                >
                  A Moment of Reflection
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
                  Personalized wellness recommendation
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
              p: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            {isLoading || isMutating ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <CircularProgress size={48} />
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    color: '#6e6e73',
                  }}
                >
                  Generating your personalized recommendation...
                </Typography>
              </Box>
            ) : recommendation ? (
              <Box
                sx={{
                  width: '100%',
                  animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box
                  sx={{
                    mb: 4,
                    p: 4,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.04) 100%)',
                    border: '1px solid rgba(76, 175, 80, 0.2)',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 600,
                      color: '#1d1d1f',
                      fontSize: '1.25rem',
                      lineHeight: 1.6,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {recommendation}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  disabled={isMutating}
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: '#4CAF50',
                    borderColor: '#4CAF50',
                    px: 4,
                    py: 1.5,
                    borderRadius: '14px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'rgba(76, 175, 80, 0.08)',
                      borderColor: '#4CAF50',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Get Another Suggestion
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Psychology sx={{ fontSize: 64, color: '#6e6e73', opacity: 0.5 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 600,
                    color: '#1d1d1f',
                  }}
                >
                  Unable to load recommendation
                </Typography>
                <Button
                  variant="contained"
                  onClick={fetchRecommendation}
                  sx={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                    color: '#FFFFFF',
                    px: 4,
                    py: 1.5,
                    borderRadius: '14px',
                    mt: 2,
                  }}
                >
                  Try Again
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ReflectionModal;

