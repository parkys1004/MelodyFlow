import React, { useEffect } from 'react';
import { useStore } from '../../lib/store';
import { toast } from '../ui/toaster';
import { transferPlayback } from '../../services/api';

// Add types for the SDK
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export const WebPlayback = () => {
  const { token, setApiConfig } = useStore();

  useEffect(() => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'MelodyFlow Web Player',
        getOAuthToken: (cb: (token: string) => void) => { cb(token); },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        
        // Auto-transfer playback to this web browser to enable audio immediately
        transferPlayback(device_id).catch(err => {
             console.log("Could not auto-transfer playback. User might need to select device manually.");
        });
        
        toast.info("웹 플레이어가 준비되었습니다.");
      });

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Initialization Error:', message);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Authentication Error:', message);
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Account Error:', message);
      });

      player.connect();
    };

    return () => {
        // Cleanup if needed
    };
  }, [token]);

  return null; // This component has no UI, it just handles the SDK
};