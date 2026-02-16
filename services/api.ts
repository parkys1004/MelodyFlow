import { useStore } from '../lib/store';
import { SearchResults, RecommendationsResponse, PlaybackState } from '../types';

// Standardize env var access for Vite
const getEnv = (key: string) => {
  // Check if import.meta.env exists to prevent "Cannot read properties of undefined"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (import.meta as any).env[key] || '';
  }
  return '';
};

// Helper to get Client ID from Store > Env > Fallback
export const getClientId = () => {
  const storeId = useStore.getState().apiConfig.spotifyClientId;
  if (storeId) return storeId;
  return getEnv('VITE_SPOTIFY_CLIENT_ID') || "3c31fcca3a2b4ed89009a4997fc5407c";
};

// Determine Redirect URI dynamically based on environment
export const REDIRECT_URI = window.location.origin + (window.location.origin.endsWith('/') ? '' : '/');

const BASE_URL = "https://api.spotify.com/v1";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SCOPES = [
  "streaming", 
  "user-read-email", 
  "user-read-private",
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
  const clientId = getClientId();
  
  if (!clientId) {
    alert("Spotify Client ID가 설정되지 않았습니다. 설정(⚙️) 메뉴에서 API Key를 등록해주세요.");
    useStore.getState().toggleSettings(true);
    return;
  }

  // Debugging helper
  console.log(`[Spotify Auth] Redirecting with Client ID: ${clientId}`);
  console.log(`[Spotify Auth] Redirect URI: ${REDIRECT_URI}`);

  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  window.localStorage.setItem('code_verifier', codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: REDIRECT_URI,
  });

  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
};

export const getAccessToken = async (code: string) => {
  const codeVerifier = window.localStorage.getItem('code_verifier');
  const clientId = getClientId();

  if (!codeVerifier) throw new Error("Code verifier not found");
  if (!clientId) throw new Error("Client ID not found");

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
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
  const clientId = getClientId();

  if (!refreshToken) throw new Error("No refresh token available");
  if (!clientId) throw new Error("Client ID not found");

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
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

  // Optimistic check for expiration
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

  // Handle Token Expiry (401)
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

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(err.error?.message || `Spotify API Error: ${response.statusText}`);
  }

  return response.json();
};

export const fetchUserProfile = () => fetchFromSpotify('/me');
export const fetchNewReleases = () => fetchFromSpotify('/browse/new-releases?limit=10');
export const fetchFeaturedPlaylists = () => fetchFromSpotify('/browse/featured-playlists?limit=8');
export const fetchUserPlaylists = () => fetchFromSpotify('/me/playlists?limit=20');
export const fetchTopTracks = () => fetchFromSpotify('/me/top/tracks?limit=10&time_range=short_term');

// Player API
export const fetchPlayerState = (): Promise<PlaybackState | null> => fetchFromSpotify('/me/player');

interface PlayOptions {
  context_uri?: string;
  uris?: string[];
  offset?: { position: number } | { uri: string };
  position_ms?: number;
}

export const startResumePlayback = (options: PlayOptions = {}) => {
  return fetchFromSpotify('/me/player/play', { 
    method: 'PUT',
    body: JSON.stringify(options)
  });
};

export const pausePlayback = () => fetchFromSpotify('/me/player/pause', { method: 'PUT' });
export const skipToNext = () => fetchFromSpotify('/me/player/next', { method: 'POST' });
export const skipToPrevious = () => fetchFromSpotify('/me/player/previous', { method: 'POST' });
export const setVolume = (percent: number) => fetchFromSpotify(`/me/player/volume?volume_percent=${percent}`, { method: 'PUT' });
export const transferPlayback = (deviceId: string) => fetchFromSpotify('/me/player', {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [deviceId], play: true })
});

export const searchTracks = (query: string, limit = 10): Promise<SearchResults> => {
  if (!query) return Promise.resolve({});
  return fetchFromSpotify(`/search?q=${encodeURIComponent(query)}&type=track,artist&limit=${limit}`);
};

export const getRecommendations = (seedTracks: string[], limit = 10): Promise<RecommendationsResponse> => {
  if (seedTracks.length === 0) return Promise.resolve({ seeds: [], tracks: [] });
  const seeds = seedTracks.slice(0, 5).join(','); 
  return fetchFromSpotify(`/recommendations?seed_tracks=${seeds}&limit=${limit}`);
};