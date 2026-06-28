import { Download, MoreHorizontal, Pencil, Pin, PinOff, Share2, Trash2 } from 'lucide-react';
import { ICON_MAP } from '@/consts/consts';
import type { Workspace } from '@/types/workspace.type';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';

export type WorkspaceCardProps = {
  workspace: Workspace;
  onOpen: (workspace: Workspace) => void;
  onTogglePin: (id: string) => void;
  onEdit: (workspace: Workspace) => void;
  onShare: (workspace: Workspace) => void;
  onDelete: (workspace: Workspace) => void;
  onDownload: (workspace: Workspace) => void;
  canWrite?: boolean;
};

export function WorkspaceCard({ workspace, onOpen, onTogglePin, onEdit, onShare, onDelete, onDownload, canWrite = true }: WorkspaceCardProps) {
  const { id, name, fileCount, icon, color, pinned } = workspace;
  const Icon = ICON_MAP[icon];

  return (
    <div
      role="button"
      tabIndex={0}
      className="group relative flex flex-col gap-3 rounded-2xl bg-card p-4 text-left shadow-sm transition-all hover:bg-accent hover:shadow-md active:scale-[0.98]"
      onClick={() => onOpen(workspace)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(workspace);
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-xl bg-accent shadow-sm">
          <Icon className="size-4 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
        </div>
      </div>

      {/* Pin toggle */}
      {canWrite && (
        <button
          className="absolute top-3 right-8 rounded-lg p-1 opacity-0 transition-all group-hover:opacity-100 text-muted-foreground hover:text-primary"
          onClick={(e) => { e.stopPropagation(); onTogglePin(id); }}
          aria-label={pinned ? `Unpin ${name}` : `Pin ${name}`}
        >
          {pinned ? <Pin className="size-3.5 text-primary" /> : <PinOff className="size-3.5" />}
        </button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="absolute bottom-3 right-3 rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            aria-label={`More actions for ${name}`}
            title="More actions"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onDownload(workspace);
            }}
          >
            <Download className="size-4" />
            Download
          </DropdownMenuItem>

          {canWrite && (
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                onEdit(workspace);
              }}
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
          )}

          {canWrite && (
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                onShare(workspace);
              }}
            >
              <Share2 className="size-4" />
              Share
            </DropdownMenuItem>
          )}

          {canWrite && (
            <DropdownMenuItem
              variant="destructive"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(workspace);
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{fileCount} files</p>
      </div>

    </div>
  );
}
