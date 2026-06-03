import { File, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ActivityItem = {
  id: string;
  name: string;
  timestamp: Date;
  sizeLabel: string;
  icon: 'file' | 'pdf';
};

const RECENT: ActivityItem[] = [
  { id: '1', name: 'auth_service.java', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), sizeLabel: '15 KB', icon: 'file' },
  { id: '2', name: 'security_clearance.pdf', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), sizeLabel: '2.4 MB', icon: 'pdf' },
  { id: '3', name: 'dashboard_mockup.fig', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), sizeLabel: '8.1 MB', icon: 'file' },
];

const ICON_MAP = {
  file: File,
  pdf: FileText,
};

function formatTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 24) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffHours < 48) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

export function RecentActivity() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold">Recent Activity</h2>
      <div className="flex flex-col rounded-2xl bg-card shadow-sm overflow-hidden">
        {RECENT.map(({ id, name, timestamp, sizeLabel, icon }, i) => {
          const Icon = ICON_MAP[icon];
          return (
            <button
              key={id}
              className={`flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-secondary active:scale-[0.99] ${
                i !== RECENT.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{formatTime(timestamp)}</span>
              </div>
              <span className="text-sm text-muted-foreground">{sizeLabel}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
