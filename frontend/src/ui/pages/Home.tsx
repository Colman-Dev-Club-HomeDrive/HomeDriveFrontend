import { StorageCard } from '@/ui/components/StorageCard';
import { MediaTypesCard } from '@/ui/components/MediaTypesCard';
import { CreateNewCard } from '@/ui/components/CreateNewCard';
import { WorkspacesSection } from '@/ui/components/WorkspacesSection';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/user.slice';
import { getGreeting } from '@/utils/getGreeting';
import { useFileUpload } from '@/hooks/useFileUpload';
import { detectDropSource } from '@/utils/detectDropSource';


export function Home() {
  const { handleDragEnter, handleDragLeave, handleDrop } = useFileUpload();
  const { name } = useSelector(selectUser);
  return (
    <div
      className="mx-auto w-full max-w-7xl flex min-h-full flex-col gap-6 bg-background px-0 py-8"
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
          {getGreeting()}, {name}
        </h1>
        <p className="text-sm text-muted-foreground">Explore your files and workspaces</p>
      </div>

      {/* Top row: left column (Storage + Media) | right column (Create New) */}
      <div className="grid grid-cols-[1fr_1.6fr] gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <StorageCard usedGb={65} totalGb={100} />
          <MediaTypesCard />
        </div>
        <CreateNewCard />
      </div>
      <WorkspacesSection />
    </div>
  );
}
