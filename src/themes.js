import { createTheme } from '@mui/material/styles';

// Happy Theme - Green
export const happyTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50', // Vibrant green
      light: '#66BB6A',
      dark: '#388E3C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#81C784', // Light green accent
      light: '#A5D6A7',
      dark: '#66BB6A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F1F8F4', // Soft green tint
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1B5E20',
      secondary: '#2E7D32',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
  },
  typography: {
    fontFamily: '"Manrope", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Calm Theme - Yellow
export const calmTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#F4B942', // Warm golden yellow
      light: '#F7C96B',
      dark: '#D49A1F',
      contrastText: '#1A1A1A',
    },
    secondary: {
      main: '#FFD700', // Bright gold accent
      light: '#FFE44D',
      dark: '#CCAA00',
      contrastText: '#1A1A1A',
    },
    background: {
      default: '#FFFBF0', // Soft warm white
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#5A5A5A',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
  },
  typography: {
    fontFamily: '"Manrope", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Sad Theme - Blue (Sad Blue)
export const sadTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5B7FA3', // Muted, desaturated blue (sad blue)
      light: '#7A9BC4',
      dark: '#4A6B8A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7A9BC4', // Soft muted blue
      light: '#9BB5D4',
      dark: '#5B7FA3',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F0F4F8', // Very light blue-grey tint
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#5B7FA3',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
  },
  typography: {
    fontFamily: '"Manrope", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Angry Theme - Red
export const angryTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#D32F2F', // Bold red
      light: '#E57373',
      dark: '#B71C1C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F44336', // Vibrant red
      light: '#EF5350',
      dark: '#C62828',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFF5F5', // Very light red tint
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C1F1F',
      secondary: '#5A3A3A',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#C62828',
    },
  },
  typography: {
    fontFamily: '"Manrope", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Neutral Theme - Light Grey/Beige
export const neutralTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#9E9E9E', // Medium grey
      light: '#BDBDBD',
      dark: '#757575',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E0E0E0', // Light grey
      light: '#F5F5F5',
      dark: '#BDBDBD',
      contrastText: '#424242',
    },
    background: {
      default: '#FAFAFA', // Very light grey
      paper: '#FFFFFF',
    },
    text: {
      primary: '#424242',
      secondary: '#757575',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
  },
  typography: {
    fontFamily: '"Manrope", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Theme mapping for easy access
export const themes = {
  happy: happyTheme,
  calm: calmTheme,
  sad: sadTheme,
  angry: angryTheme,
  neutral: neutralTheme,
};

// Default theme (can be used as fallback)
export const defaultTheme = neutralTheme;

