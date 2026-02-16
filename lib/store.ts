import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';

export type ViewType = 'dashboard' | 'search' | 'dj';

interface AppState extends AuthState {
  currentTrack: string | null; // Track ID
  isPlaying: boolean;
  currentView: ViewType;
  setCurrentTrack: (trackId: string | null) => void;
  togglePlay: () => void;
  setView: (view: ViewType) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
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
      
      currentTrack: null,
      isPlaying: false,
      currentView: 'dashboard',
      setCurrentTrack: (trackId) => set({ currentTrack: trackId, isPlaying: !!trackId }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setView: (view) => set({ currentView: view }),
    }),
    {
      name: 'melody-flow-storage',
      partialize: (state) => ({ 
        token: state.token,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        currentView: state.currentView
      }),
    }
  )
);