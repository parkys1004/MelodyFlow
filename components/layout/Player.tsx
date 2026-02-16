import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2, ListMusic } from 'lucide-react';
import { useStore } from '../../lib/store';
import { cn } from '../../lib/utils';

export const Player = () => {
  const { isPlaying, togglePlay } = useStore();

  return (
    <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 h-14 md:h-24 bg-[#09090b] md:bg-black border-t border-white/10 md:border-border px-4 flex items-center justify-between z-50 transition-all duration-300">
      {/* Track Info */}
      <div className="flex items-center flex-1 min-w-0 gap-3 md:gap-4 md:w-1/3">
        <div className="h-10 w-10 md:h-14 md:w-14 bg-zinc-800 rounded flex-shrink-0 flex items-center justify-center text-muted-foreground overflow-hidden">
           {/* Placeholder Image or Album Art */}
           <Music2Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <p className="text-sm font-medium hover:underline cursor-pointer truncate text-white">재생 중인 곡 없음</p>
          <p className="text-xs text-zinc-400 hover:underline cursor-pointer truncate">아티스트</p>
        </div>
      </div>

      {/* Mobile Play Button (Right aligned in flex-1 context implies separate div usually, but here we use justify-between) */}
      <div className="md:hidden flex items-center mr-2">
         <button 
            onClick={togglePlay}
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-black text-black" />
            ) : (
              <Play className="h-4 w-4 fill-black text-black ml-0.5" />
            )}
          </button>
      </div>

      {/* Desktop Controls (Center) */}
      <div className="hidden md:flex flex-col items-center w-1/3 gap-2">
        <div className="flex items-center gap-6">
          <button className="text-muted-foreground hover:text-white transition-colors">
            <Shuffle className="h-4 w-4" />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <SkipBack className="h-5 w-5 fill-current" />
          </button>
          <button 
            onClick={togglePlay}
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-black text-black" />
            ) : (
              <Play className="h-5 w-5 fill-black text-black ml-0.5" />
            )}
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <SkipForward className="h-5 w-5 fill-current" />
          </button>
          <button className="text-muted-foreground hover:text-white transition-colors">
            <Repeat className="h-4 w-4" />
          </button>
        </div>
        <div className="w-full max-w-md flex items-center gap-2 text-xs text-muted-foreground">
          <span>0:00</span>
          <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden group cursor-pointer">
            <div className="h-full w-0 bg-white rounded-full group-hover:bg-green-500"></div>
          </div>
          <span>0:00</span>
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
             <div className="h-full w-1/2 bg-white rounded-full group-hover:bg-green-500"></div>
          </div>
        </div>
      </div>
      
      {/* Mobile Progress Bar (Optional, positioned at top of player) */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-[2px] bg-zinc-800">
         <div className="h-full w-0 bg-white"></div>
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