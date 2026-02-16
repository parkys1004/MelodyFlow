import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Simple Event Bus for Toast
const listeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];

const notify = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

export const toast = {
  show: (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    toasts = [...toasts, { id, message, type }];
    notify();

    // Auto dismiss
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notify();
    }, 4000);
  },
  success: (message: string) => toast.show(message, 'success'),
  error: (message: string) => toast.show(message, 'error'),
  info: (message: string) => toast.show(message, 'info'),
};

export const Toaster = () => {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.add(setCurrentToasts);
    return () => {
      listeners.delete(setCurrentToasts);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none p-4 md:p-0">
      {currentToasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 p-4 rounded-lg shadow-xl border transition-all duration-300 animate-in slide-in-from-right-full fade-in",
            t.type === 'success' && "bg-zinc-900 border-green-500/30 text-green-500",
            t.type === 'error' && "bg-zinc-900 border-red-500/30 text-red-500",
            t.type === 'info' && "bg-zinc-900 border-blue-500/30 text-blue-500",
          )}
        >
          {t.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
          {t.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
          
          <p className="text-sm font-medium text-white flex-1">{t.message}</p>
          
          <button 
            onClick={() => {
              toasts = toasts.filter((item) => item.id !== t.id);
              notify();
            }}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};