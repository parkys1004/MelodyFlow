import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';
import { toast } from './components/ui/toaster';

const handleQueryError = (error: unknown) => {
  console.error("Global Query Error:", error);
  const message = error instanceof Error ? error.message : "요청을 처리하는 중 문제가 발생했습니다.";
  
  // Don't show toast for "No access token" as it redirects or shows UI
  if (message !== "No access token found" && !message.includes("Code verifier")) {
    toast.error(message);
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: handleQueryError,
  }),
  mutationCache: new MutationCache({
    onError: handleQueryError,
  }),
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);