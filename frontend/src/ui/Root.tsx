import { SocketProvider } from '@/sockets/SocketProvider';
import { useMemo } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '@/ui/components/Sidebar';
import { AppHeader } from '@/ui/components/AppHeader/AppHeader';

export function Root() {
  // insert urls to create a socket connection to here
  const socketUrls = useMemo(() => [], []);

  // TODO: replace with real user from auth/store
  const user = { id: '1', name: 'Tal' };

  return (
    <SocketProvider urls={socketUrls}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>
    </SocketProvider>
  );
}
