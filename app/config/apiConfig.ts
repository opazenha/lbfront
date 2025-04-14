// API Configuration for the application
// This file centralizes all API configuration to make it easy to switch between environments

// Default API base URL - Using Next.js API routes to avoid CORS issues
// These routes are defined in app/api/ and proxy requests to the Transfermarkt API
const API_BASE_URL = '/api';

// Allow for fallback to mock data if API is unavailable
const USE_MOCK_DATA_IF_API_DOWN = process.env.NEXT_PUBLIC_USE_MOCK_IF_API_DOWN !== 'false';

// Debug flag for verbose logging
const ENABLE_API_DEBUG = process.env.NEXT_PUBLIC_ENABLE_API_DEBUG === 'true';

// API endpoints
const API_ENDPOINTS = {
  // Player endpoints
  PLAYER_SEARCH: '/players/search',
  PLAYER_PROFILE: '/players',
  PLAYER_MARKET_VALUE: '/players',
  PLAYER_TRANSFERS: '/players',
  PLAYER_STATS: '/players',
  
  // Club endpoints
  CLUB_SEARCH: '/clubs/search',
  CLUB_PROFILE: '/clubs',
  CLUB_PLAYERS: '/clubs',
  
  // Competition endpoints
  COMPETITION_SEARCH: '/competitions/search',
  COMPETITION_CLUBS: '/competitions',
  
  // Cache endpoints (new API)
  CACHE_PLAYERS: '/cache/players',
  CACHE_CLUBS: '/cache/clubs',
  CACHE_COMPETITIONS: '/cache/competitions',
  CACHE_STATS: '/cache/stats'
};

// Export the configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: API_ENDPOINTS,
  USE_MOCK_DATA_IF_API_DOWN,
  ENABLE_API_DEBUG,
  TIMEOUT: 10000 // 10 second timeout for API requests
};

// Function to update the API base URL (for example, when moving to production)
export const updateApiBaseUrl = (newBaseUrl: string): void => {
  if (newBaseUrl) {
    API_CONFIG.BASE_URL = newBaseUrl;
    console.log(`API base URL updated to: ${newBaseUrl}`);
  } else {
    console.warn('Invalid API base URL provided');
  }
};

// Get the current API configuration
export const getApiConfig = () => {
  return {
    baseUrl: API_CONFIG.BASE_URL,
    endpoints: API_CONFIG.ENDPOINTS,
    isProduction: process.env.NODE_ENV === 'production'
  };
};
