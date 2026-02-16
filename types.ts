export interface SpotifyUser {
  id: string;
  display_name: string;
  images: { url: string }[];
  product: string;
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images?: SpotifyImage[];
  genres?: string[];
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
  release_date: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  owner: { display_name: string };
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface PlaybackState {
  device: SpotifyDevice;
  repeat_state: string;
  shuffle_state: boolean;
  context: {
    type: string;
    href: string;
    external_urls: { spotify: string };
    uri: string;
  } | null;
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: SpotifyTrack | null;
  currently_playing_type: string;
  actions: {
    disallows: {
      resuming?: boolean;
    };
  };
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // Timestamp in milliseconds
  setAuth: (token: string, refreshToken: string, expiresIn: number) => void;
  logout: () => void;
}

export interface SearchResults {
  tracks?: {
    items: SpotifyTrack[];
  };
  artists?: {
    items: SpotifyArtist[];
  };
  albums?: {
    items: SpotifyAlbum[];
  };
  playlists?: {
    items: SpotifyPlaylist[];
  };
}

export interface RecommendationsResponse {
  seeds: {
    initialPoolSize: number;
    afterFilteringSize: number;
    afterRelinkingSize: number;
    id: string;
    type: string;
    href: string | null;
  }[];
  tracks: SpotifyTrack[];
}

// Database Models
export type RequestStatus = 'PENDING' | 'PLAYED' | 'REJECTED';

export interface Profile {
  id: string;
  username: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface SongRequest {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  status: RequestStatus;
  createdAt: string;
  profileId: string;
  profile?: Profile;
  _count?: {
    likes: number;
  };
}

export interface SongLike {
  id: string;
  profileId: string;
  requestId: string;
  createdAt: string;
}