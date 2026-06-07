import { StorageCard } from '@/ui/components/StorageCard';
import { MediaTypesCard } from '@/ui/components/MediaTypesCard';
import { CreateNewCard } from '@/ui/components/CreateNewCard';
import { WorkspacesSection } from '@/ui/components/WorkspacesSection';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/user.slice';
import { getGreeting } from '@/utils/getGreeting';


export function Home() {
  const { name } = useSelector(selectUser);
  return (
    <div className="mx-auto w-full max-w-7xl flex flex-col gap-6 px-0 py-8 min-h-full bg-background">
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
