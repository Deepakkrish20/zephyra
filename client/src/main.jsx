import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
            padding: '12px 18px',
          },
          success: {
            iconTheme: {
              primary: '#71eb44',
              secondary: '#123307',
            },
            style: {
              border: '1px solid rgba(113, 235, 68, 0.25)',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 15px -3px rgba(113, 235, 68, 0.15)',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#450a0a',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.25)',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 15px -3px rgba(239, 68, 68, 0.15)',
            },
          },
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
