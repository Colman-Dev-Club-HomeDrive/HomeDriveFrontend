import { StorageCard } from '@/ui/components/StorageCard';
import { MediaTypesCard } from '@/ui/components/MediaTypesCard';
import { CreateNewCard } from '@/ui/components/CreateNewCard';
import { WorkspacesSection } from '@/ui/components/WorkspacesSection';
import { RecentActivity } from '@/ui/components/RecentActivity';
import { PhotoCollage } from '@/ui/components/PhotoCollage';

// TODO: replace with real user from auth/store
const USER_NAME = 'Tal';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Home() {
  return (
    <div className="mx-auto w-full max-w-7xl flex flex-col gap-6 px-0 py-8 min-h-full bg-background">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {USER_NAME}
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

        {/* Right column */}
        <CreateNewCard />
      </div>

      {/* Workspaces */}
      <WorkspacesSection />

      {/* Recent Activity */}
      <RecentActivity />

      {/* Photo Collage */}
      <PhotoCollage />
    </div>
  );
}
