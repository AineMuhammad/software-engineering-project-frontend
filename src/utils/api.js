const API_BASE_URL = 'http://localhost:5000/api';

// SWR Fetcher function
export const fetcher = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return data;
};

// Sign up API fetcher for SWR
export const signupFetcher = async (url, { arg }) => {
  return fetcher(url, {
    method: 'POST',
    body: arg,
  });
};

// Sign in API fetcher for SWR
export const signinFetcher = async (url, { arg }) => {
  return fetcher(url, {
    method: 'POST',
    body: arg,
  });
};

// Store token in localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Get token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get today's mood API fetcher for SWR
export const getTodayMoodFetcher = async (url) => {
  return fetcher(url);
};

// Add today's mood API fetcher for SWR
export const addTodayMoodFetcher = async (url, { arg }) => {
  return fetcher(url, {
    method: 'POST',
    body: arg,
  });
};

// Get current user API fetcher for SWR
export const getCurrentUserFetcher = async (url) => {
  return fetcher(url);
};

// Get moods range API fetcher for SWR
export const getMoodsRangeFetcher = async (url) => {
  return fetcher(url);
};

// Get current weather API fetcher for SWR
export const getCurrentWeatherFetcher = async (url) => {
  return fetcher(url);
};

// Get Spotify playlists API fetcher for SWR
export const getSpotifyPlaylistsFetcher = async (url) => {
  return fetcher(url);
};

// Get movies by mood API fetcher for SWR
export const getMoviesByMoodFetcher = async (url) => {
  return fetcher(url);
};

// Get reflection recommendation API fetcher for SWR mutation
export const getReflectionRecommendationFetcher = async (url, { arg }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Failed to get reflection recommendation');
  }

  return response.json();
};

