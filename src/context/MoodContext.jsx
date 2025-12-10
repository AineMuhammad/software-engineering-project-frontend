import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { themes, defaultTheme } from '../themes';

// Initial state
const initialState = {
  currentUser: null,
  currentMood: null, // Most recent mood entry (hourly logging)
  currentTheme: defaultTheme,
  recommendations: [],
  preferences: {
    activityTypes: [],
    darkMode: false,
  },
};

// Action types
const MoodActionTypes = {
  SET_USER: 'SET_USER',
  SET_TODAY_MOOD: 'SET_TODAY_MOOD',
  SET_THEME: 'SET_THEME',
  SET_RECOMMENDATIONS: 'SET_RECOMMENDATIONS',
  SET_PREFERENCES: 'SET_PREFERENCES',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  RESET: 'RESET',
};

// Reducer
const moodReducer = (state, action) => {
  switch (action.type) {
    case MoodActionTypes.SET_USER:
      return {
        ...state,
        currentUser: action.payload,
      };
    
    case MoodActionTypes.SET_TODAY_MOOD:
      // Update theme based on most recent mood (hourly logging)
      const moodTheme = action.payload 
        ? themes[action.payload.mood] || defaultTheme
        : defaultTheme;
      
      return {
        ...state,
        currentMood: action.payload,
        currentTheme: moodTheme,
      };
    
    case MoodActionTypes.SET_THEME:
      return {
        ...state,
        currentTheme: action.payload,
      };
    
    case MoodActionTypes.SET_RECOMMENDATIONS:
      return {
        ...state,
        recommendations: action.payload,
      };
    
    case MoodActionTypes.SET_PREFERENCES:
      return {
        ...state,
        preferences: action.payload,
      };
    
    case MoodActionTypes.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };
    
    case MoodActionTypes.RESET:
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const MoodContext = createContext();

// Provider component
export const MoodProvider = ({ children }) => {
  const [state, dispatch] = useReducer(moodReducer, initialState);

  // Memoize action functions to prevent infinite loops
  const setUser = useCallback((user) => {
    dispatch({ type: MoodActionTypes.SET_USER, payload: user });
  }, []);

  const setTodayMood = useCallback((mood) => {
    dispatch({ type: MoodActionTypes.SET_TODAY_MOOD, payload: mood });
  }, []);

  const setTheme = useCallback((theme) => {
    dispatch({ type: MoodActionTypes.SET_THEME, payload: theme });
  }, []);

  const setRecommendations = useCallback((recommendations) => {
    dispatch({ type: MoodActionTypes.SET_RECOMMENDATIONS, payload: recommendations });
  }, []);

  const setPreferences = useCallback((preferences) => {
    dispatch({ type: MoodActionTypes.SET_PREFERENCES, payload: preferences });
  }, []);

  const updatePreferences = useCallback((preferences) => {
    dispatch({ type: MoodActionTypes.UPDATE_PREFERENCES, payload: preferences });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: MoodActionTypes.RESET });
  }, []);

  // Memoize the actions object
  const actions = useMemo(() => ({
    setUser,
    setTodayMood, // Kept for backward compatibility, but stores current/latest mood
    setTheme,
    setRecommendations,
    setPreferences,
    updatePreferences,
    reset,
  }), [setUser, setTodayMood, setTheme, setRecommendations, setPreferences, updatePreferences, reset]);

  // Memoize the context value
  const value = useMemo(() => ({
    ...state,
    dispatch,
    actions,
  }), [state, actions]);

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
};

// Custom hook to use the context
export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};

