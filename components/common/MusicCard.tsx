import React from 'react';
import { SpotifyTrack } from '../../types';
import { Card, CardContent } from '../ui/card';
import { RequestButton } from './RequestButton';
import { Play } from 'lucide-react';
import { formatDuration } from '../../lib/utils';

interface MusicCardProps {
  track: SpotifyTrack;
}

export const MusicCard: React.FC<MusicCardProps> = ({ track }) => {
  return (
    <Card className="bg-[#18181b] border-none group hover:bg-[#27272a] transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="relative aspect-square mb-4 rounded-md overflow-hidden shadow-lg bg-zinc-800">
          <img 
            src={track.album.images[0]?.url || 'https://via.placeholder.com/300'} 
            alt={track.name} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
             <div className="bg-white rounded-full p-3 shadow-xl hover:scale-110 transition-transform">
                <Play className="h-6 w-6 fill-black text-black ml-1" />
             </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col gap-1 mb-3">
          <h3 className="font-bold text-white truncate text-base" title={track.name}>
            {track.name}
          </h3>
          <p className="text-sm text-zinc-400 truncate hover:underline">
            {track.artists.map(a => a.name).join(', ')}
          </p>
          <span className="text-xs text-zinc-500 mt-auto pt-2">
            {formatDuration(track.duration_ms)}
          </span>
        </div>

        <div className="pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
           <div className="w-full flex justify-center">
             <RequestButton track={track} />
           </div>
        </div>
      </CardContent>
    </Card>
  );
};