import { useState } from 'react';
import { WorkspaceCard } from '@/ui/components/WorkspaceCard';
import { EditWorkspaceDialog } from '@/ui/components/ActionMenu/EditWorkspaceDialog';
import { useWorkspacesSection } from '@/hooks/useWorkspacesSection';
import type { Workspace } from '@/types/workspace.type';

export function WorkSpace() {
  const { workspaces, isLoading, isError, updateWorkspace, deleteWorkspace, togglePin } = useWorkspacesSection();
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">All Workspaces</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? 'Loading…' : `${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {isError && (
        <p className="text-sm text-destructive">Failed to load workspaces.</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
            ))
          : workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onTogglePin={togglePin}
                onEdit={setEditWorkspace}
              />
            ))}
      </div>

      <EditWorkspaceDialog
        workspace={editWorkspace}
        open={editWorkspace !== null}
        onOpenChange={(open) => { if (!open) setEditWorkspace(null); }}
        onSubmit={(id, values) => { updateWorkspace(id, values); setEditWorkspace(null); }}
        onDelete={(id) => { deleteWorkspace(id); setEditWorkspace(null); }}
      />
    </div>
  );
}
