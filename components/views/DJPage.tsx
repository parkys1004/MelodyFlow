import React, { useEffect, useState } from 'react';
import { getSupabaseClient, fetchSongRequests, updateRequestStatus, isSupabaseConfigured } from '../../lib/supabase';
import { RequestStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../ui/button';
import { Check, X, Clock, Loader2, ListMusic, Settings } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { useStore } from '../../lib/store';

export const DJPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleSettings } = useStore();
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await fetchSongRequests();
        setRequests(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [configured]); // Reload if configuration changes

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel('public:requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRequests((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRequests((prev) => 
              prev.map((item) => item.id === payload.new.id ? payload.new : item)
            );
          } else if (payload.eventType === 'DELETE') {
             setRequests((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [configured]);

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    try {
      setRequests((prev) => prev.map(r => r.id === id ? { ...r, status } : r));
      await updateRequestStatus(id, status);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const historyRequests = requests.filter(r => r.status !== 'PENDING');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-36 md:pb-24 min-h-full bg-[#09090b] text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
             <ListMusic className="h-6 w-6 md:h-8 md:w-8 text-primary" />
             DJ Dashboard
           </h1>
           <p className="text-sm md:text-base text-zinc-400 mt-1">실시간으로 들어오는 신청곡을 관리하세요.</p>
        </div>
        <div className="bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700 self-start md:self-auto">
           <span className="text-sm text-zinc-400">대기 중인 곡</span>
           <p className="text-xl md:text-2xl font-bold text-primary text-center">{pendingRequests.length}</p>
        </div>
      </div>

      {!configured && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded mb-6 text-sm flex items-center justify-between">
           <span>Supabase API Key가 설정되지 않았습니다. 실제 데이터 저장을 위해 설정이 필요합니다.</span>
           <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black" onClick={() => toggleSettings(true)}>
             <Settings className="h-3 w-3 mr-2" />
             키 설정하기
           </Button>
        </div>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
             </span>
             대기열
          </h2>
          <div className="grid gap-3">
            {pendingRequests.length === 0 ? (
               <div className="text-center py-10 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
                 <p className="text-zinc-500">대기 중인 신청곡이 없습니다.</p>
               </div>
            ) : (
              pendingRequests.map((req) => (
                <RequestItem 
                  key={req.id} 
                  request={req} 
                  onStatusChange={handleStatusChange} 
                />
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg md:text-xl font-bold mb-4 text-zinc-400">처리 완료</h2>
          <div className="grid gap-2 opacity-60">
             {historyRequests.map((req) => (
                <RequestItem 
                  key={req.id} 
                  request={req} 
                  onStatusChange={handleStatusChange} 
                  readonly
                />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
};

interface RequestItemProps {
  request: any;
  onStatusChange: (id: string, status: RequestStatus) => Promise<void> | void;
  readonly?: boolean;
}

const RequestItem: React.FC<RequestItemProps> = ({ request, onStatusChange, readonly = false }) => {
   return (
    <Card className={cn(
        "bg-[#18181b] border-zinc-800 transition-all duration-300 hover:border-zinc-700",
        !readonly && "hover:scale-[1.01] hover:bg-[#202022] hover:shadow-lg"
    )}>
      <CardContent className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
        <div className="h-12 w-12 md:h-14 md:w-14 rounded-md overflow-hidden bg-zinc-800 shadow-md flex-shrink-0 relative group">
           <img 
             src={request.cover_url} 
             alt={request.title} 
             className="w-full h-full object-cover" 
             loading="lazy" 
             decoding="async" 
           />
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
            <div className="md:col-span-5 min-w-0">
                <h3 className="font-bold text-white truncate text-sm md:text-base">{request.title}</h3>
                <p className="text-xs md:text-sm text-zinc-400 truncate">{request.artist}</p>
            </div>
            
            <div className="md:col-span-3 flex items-center gap-2">
                 <div className="hidden md:block bg-zinc-800 p-1.5 rounded-full">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.user_name}`} 
                      className="w-4 h-4" 
                      alt="user" 
                      loading="lazy" 
                    />
                 </div>
                 <span className="text-xs md:text-sm text-zinc-300 truncate">{request.user_name}</span>
            </div>

            <div className="hidden md:flex md:col-span-2 text-xs text-zinc-500 items-center gap-1">
               <Clock className="w-3 h-3" />
               {new Date(request.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>

            <div className="md:col-span-2 flex justify-end">
                <StatusBadge status={request.status} className="text-[10px] px-1.5 py-0 md:text-xs md:px-2.5 md:py-0.5" />
            </div>
        </div>

        {!readonly && (
            <div className="flex flex-col md:flex-row items-center gap-2 pl-2 md:pl-4 border-l border-zinc-700 ml-2">
                <Button 
                   size="icon" 
                   className="h-7 w-7 md:h-9 md:w-9 bg-green-500 hover:bg-green-600 text-black rounded-full shadow-lg hover:scale-110 transition-transform"
                   onClick={() => onStatusChange(request.id, 'PLAYED')}
                >
                    <Check className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button 
                   size="icon" 
                   variant="outline"
                   className="h-7 w-7 md:h-9 md:w-9 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-full hover:scale-110 transition-transform hover:border-red-500"
                   onClick={() => onStatusChange(request.id, 'REJECTED')}
                >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
   );
};