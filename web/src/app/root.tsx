import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './global.css';
// @ts-ignore
import { LoadFonts } from 'virtual:load-fonts.jsx';
import { HotReloadIndicator } from '../__create/HotReload';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { useRef } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function AppRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <Meta />
      <Links />
      <LoadFonts />
      <Outlet />
      <HotReloadIndicator />
      <Toaster position="bottom-right" />
      <ScrollRestoration />
      <Scripts />
    </QueryClientProvider>
  );
}

const healthyResponseType = 'sandbox:web:healthcheck:response';

function useHmrConnection(): boolean {
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    if (import.meta.hot) {
      const handleStatus = (status: string) => {
        setConnected(status === 'idle' || status === 'apply');
      };
      import.meta.hot.on?.('vite:beforeUpdate', () => handleStatus('apply'));
      import.meta.hot.on?.('vite:afterUpdate', () => handleStatus('idle'));
      import.meta.hot.on?.('vite:error', () => handleStatus('error'));

      return () => {
        import.meta.hot?.off?.('vite:beforeUpdate', () => handleStatus('apply'));
        import.meta.hot?.off?.('vite:afterUpdate', () => handleStatus('idle'));
        import.meta.hot?.off?.('vite:error', () => handleStatus('error'));
      };
    }
  }, []);

  return connected;
}

const useHandshakeParent = () => {
  const isHmrConnected = useHmrConnection();
  useEffect(() => {
    const healthyResponse = {
      type: healthyResponseType,
      healthy: isHmrConnected,
    };
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sandbox:web:healthcheck') {
        window.parent.postMessage(healthyResponse, '*');
      }
    };
    window.addEventListener('message', handleMessage);
    window.parent.postMessage(healthyResponse, '*');
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isHmrConnected]);
};

