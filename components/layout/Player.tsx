import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2, ListMusic, Music2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { cn, formatDuration } from '../../lib/utils';
import { usePlayerState } from '../../hooks/useSpotify';
import { startResumePlayback, pausePlayback, skipToNext, skipToPrevious } from '../../services/api';

export const Player = () => {
  const { isPlaying, togglePlay: toggleStorePlay } = useStore();
  const { data: playerState } = usePlayerState();
  
  // Sync local store state with remote player state
  useEffect(() => {
    if (playerState) {
      if (playerState.is_playing !== isPlaying) {
        toggleStorePlay();
      }
    }
  }, [playerState?.is_playing]);

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (playerState?.is_playing) {
        await pausePlayback();
        toggleStorePlay(); // Optimistic update
      } else {
        await startResumePlayback();
        toggleStorePlay(); // Optimistic update
      }
    } catch (error) {
      console.error("Playback control error", error);
    }
  };

  const handleNext = async () => {
    try { await skipToNext(); } catch (e) { console.error(e); }
  };

  const handlePrevious = async () => {
    try { await skipToPrevious(); } catch (e) { console.error(e); }
  };

  const currentTrack = playerState?.item;
  const progress = playerState ? (playerState.progress_ms / (playerState.item?.duration_ms || 1)) * 100 : 0;

  return (
    <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 h-14 md:h-24 bg-[#09090b] md:bg-black border-t border-white/10 md:border-border px-4 flex items-center justify-between z-50 transition-all duration-300">
      {/* Track Info */}
      <div className="flex items-center flex-1 min-w-0 gap-3 md:gap-4 md:w-1/3">
        <div className={cn("h-10 w-10 md:h-14 md:w-14 bg-zinc-800 rounded flex-shrink-0 flex items-center justify-center text-muted-foreground overflow-hidden", currentTrack?.album.images[0]?.url && "bg-transparent")}>
           {currentTrack?.album.images[0]?.url ? (
             <img src={currentTrack.album.images[0].url} alt="Album Art" className="h-full w-full object-cover animate-in fade-in" />
           ) : (
             <Music2Icon className="h-5 w-5 md:h-6 md:w-6" />
           )}
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <p className="text-sm font-medium hover:underline cursor-pointer truncate text-white">
            {currentTrack?.name || '재생 중인 곡 없음'}
          </p>
          <p className="text-xs text-zinc-400 hover:underline cursor-pointer truncate">
             {currentTrack?.artists.map(a => a.name).join(', ') || 'Spotify를 연결하세요'}
          </p>
        </div>
      </div>

      {/* Mobile Play Button */}
      <div className="md:hidden flex items-center mr-2">
         <button 
            onClick={handlePlayPause}
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            {playerState?.is_playing ? (
              <Pause className="h-4 w-4 fill-black text-black" />
            ) : (
              <Play className="h-4 w-4 fill-black text-black ml-0.5" />
            )}
          </button>
      </div>

      {/* Desktop Controls (Center) */}
      <div className="hidden md:flex flex-col items-center w-1/3 gap-2">
        <div className="flex items-center gap-6">
          <button className={cn("text-muted-foreground hover:text-white transition-colors", playerState?.shuffle_state && "text-green-500")}>
            <Shuffle className="h-4 w-4" />
          </button>
          <button onClick={handlePrevious} className="text-zinc-400 hover:text-white transition-colors">
            <SkipBack className="h-5 w-5 fill-current" />
          </button>
          <button 
            onClick={handlePlayPause}
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            {playerState?.is_playing ? (
              <Pause className="h-5 w-5 fill-black text-black" />
            ) : (
              <Play className="h-5 w-5 fill-black text-black ml-0.5" />
            )}
          </button>
          <button onClick={handleNext} className="text-zinc-400 hover:text-white transition-colors">
            <SkipForward className="h-5 w-5 fill-current" />
          </button>
          <button className={cn("text-muted-foreground hover:text-white transition-colors", playerState?.repeat_state !== 'off' && "text-green-500")}>
            <Repeat className="h-4 w-4" />
          </button>
        </div>
        <div className="w-full max-w-md flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDuration(playerState?.progress_ms || 0)}</span>
          <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden group cursor-pointer">
            <div 
              className="h-full bg-white rounded-full group-hover:bg-green-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span>{formatDuration(currentTrack?.duration_ms || 0)}</span>
        </div>
      </div>

      {/* Desktop Volume & Extras (Right) */}
      <div className="hidden md:flex items-center justify-end w-1/3 gap-4">
        <button className="text-muted-foreground hover:text-white">
          <Mic2 className="h-4 w-4" />
        </button>
        <button className="text-muted-foreground hover:text-white">
          <ListMusic className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 w-32 group">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden cursor-pointer">
             <div 
               className="h-full bg-white rounded-full group-hover:bg-green-500"
               style={{ width: `${playerState?.device?.volume_percent || 50}%` }}
             ></div>
          </div>
        </div>
      </div>
      
      {/* Mobile Progress Bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-[2px] bg-zinc-800">
         <div className="h-full bg-white" style={{ width: `${progress}%` }}></div>
      </div>
    </footer>
  );
};

// Helper component for icon
const Music2Icon = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
);