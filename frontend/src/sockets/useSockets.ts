import { useCallback, useContext } from 'react';
import { SocketsContext } from '@/sockets/socketContext';
import type { AppSocket, SocketsContextValue } from '@/sockets/types';

export function useSockets() {
  const sockets = useContext<SocketsContextValue | null>(SocketsContext);
  if (!sockets) throw new Error('useSockets must be used within <SocketProvider />');

  const getSocket = useCallback((url: string): AppSocket | undefined => sockets[url], [sockets]);

  return { sockets, getSocket };
}
