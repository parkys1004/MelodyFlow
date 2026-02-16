import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedPlaylists, fetchNewReleases, startResumePlayback } from '../../services/api';
import { Card, CardContent } from '../ui/card';
import { generateRandomColor } from '../../lib/utils';
import { Play } from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from '../ui/toaster';

export const Dashboard = () => {
  const { token } = useStore();

  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn: fetchFeaturedPlaylists,
    enabled: !!token,
  });

  const { data: newReleases } = useQuery({
    queryKey: ['newReleases'],
    queryFn: fetchNewReleases,
    enabled: !!token,
  });
  
  const playlists = featured?.playlists?.items || [];
  const albums = newReleases?.albums?.items || [];

  const handlePlay = async (contextUri: string, type: string) => {
      if (!contextUri) return;
      try {
          await startResumePlayback({ context_uri: contextUri });
          toast.success(`${type} 재생을 시작합니다.`);
      } catch (error) {
          console.error(error);
          toast.error("재생할 수 없습니다. 활성화된 기기가 있는지 확인하세요.");
      }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "좋은 아침입니다";
    if (hour < 18) return "즐거운 오후입니다";
    return "편안한 밤 되세요";
  };

  return (
    <div className="p-4 md:p-6 pb-36 md:pb-24 space-y-8 bg-gradient-to-b from-zinc-900 to-black min-h-full">
      <section>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">{greeting()}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {playlists.slice(0, 6).map((playlist: any) => (
            <div 
              key={playlist.id} 
              className="group bg-white/5 hover:bg-white/10 transition-colors rounded overflow-hidden flex items-center gap-3 md:gap-4 cursor-pointer relative"
              onClick={() => handlePlay(playlist.uri, "플레이리스트")}
            >
              <div className={`h-16 w-16 md:h-20 md:w-20 flex-shrink-0 bg-zinc-800 ${!playlist.images?.[0] && generateRandomColor()}`}>
                 {playlist.images?.[0] && (
                   <img 
                     src={playlist.images[0].url} 
                     alt={playlist.name} 
                     className="h-full w-full object-cover shadow-lg" 
                     loading="lazy" 
                     decoding="async" 
                   />
                 )}
              </div>
              <span className="font-bold text-xs md:text-sm lg:text-base line-clamp-2 pr-2 md:pr-4">{playlist.name}</span>
              <div className="hidden md:block ml-auto mr-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                 <div className="bg-green-500 rounded-full p-3 shadow-lg hover:scale-105 transition-transform">
                    <Play className="h-5 w-5 fill-black text-black ml-0.5" />
                 </div>
              </div>
            </div>
          ))}
          {playlists.length === 0 && Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-16 md:h-20 bg-zinc-800/50 rounded animate-pulse" />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold hover:underline cursor-pointer">최신 발매 음악</h2>
          <span className="text-sm font-semibold text-muted-foreground hover:underline cursor-pointer">모두 보기</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {albums.map((album: any) => (
            <Card 
                key={album.id} 
                className="bg-[#18181b] border-none hover:bg-[#27272a] transition-colors group cursor-pointer"
                onClick={() => handlePlay(album.uri, "앨범")}
            >
              <CardContent className="p-3 md:p-4">
                <div className="relative mb-3 md:mb-4">
                  <img 
                    src={album.images?.[0]?.url || `https://picsum.photos/300/300`} 
                    alt={album.name} 
                    className="w-full aspect-square object-cover rounded-md shadow-lg"
                    loading="lazy"
                    decoding="async"
                  />
                   <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                     <div className="bg-green-500 rounded-full p-3 shadow-xl hover:scale-105">
                        <Play className="h-5 w-5 md:h-6 md:w-6 fill-black text-black ml-1" />
                     </div>
                  </div>
                </div>
                <h3 className="font-semibold truncate mb-1 text-white text-sm md:text-base">{album.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                  {album.artists?.map((a: any) => a.name).join(', ')}
                </p>
              </CardContent>
            </Card>
          ))}
          {albums.length === 0 && Array(5).fill(0).map((_, i) => (
             <div key={i} className="space-y-3">
               <div className="aspect-square bg-zinc-800/50 rounded animate-pulse" />
               <div className="h-4 w-3/4 bg-zinc-800/50 rounded animate-pulse" />
             </div>
          ))}
        </div>
      </section>
      
      {!token && (
        <div className="fixed bottom-36 md:bottom-28 right-6 max-w-[calc(100vw-3rem)] md:max-w-sm bg-blue-600 text-white p-4 rounded-lg shadow-2xl animate-bounce z-40">
            <p className="font-bold mb-1">Spotify 연결 필요</p>
            <p className="text-sm">실제 음악을 듣고 신청곡을 보내려면 상단 '로그인' 버튼을 통해 Spotify를 연결해주세요.</p>
        </div>
      )}
    </div>
  );
};