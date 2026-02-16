import React, { useEffect, useState } from 'react';
import { MoreHorizontal, User, Music2, CheckCircle2, Clock, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getSupabaseClient, fetchSongRequests, isSupabaseConfigured } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { toast } from '../ui/toaster';

interface RequestItem {
  id: string;
  title: string;
  artist: string;
  user_name: string;
  status: 'PENDING' | 'PLAYED' | 'REJECTED';
  created_at: string;
  cover_url: string;
}

export const RequestQueue = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING'>('ALL');
  const configured = isSupabaseConfigured();
  const { toggleSettings } = useStore();

  const loadRequests = async () => {
    if (!configured) return;
    setIsLoading(true);
    try {
      const data = await fetchSongRequests();
      setRequests(data as any || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel('public:requests_queue')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        (payload) => {
           if (payload.eventType === 'INSERT') {
             setRequests((prev) => [payload.new as any, ...prev]);
             toast.info(`새로운 신청곡: ${payload.new.title}`);
           } else if (payload.eventType === 'UPDATE') {
             setRequests((prev) => 
               prev.map((item) => item.id === payload.new.id ? payload.new as any : item)
             );
           }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [configured]);

  const filteredRequests = requests.filter(r => {
      if (filter === 'PENDING') return r.status === 'PENDING';
      return r.status !== 'REJECTED'; // Show Pending and Played in ALL
  });

  const getTimeAgo = (dateStr: string) => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return '방금 전';
      if (mins < 60) return `${mins}분 전`;
      const hours = Math.floor(mins / 60);
      return `${hours}시간 전`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#121212] text-foreground">
      <div className="p-4 pt-6 pb-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Music2 className="w-5 h-5 text-primary" />
            신청곡 대기열
            </h2>
            <button onClick={loadRequests} className="text-zinc-400 hover:text-white transition-colors">
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </button>
        </div>
        
        <div className="flex gap-2">
             <button 
                onClick={() => setFilter('ALL')}
                className={cn("px-3 py-1.5 rounded-full text-xs font-semibold transition-colors", filter === 'ALL' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800")}
            >
                전체 목록
            </button>
             <button 
                onClick={() => setFilter('PENDING')}
                className={cn("px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border", filter === 'PENDING' ? "bg-zinc-800 text-white border-zinc-700" : "bg-transparent text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white")}
            >
                대기중
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 pb-24">
        {!configured && (
             <div className="p-4 text-center text-zinc-500 text-sm">
                <p className="mb-2">API 키 설정이 필요합니다.</p>
                <button onClick={() => toggleSettings(true)} className="underline text-primary">설정하기</button>
             </div>
        )}

        {configured && filteredRequests.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
                <p className="text-sm">신청곡이 없습니다.</p>
                <p className="text-xs mt-1">첫 번째 곡을 신청해보세요!</p>
            </div>
        )}

        {filteredRequests.map((req) => (
          <div key={req.id} className="group flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800/50 transition-colors cursor-default mb-1">
            <div className="relative flex-shrink-0">
                <img 
                  src={req.cover_url || "https://via.placeholder.com/50"} 
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
                    {getTimeAgo(req.created_at)}
                  </span>
              </div>
              <p className="text-xs text-zinc-400 truncate mb-1">{req.artist}</p>
              <div className="flex items-center gap-1.5 bg-zinc-800/50 w-fit px-1.5 py-0.5 rounded text-[10px]">
                 <User className="w-3 h-3 text-zinc-400" />
                 <span className="text-zinc-400 font-medium">{req.user_name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};