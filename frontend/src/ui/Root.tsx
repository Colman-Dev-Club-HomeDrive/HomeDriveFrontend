import { SocketProvider } from '@/sockets/SocketProvider';
import { useMemo } from 'react';
import { Outlet } from 'react-router';
import { SideBarLogo } from '@/ui/components/sidebar/SIdeBarLogo';
import { SideBarNavLinks } from '@/ui/components/sidebar/SideBarNavLinks/SideBarNavLinks';
import { SettingsNavLink } from '@/ui/components/sidebar/SideBarFooter/SettingsNavLink';
import { Avatar } from '@/ui/components/sidebar/SideBarFooter/Avatar';
import { AppHeader } from '@/ui/components/AppHeader/AppHeader';
import { FileUploadProvider, useFileUpload } from '@/hooks/useFileUpload';
import { UploadProgressToast } from '@/ui/components/UploadProgressToast';
import { detectDropSource } from '@/utils/detectDropSource';

function RootLayout() {
  const { handleDragEnter, handleDragLeave, handleDrop } = useFileUpload();
  // insert urls to create a socket connection to here
  const socketUrls = useMemo(() => [], []);

  return (
    <SocketProvider urls={socketUrls}>
      <div
        className="flex h-screen overflow-hidden"
        onDragEnter={(e) => { e.preventDefault(); handleDragEnter(); }}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const source = detectDropSource(e.dataTransfer.items);
          handleDrop(e.dataTransfer.files, source);
        }}
      >
        <aside className="flex h-screen w-14 flex-col items-center border-r border-border bg-card transition-all duration-300 hover:w-52">
          <SideBarLogo />
          <SideBarNavLinks />
          <div className="flex w-full flex-col gap-1 px-2 pb-4">
            <SettingsNavLink />
            <Avatar />
          </div>
        </aside>
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>
      <UploadProgressToast />
    </SocketProvider>
  );
}

export function Root() {
  return (
    <FileUploadProvider>
      <RootLayout />
    </FileUploadProvider>
  );
}
