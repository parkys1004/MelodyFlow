import React from 'react';
import { Home, Search, Mic2, Library } from 'lucide-react';
import { useStore, ViewType } from '../../lib/store';
import { cn } from '../../lib/utils';

export const BottomNav = () => {
  const { currentView, setView } = useStore();

  const navItems = [
    { id: 'dashboard' as ViewType, label: '홈', icon: Home },
    { id: 'search' as ViewType, label: '검색', icon: Search },
    { id: 'dj' as ViewType, label: 'DJ 모드', icon: Mic2 },
    { id: 'library', label: '보관함', icon: Library }, // Placeholder for now
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#09090b] border-t border-white/10 flex items-center justify-around z-50 pb-safe">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => item.id !== 'library' && setView(item.id as ViewType)}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
            currentView === item.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          <item.icon className={cn("h-6 w-6", currentView === item.id && "fill-current")} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};