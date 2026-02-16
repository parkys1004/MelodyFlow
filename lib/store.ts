import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';
import { encryptData, decryptData } from './utils';

export type ViewType = 'dashboard' | 'search' | 'dj';

interface ApiConfig {
  spotifyClientId: string;
  spotifyClientSecret: string; // Added for storage convenience
  supabaseUrl: string;
  supabaseKey: string;
}

interface AppState extends AuthState {
  // API Config
  apiConfig: ApiConfig;
  setApiConfig: (config: Partial<ApiConfig>) => void;

  // App State
  currentTrack: string | null; // Track ID
  isPlaying: boolean;
  currentView: ViewType;
  setCurrentTrack: (trackId: string | null) => void;
  togglePlay: () => void;
  setView: (view: ViewType) => void;
  
  // UI State
  isSettingsOpen: boolean;
  toggleSettings: (isOpen: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth State
      token: null,
      refreshToken: null,
      expiresAt: null,
      
      setAuth: (token, refreshToken, expiresIn) => {
        const expiresAt = Date.now() + expiresIn * 1000;
        set({ token, refreshToken, expiresAt });
      },
      
      logout: () => set({ 
        token: null, 
        refreshToken: null, 
        expiresAt: null, 
        currentTrack: null, 
        isPlaying: false 
      }),

      // API Config State
      apiConfig: {
        spotifyClientId: '',
        spotifyClientSecret: '',
        supabaseUrl: '',
        supabaseKey: '',
      },
      setApiConfig: (config) => set((state) => ({ 
        apiConfig: { ...state.apiConfig, ...config } 
      })),
      
      // App State
      currentTrack: null,
      isPlaying: false,
      currentView: 'dashboard',
      setCurrentTrack: (trackId) => set({ currentTrack: trackId, isPlaying: !!trackId }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setView: (view) => set({ currentView: view }),

      // UI State
      isSettingsOpen: false,
      toggleSettings: (isOpen) => set({ isSettingsOpen: isOpen }),
    }),
    {
      name: 'melody-flow-storage',
      partialize: (state) => ({ 
        token: state.token,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        currentView: state.currentView,
        // Encrypt sensitive config before persisting to local storage
        apiConfig: {
          spotifyClientId: encryptData(state.apiConfig.spotifyClientId),
          spotifyClientSecret: encryptData(state.apiConfig.spotifyClientSecret),
          supabaseUrl: encryptData(state.apiConfig.supabaseUrl),
          supabaseKey: encryptData(state.apiConfig.supabaseKey),
        }
      }),
      // Decrypt on rehydration
      onRehydrateStorage: () => (state) => {
        if (state && state.apiConfig) {
          state.apiConfig.spotifyClientId = decryptData(state.apiConfig.spotifyClientId);
          state.apiConfig.spotifyClientSecret = decryptData(state.apiConfig.spotifyClientSecret);
          state.apiConfig.supabaseUrl = decryptData(state.apiConfig.supabaseUrl);
          state.apiConfig.supabaseKey = decryptData(state.apiConfig.supabaseKey);
        }
      }
    }
  )
);