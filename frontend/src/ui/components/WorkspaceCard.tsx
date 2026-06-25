import { Download, Pencil, Pin, PinOff } from 'lucide-react';
import { ICON_MAP } from '@/consts/consts';
import type { Workspace } from '@/types/workspace.type';

export type WorkspaceCardProps = {
  workspace: Workspace;
  onTogglePin: (id: string) => void;
  onEdit: (workspace: Workspace) => void;
  onDownload: (workspace: Workspace) => void;
};

export function WorkspaceCard({ workspace, onTogglePin, onEdit, onDownload }: WorkspaceCardProps) {
  const { id, name, fileCount, icon, color, pinned } = workspace;
  const Icon = ICON_MAP[icon];

  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl bg-card p-4 text-left shadow-sm transition-all hover:bg-accent hover:shadow-md active:scale-[0.98]">
      <div className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-xl bg-accent shadow-sm">
          <Icon className="size-4 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
        </div>
      </div>

      {/* Pin toggle */}
      <button
        className="absolute top-3 right-8 rounded-lg p-1 opacity-0 transition-all group-hover:opacity-100 text-muted-foreground hover:text-primary"
        onClick={(e) => { e.stopPropagation(); onTogglePin(id); }}
        aria-label={pinned ? `Unpin ${name}` : `Pin ${name}`}
      >
        {pinned ? <Pin className="size-3.5 text-primary" /> : <PinOff className="size-3.5" />}
      </button>

      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{fileCount} files</p>
      </div>

      {/* Download */}
      <button
        className="absolute bottom-3 right-11 rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        onClick={(e) => { e.stopPropagation(); onDownload(workspace); }}
        aria-label={`Download ${name}`}
      >
        <Download className="size-3.5" />
      </button>

      {/* Edit */}
      <button
        className="absolute bottom-3 right-3 rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        onClick={(e) => { e.stopPropagation(); onEdit(workspace); }}
        aria-label={`Edit ${name}`}
      >
        <Pencil className="size-3.5" />
      </button>
    </div>
  );
}
