import { useState, useEffect } from 'react';
import useSWRMutation from 'swr/mutation';
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Fade,
} from '@mui/material';
import {
  Close,
  SentimentVerySatisfied,
  SentimentSatisfied,
  SentimentNeutral,
  SentimentDissatisfied,
  SentimentVeryDissatisfied,
} from '@mui/icons-material';
import { addTodayMoodFetcher } from '../utils/api';
import toast from 'react-hot-toast';

const moodOptions = [
  {
    value: 'happy',
    label: 'Happy',
    color: '#4CAF50',
    icon: SentimentVerySatisfied,
  },
  {
    value: 'calm',
    label: 'Calm',
    color: '#F4B942',
    icon: SentimentSatisfied,
  },
  {
    value: 'neutral',
    label: 'Neutral',
    color: '#9E9E9E',
    icon: SentimentNeutral,
  },
  {
    value: 'sad',
    label: 'Sad',
    color: '#5B7FA3',
    icon: SentimentDissatisfied,
  },
  {
    value: 'angry',
    label: 'Angry',
    color: '#F44336',
    icon: SentimentVeryDissatisfied,
  },
];

const MoodLogModal = ({ open, onClose, onMoodLogged, currentMood }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');

  // Initialize with current mood if it exists
  useEffect(() => {
    if (open) {
      setSelectedMood(currentMood?.mood || null);
      setNotes(currentMood?.notes || '');
    }
  }, [open, currentMood]);

  const { trigger: addMood, isMutating: isAddingMood } = useSWRMutation(
    '/mood/today',
    addTodayMoodFetcher
  );

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }

    try {
      const response = await addMood({ mood: selectedMood, notes: notes.trim() });

      if (response.success) {
        toast.success(response.message || 'Mood logged successfully!');
        onMoodLogged();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to log mood');
    }
  };

  const handleClose = () => {
    setSelectedMood(null);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
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
            maxWidth: 720,
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
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 800,
                color: '#1d1d1f',
                letterSpacing: '-0.03em',
              }}
            >
              Log Your Mood
            </Typography>
            <IconButton 
              onClick={handleClose} 
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
          <Box sx={{ p: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 }, overflowY: 'auto', flex: 1, overflowX: 'visible' }}>
            {/* Question */}
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 700,
                color: '#1d1d1f',
                mb: 4,
                textAlign: 'center',
                letterSpacing: '-0.02em',
              }}
            >
              How are you feeling right now?
            </Typography>

            {/* Mood Options */}
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 1.5, sm: 2 },
                mb: 5,
                mt: 2,
                justifyContent: 'center',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                overflowX: 'auto',
                overflowY: 'visible',
                py: 3,
                px: { xs: 0, sm: 0 },
                mx: { xs: 0, sm: 0 },
                width: '100%',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              {moodOptions.map((option, index) => {
                const isSelected = selectedMood === option.value;
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => setSelectedMood(option.value)}
                    sx={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 700,
                      backgroundColor: isSelected 
                        ? option.color
                        : 'transparent',
                      color: isSelected ? '#ffffff' : option.color,
                      borderColor: option.color,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      px: { xs: 1.5, sm: 2.5 },
                      py: { xs: 2, sm: 2.5 },
                      borderRadius: '20px',
                      textTransform: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      minWidth: { xs: 'calc(50% - 6px)', sm: 100 },
                      maxWidth: { xs: 'calc(50% - 6px)', sm: 'none' },
                      flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 auto' },
                      flexShrink: 0,
                      maxHeight: 'none',
                      overflow: 'visible',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected 
                        ? `0 12px 32px ${option.color}50, 0 4px 16px ${option.color}30`
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      '&:hover': {
                        backgroundColor: isSelected ? option.color : `${option.color}15`,
                        borderColor: option.color,
                        transform: 'translateY(-6px) scale(1.05)',
                        boxShadow: `0 16px 40px ${option.color}60, 0 6px 20px ${option.color}40`,
                      },
                      ...(isSelected && {
                        transform: 'scale(1.02)',
                        '&:hover': {
                          transform: 'scale(1.05) translateY(-4px)',
                        },
                      }),
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: { xs: '2.5rem', sm: '2.75rem' },
                        color: isSelected ? '#ffffff' : option.color,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        ...(isSelected && {
                          transform: 'scale(1.1)',
                        }),
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: isSelected ? '#ffffff' : option.color,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {option.label}
                    </Typography>
                  </Button>
                );
              })}
            </Box>

            {/* Notes Field */}
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Add any notes about your mood (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Manrope, sans-serif',
                  borderRadius: '20px',
                  background: 'rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                    borderWidth: '2px',
                  },
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.04)',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                  },
                  '&.Mui-focused': {
                    background: 'rgba(255, 255, 255, 1)',
                    '& fieldset': {
                      borderColor: selectedMood ? moodOptions.find(m => m.value === selectedMood)?.color || '#4CAF50' : '#4CAF50',
                      borderWidth: '3px',
                    },
                  },
                },
              }}
            />

            {/* Actions */}
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end',
              }}
            >
              <Button
                onClick={handleClose}
                sx={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 600,
                  color: '#6e6e73',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  borderRadius: '14px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.06)',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!selectedMood || isAddingMood}
                sx={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 700,
                  background: selectedMood 
                    ? `linear-gradient(135deg, ${moodOptions.find(m => m.value === selectedMood)?.color || '#4CAF50'} 0%, ${moodOptions.find(m => m.value === selectedMood)?.color || '#4CAF50'}dd 100%)`
                    : 'linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)',
                  color: selectedMood ? '#ffffff' : '#9e9e9e',
                  px: 5,
                  py: 1.5,
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: selectedMood 
                    ? `0 8px 24px ${moodOptions.find(m => m.value === selectedMood)?.color || '#4CAF50'}50`
                    : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-3px)',
                    boxShadow: selectedMood 
                      ? `0 12px 32px ${moodOptions.find(m => m.value === selectedMood)?.color || '#4CAF50'}70`
                      : 'none',
                  },
                  '&:active:not(:disabled)': {
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)',
                    color: '#9e9e9e',
                    boxShadow: 'none',
                  },
                }}
              >
                {isAddingMood ? 'Logging...' : 'Log Mood'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default MoodLogModal;
