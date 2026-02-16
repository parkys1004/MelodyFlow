import { useStore } from '../lib/store';
import { SearchResults, RecommendationsResponse } from '../types';

// Safely access environment variables
const getEnv = (key: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (import.meta as any).env[key];
  }
  return '';
};

export const CLIENT_ID = getEnv('VITE_SPOTIFY_CLIENT_ID');
export const REDIRECT_URI = window.location.origin + "/"; 
const BASE_URL = "https://api.spotify.com/v1";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-read-playback-state",
  "user-top-read",
  "user-modify-playback-state",
  "playlist-read-private",
  "user-library-read"
];

// --- PKCE Auth Helpers ---

const generateRandomString = (length: number) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export const redirectToAuthCodeFlow = async () => {
  if (!CLIENT_ID) {
    alert("VITE_SPOTIFY_CLIENT_ID 환경 변수가 설정되지 않았습니다. .env 파일을 확인하거나 Vercel 환경 변수를 설정해주세요.");
    return;
  }

  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  window.localStorage.setItem('code_verifier', codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: REDIRECT_URI,
  });

  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
};

export const getAccessToken = async (code: string) => {
  const codeVerifier = window.localStorage.getItem('code_verifier');

  if (!codeVerifier) {
    throw new Error("Code verifier not found");
  }

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  };

  const response = await fetch(TOKEN_ENDPOINT, payload);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error_description || "Failed to fetch token");
  }

  return data;
};

export const refreshAccessToken = async () => {
  const refreshToken = useStore.getState().refreshToken;

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  };

  const response = await fetch(TOKEN_ENDPOINT, payload);
  const data = await response.json();
  
  if (!response.ok) {
     useStore.getState().logout();
     throw new Error("Failed to refresh token");
  }

  useStore.getState().setAuth(
    data.access_token, 
    data.refresh_token || refreshToken, 
    data.expires_in
  );

  return data.access_token;
};

// --- API Fetcher with Auto-Refresh ---

const fetchFromSpotify = async (endpoint: string, options: RequestInit = {}) => {
  let token = useStore.getState().token;
  const expiresAt = useStore.getState().expiresAt;

  if (expiresAt && Date.now() > expiresAt - 60000) {
    try {
      token = await refreshAccessToken();
    } catch (e) {
      useStore.getState().logout();
      throw new Error("Session expired");
    }
  }
  
  if (!token) {
    throw new Error("No access token found");
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    try {
      token = await refreshAccessToken();
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      useStore.getState().logout();
      throw new Error("Session expired");
    }
  }

  if (!response.ok) {
    throw new Error(`Spotify API Error: ${response.statusText}`);
  }

  return response.json();
};

export const fetchUserProfile = () => fetchFromSpotify('/me');
export const fetchNewReleases = () => fetchFromSpotify('/browse/new-releases?limit=10');
export const fetchFeaturedPlaylists = () => fetchFromSpotify('/browse/featured-playlists?limit=8');
export const fetchUserPlaylists = () => fetchFromSpotify('/me/playlists?limit=20');
export const fetchTopTracks = () => fetchFromSpotify('/me/top/tracks?limit=10&time_range=short_term');

export const searchTracks = (query: string, limit = 10): Promise<SearchResults> => {
  if (!query) return Promise.resolve({});
  return fetchFromSpotify(`/search?q=${encodeURIComponent(query)}&type=track,artist&limit=${limit}`);
};

export const getRecommendations = (seedTracks: string[], limit = 10): Promise<RecommendationsResponse> => {
  if (seedTracks.length === 0) return Promise.resolve({ seeds: [], tracks: [] });
  const seeds = seedTracks.slice(0, 5).join(','); 
  return fetchFromSpotify(`/recommendations?seed_tracks=${seeds}&limit=${limit}`);
};