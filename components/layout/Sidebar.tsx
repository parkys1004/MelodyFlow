import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, Globe, Radio, Mic2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useStore } from '../../lib/store';

export const Sidebar = () => {
  const { currentView, setView } = useStore();

  return (
    <aside className="w-full flex flex-col h-full bg-[#121212] text-zinc-400">
      <div className="p-6 pb-2">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white mb-6 px-2">
          <Globe className="h-6 w-6 text-primary" />
          MelodyFlow
        </h1>
        
        <div className="space-y-1 bg-[#121212] rounded-lg">
          <Button 
            variant="ghost" 
            onClick={() => setView('dashboard')}
            className={cn(
              "w-full justify-start text-base font-bold px-4 h-12 transition-colors",
              currentView === 'dashboard' ? "bg-zinc-800 text-white" : "hover:text-white hover:bg-zinc-800/50"
            )}
          >
            <Home className="mr-4 h-6 w-6" />
            홈
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setView('search')}
            className={cn(
              "w-full justify-start text-base font-bold px-4 h-12 transition-colors",
              currentView === 'search' ? "bg-zinc-800 text-white" : "hover:text-white hover:bg-zinc-800/50"
            )}
          >
            <Search className="mr-4 h-6 w-6" />
            검색하기
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setView('dj')}
            className={cn(
              "w-full justify-start text-base font-bold px-4 h-12 transition-colors",
              currentView === 'dj' ? "bg-zinc-800 text-white" : "hover:text-white hover:bg-zinc-800/50"
            )}
          >
            <Mic2 className="mr-4 h-6 w-6" />
            DJ 모드
          </Button>
        </div>
      </div>

      <div className="flex-1 mx-2 mb-2 bg-[#121212] rounded-lg flex flex-col overflow-hidden">
        <div className="px-4 py-3 shadow-md z-10">
             <Button variant="ghost" className="w-full justify-start text-base font-bold hover:text-white px-2 hover:bg-transparent">
                <Library className="mr-3 h-6 w-6" />
                내 라이브러리
            </Button>
        </div>

        <div className="px-2 space-y-1">
           <Button variant="ghost" className="w-full justify-start text-sm font-medium hover:text-white group px-4">
            <div className="bg-zinc-200 group-hover:bg-white text-black p-1 rounded-sm mr-3">
               <PlusSquare className="h-3 w-3" />
            </div>
            플레이리스트 만들기
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm font-medium hover:text-white group px-4">
             <div className="bg-gradient-to-br from-indigo-600 to-blue-300 opacity-70 group-hover:opacity-100 p-1 rounded-sm mr-3 text-white">
               <Heart className="h-3 w-3 fill-current" />
            </div>
            좋아요 표시한 곡
          </Button>
           <Button variant="ghost" className="w-full justify-start text-sm font-medium text-primary hover:text-primary/80 group px-4 bg-primary/10 mt-2">
            <Radio className="mr-3 h-4 w-4" />
            신청곡 목록
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2 mt-2">
            <div className="flex flex-col space-y-3 text-sm">
                {Array(8).fill(null).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 cursor-pointer hover:bg-zinc-800/50 p-2 rounded transition-colors group">
                        <div className="w-10 h-10 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                            <img 
                              src={`https://picsum.photos/100/100?random=${i}`} 
                              className="w-full h-full object-cover opacity-70 group-hover:opacity-100" 
                              loading="lazy"
                              alt={`Playlist ${i+1}`}
                            />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-white truncate font-medium">My Playlist #{i+1}</p>
                            <p className="text-xs truncate">Playlist • User</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </aside>
  );
};