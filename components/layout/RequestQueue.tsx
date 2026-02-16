import React from 'react';
import { MoreHorizontal, User, Music2, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RequestItem {
  id: number;
  title: string;
  artist: string;
  user: string;
  status: 'PENDING' | 'PLAYED';
  time: string;
  cover: string;
}

const MOCK_REQUESTS: RequestItem[] = [
  { id: 2, title: "I AM", artist: "IVE", user: "Wonyoung_1004", status: "PENDING", time: "방금 전", cover: "https://picsum.photos/50/50?random=1" },
  { id: 3, title: "Spicy", artist: "aespa", user: "Karina_Luv", status: "PENDING", time: "2분 전", cover: "https://picsum.photos/50/50?random=2" },
  { id: 4, title: "Super Shy", artist: "NewJeans", user: "Bunnies_01", status: "PENDING", time: "5분 전", cover: "https://picsum.photos/50/50?random=3" },
  { id: 5, title: "UNFORGIVEN", artist: "LE SSERAFIM", user: "Fearless", status: "PENDING", time: "8분 전", cover: "https://picsum.photos/50/50?random=4" },
  { id: 6, title: "Queencard", artist: "(G)I-DLE", user: "Neverland", status: "PENDING", time: "12분 전", cover: "https://picsum.photos/50/50?random=5" },
  { id: 1, title: "Ditto", artist: "NewJeans", user: "Hanni_Pham", status: "PLAYED", time: "10분 전", cover: "https://picsum.photos/50/50?random=6" },
  { id: 7, title: "Hype Boy", artist: "NewJeans", user: "Attention", status: "PLAYED", time: "25분 전", cover: "https://picsum.photos/50/50?random=7" },
  { id: 8, title: "Love Dive", artist: "IVE", user: "DIVE_Into", status: "PLAYED", time: "30분 전", cover: "https://picsum.photos/50/50?random=8" },
];

export const RequestQueue = () => {
  return (
    <div className="flex flex-col h-full w-full bg-[#121212] text-foreground">
      <div className="p-4 pt-6 pb-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Music2 className="w-5 h-5 text-primary" />
            신청곡 대기열
            </h2>
            <MoreHorizontal className="text-zinc-400 w-5 h-5 cursor-pointer hover:text-white" />
        </div>
        
        <div className="flex gap-2">
             <button className="px-3 py-1.5 rounded-full bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700 transition-colors">전체 목록</button>
             <button className="px-3 py-1.5 rounded-full bg-transparent text-zinc-400 text-xs font-semibold hover:bg-zinc-800 hover:text-white transition-colors border border-zinc-700">대기중</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 pb-24">
        {MOCK_REQUESTS.map((req) => (
          <div key={req.id} className="group flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800/50 transition-colors cursor-default mb-1">
            <div className="relative flex-shrink-0">
                <img 
                  src={req.cover} 
                  alt={req.title} 
                  className={cn("w-12 h-12 rounded bg-zinc-800 object-cover shadow-sm", req.status === 'PLAYED' && "opacity-40 grayscale")} 
                  loading="lazy" 
                  decoding="async"
                />
                 {req.status === 'PLAYED' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-primary drop-shadow-md" />
                    </div>
                 )}
                 {req.status === 'PENDING' && (
                    <div className="absolute -top-1 -right-1">
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    </div>
                 )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                  <h3 className={cn("font-medium text-sm truncate pr-2", req.status === 'PLAYED' ? "text-zinc-500 line-through decoration-zinc-600" : "text-zinc-100")}>
                    {req.title}
                  </h3>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {req.time}
                  </span>
              </div>
              <p className="text-xs text-zinc-400 truncate mb-1">{req.artist}</p>
              <div className="flex items-center gap-1.5 bg-zinc-800/50 w-fit px-1.5 py-0.5 rounded text-[10px]">
                 <User className="w-3 h-3 text-zinc-400" />
                 <span className="text-zinc-400 font-medium">{req.user}</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="p-4 mt-6 mx-2 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg text-center border border-white/5">
            <p className="text-xs text-zinc-300 font-medium mb-3">듣고 싶은 노래가 있나요?</p>
            <button className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full hover:scale-105 transition-transform shadow-lg">
                신청곡 추가하기
            </button>
        </div>
      </div>
    </div>
  );
};