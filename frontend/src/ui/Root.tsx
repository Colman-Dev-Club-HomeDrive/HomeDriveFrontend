import { SocketProvider } from '@/sockets/SocketProvider';
import { useMemo } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '@/ui/components/Sidebar';

export function Root() {
  // insert urls to create a socket connection to here
  const socketUrls = useMemo(() => [], []);

  // TODO: replace with real user from auth/store
  const user = { id: '1', name: 'Tal' };

  return (
    <SocketProvider urls={socketUrls}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto bg-muted/30">
          <Outlet />
        </main>
      </div>
    </SocketProvider>
  );
}
