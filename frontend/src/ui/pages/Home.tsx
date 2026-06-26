import { useState } from 'react';
import { StorageCard } from '@/ui/components/StorageCard';
import { MediaTypesCard } from '@/ui/components/MediaTypesCard';
import { CreateNewCard } from '@/ui/components/CreateNewCard';
import { WorkspacesSection } from '@/ui/components/ActionMenu/WorkspacesSection';
import { FileBrowserModal } from '@/ui/components/FileBrowserModal';
import { useAppSelector } from '@/store/hooks';
import { useGetMeQuery } from '@/store/apis/auth.api';
import { selectUser } from '@/store/slices/user.slice';
import { getGreeting } from '@/utils/getGreeting';
import { useFileUpload } from '@/hooks/useFileUpload';
import { detectDropSource } from '@/utils/detectDropSource';
import { RecentFilesSection } from '@/ui/components/RecentFilesSection';


export function Home() {
  const { handleDragEnter, handleDragLeave, handleDrop } = useFileUpload();
  const { data: meData } = useGetMeQuery();
  const { name: storeName } = useAppSelector(selectUser);
  const userName = meData?.user?.name || storeName;
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false);
  return (
    <div
      className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 bg-background px-4 py-8 sm:px-6"
      onDragEnter={(e) => {
        e.preventDefault();
        handleDragEnter();
      }}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const source = detectDropSource(e.dataTransfer.items);
        handleDrop(e.dataTransfer.files, source);
      }}
    >
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {getGreeting()}
          {userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">Explore your files and workspaces</p>
      </div>

      {/* Top row: left column (Storage + Media) | right column (Create New) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.6fr]">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <StorageCard usedGb={65} totalGb={100} />
          <MediaTypesCard />
        </div>
        <CreateNewCard
          onIndexFile={() => setFileBrowserOpen(true)}
          onIndexFolder={() => setFileBrowserOpen(true)}
        />
      </div>
      <WorkspacesSection />
      <RecentFilesSection />

      <FileBrowserModal open={fileBrowserOpen} onOpenChange={setFileBrowserOpen} />
    </div>
  );
}
