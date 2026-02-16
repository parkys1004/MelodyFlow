import React, { useEffect, useState } from 'react';
import { useStore } from './lib/store';
import { redirectToAuthCodeFlow, getAccessToken } from './services/api';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Player } from './components/layout/Player';
import { RequestQueue } from './components/layout/RequestQueue';
import { Dashboard } from './components/views/Dashboard';
import { SearchPage } from './components/views/SearchPage';
import { DJPage } from './components/views/DJPage';
import { Button } from './components/ui/button';
import { LogOut, User, ChevronLeft, ChevronRight, Loader2, Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile } from './services/api';
import { Toaster, toast } from './components/ui/toaster';
import { ApiKeySettings } from './components/common/ApiKeySettings';
import { WebPlayback } from './components/common/WebPlayback';

const App = () => {
  const { token, setAuth, logout, currentView } = useStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      
      if (code) {
        setIsAuthenticating(true);
        try {
          // Exchange code for tokens
          const data = await getAccessToken(code);
          setAuth(data.access_token, data.refresh_token, data.expires_in);
          
          // Clean URL
          window.history.replaceState({}, document.title, "/");
          toast.success("Spotify 연결 성공!");
        } catch (error) {
          console.error("Authentication failed", error);
          toast.error("로그인 실패: Redirect URI 설정을 확인해주세요.");
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    handleAuthCallback();
  }, [setAuth]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUserProfile,
    enabled: !!token,
    retry: false
  });

  const handleLogin = async () => {
    await redirectToAuthCodeFlow();
  };

  if (isAuthenticating) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium animate-pulse">Spotify와 연결 중입니다...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'search':
        return <SearchPage />;
      case 'dj':
        return <DJPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-black text-foreground overflow-hidden font-sans p-0 md:p-2 gap-0 md:gap-2">
      <Toaster />
      <ApiKeySettings />
      {token && <WebPlayback />}
      
      {/* 1. Left Sidebar (Navigation) - Hidden on Mobile */}
      <div className="hidden md:flex w-64 flex-col rounded-lg overflow-hidden h-[calc(100vh-16px-96px)]">
         <Sidebar />
      </div>
      
      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#121212] rounded-none md:rounded-lg overflow-hidden relative h-full md:h-[calc(100vh-16px-96px)]">
        {/* Header (Sticky) */}
        <header className="h-16 bg-[#121212]/95 sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 transition-colors duration-300 backdrop-blur-md border-b border-white/5 md:border-none">
          <div className="flex items-center gap-2">
            {/* Mobile Logo/Menu placeholder */}
            <div className="md:hidden mr-2">
               <Menu className="w-6 h-6 text-zinc-300" />
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex gap-2">
                <button className="bg-black/50 rounded-full p-1 text-zinc-400 hover:text-white transition-colors">
                     <ChevronLeft className="w-6 h-6" />
                </button>
                 <button className="bg-black/50 rounded-full p-1 text-zinc-400 hover:text-white transition-colors">
                     <ChevronRight className="w-6 h-6" />
                </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {!token ? (
                <>
                  <Button variant="ghost" className="hidden md:flex text-zinc-400 hover:text-white font-bold text-base">
                    회원가입
                  </Button>
                  <Button 
                    onClick={handleLogin}
                    className="rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-transform px-6 py-2 md:px-8 md:py-3 h-auto text-sm md:text-base"
                  >
                    로그인
                  </Button>
                </>
             ) : (
                <div className="flex items-center gap-2 bg-black/50 p-1 pr-3 rounded-full hover:bg-black/70 transition-colors cursor-pointer">
                   {user?.images?.[0]?.url ? (
                       <img src={user.images[0].url} alt="Profile" className="h-7 w-7 rounded-full object-cover" loading="lazy" />
                   ) : (
                       <div className="h-7 w-7 bg-zinc-700 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                       </div>
                   )}
                   <span className="text-sm font-bold hidden md:inline-block max-w-[100px] truncate">{user?.display_name || 'User'}</span>
                   <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 text-zinc-400 hover:text-white" onClick={logout} title="Logout">
                      <LogOut className="h-4 w-4" />
                   </Button>
                </div>
             )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {renderContent()}
        </div>
      </main>

      {/* 3. Right Sidebar (Request Queue) - Hidden on Mobile/Tablet */}
      <aside className="hidden xl:flex w-[320px] flex-col rounded-lg overflow-hidden bg-[#121212] h-[calc(100vh-16px-96px)]">
         <RequestQueue />
      </aside>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Bottom Player (Fixed) */}
      <Player />
    </div>
  );
};

export default App;