import { cn } from '@/shadcn/lib/utils';

export type WorkspaceViewTab = 'files' | 'code';

type WorkspaceViewTabsProps = {
  activeTab: WorkspaceViewTab;
  onTabChange: (tab: WorkspaceViewTab) => void;
};

const TABS: { id: WorkspaceViewTab; label: string }[] = [
  { id: 'files', label: 'Files' },
  { id: 'code', label: 'Code' },
];

export function WorkspaceViewTabs({ activeTab, onTabChange }: WorkspaceViewTabsProps) {
  return (
    <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
