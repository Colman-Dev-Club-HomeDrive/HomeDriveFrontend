import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SocketsContext, SocketStatusesContext } from '@/sockets/socketContext';
import type { AppSocket, SocketStatus } from '@/sockets/types';

type SocketProviderProps = {
  children: React.ReactNode;
  urls: string[];
};

function isSocketDebugEnabled(): boolean {
  try {
    return localStorage.getItem('debugSockets') === '1' || import.meta.env.DEV;
  } catch {
    return import.meta.env.DEV;
  }
}

function socketDebugLog(...args: unknown[]) {
  if (!isSocketDebugEnabled()) return;
  console.log('[socket-provider]', ...args);
}

export function SocketProvider({ urls, children }: SocketProviderProps) {
  const [sockets, setSockets] = useState<Record<string, AppSocket>>({});
  const [statuses, setStatuses] = useState<Record<string, SocketStatus>>({});
  const createdRef = useRef<Record<string, AppSocket>>({});

  const initSockets = useEffectEvent(() => {
    const token = localStorage.getItem('token') ?? undefined;
    socketDebugLog('init', { urls, hasToken: Boolean(token), tokenLength: token?.length ?? 0 });
    const created: Record<string, AppSocket> = {};
    const initialStatus: Record<string, SocketStatus> = {};
    for (const url of urls) {
      const isSecureSocketUrl = url.startsWith('https://') || url.startsWith('wss://');
      created[url] = io(url, {
        auth: token ? { token } : undefined,
        transports: ['websocket'],
        withCredentials: true,
        secure: isSecureSocketUrl,
        reconnection: true,
        reconnectionAttempts: Infinity,
        autoConnect: false,
        timeout: 10_000,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
      initialStatus[url] = 'disconnected';
    }

    createdRef.current = created;

    const updateStatus = (url: string, next: SocketStatus) => {
      setStatuses((prev) => (prev[url] === next ? prev : { ...prev, [url]: next }));
    };

    for (const [url, socket] of Object.entries(createdRef.current)) {
      socket.on('connect', () => {
        updateStatus(url, 'connected');
        socketDebugLog('connect', { url, socketId: socket.id, authPresent: Boolean(socket.auth) });
      });

      socket.on('disconnect', (reason) => {
        updateStatus(url, 'disconnected');
        socketDebugLog('disconnect', { url, socketId: socket.id, reason });
      });

      socket.on('connect_error', (error) => {
        const latestToken = localStorage.getItem('token') ?? undefined;
        socket.auth = latestToken ? { token: latestToken } : {};
        updateStatus(url, 'error');
        socketDebugLog('connect_error', {
          url,
          message: error.message,
          socketId: socket.id,
          refreshedAuth: Boolean(latestToken),
        });
      });
    }

    setStatuses(initialStatus);
    setSockets(created);
    Object.entries(created).forEach(([url, socket]) => {
      socket.connect();
      socketDebugLog('connecting', { url, secure: socket.io.opts.secure, hasAuth: Boolean(socket.auth) });
      updateStatus(url, 'connecting');
    });
  });

  const cleanupSockets = useEffectEvent(() => {
    Object.values(createdRef.current).forEach((s) => {
      s.off('connect');
      s.off('disconnect');
      s.off('connect_error');
      s.disconnect();
    });
    createdRef.current = {};
  });

  useEffect(() => {
    if (!urls.length) return;
    initSockets();
    return () => cleanupSockets();
  }, [urls]);

  return (
    <SocketsContext.Provider value={sockets}>
      <SocketStatusesContext.Provider value={statuses}>{children}</SocketStatusesContext.Provider>
    </SocketsContext.Provider>
  );
}
