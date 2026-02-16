import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '../ui/button';
import { AlertTriangle, RefreshCcw, LogIn } from 'lucide-react';
import { useStore } from '../../lib/store';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const { logout } = useStore();
  const isAuthError = error.message.includes("Session expired") || error.message.includes("token");

  const handleReset = () => {
    if (isAuthError) {
      logout();
      window.location.href = '/'; // Hard reset to clear state cleanly
    } else {
      resetErrorBoundary();
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#09090b] text-white p-6 text-center">
      <div className="bg-red-500/10 p-4 rounded-full mb-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-xl font-bold mb-2">오류가 발생했습니다</h2>
      <p className="text-zinc-400 mb-6 max-w-md text-sm">
        {isAuthError 
          ? "로그인 세션이 만료되었습니다. 다시 로그인해주세요." 
          : error.message || "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}
      </p>
      
      <Button 
        onClick={handleReset}
        className="gap-2 bg-white text-black hover:bg-zinc-200"
      >
        {isAuthError ? (
          <>
            <LogIn className="h-4 w-4" />
            다시 로그인
          </>
        ) : (
          <>
            <RefreshCcw className="h-4 w-4" />
            다시 시도
          </>
        )}
      </Button>
    </div>
  );
};

export const GlobalErrorBoundary = ({ children }: { children?: React.ReactNode }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};