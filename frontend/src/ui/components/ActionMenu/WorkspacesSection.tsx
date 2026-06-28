import { useState } from 'react';
import { ActionMenuButton } from '@/ui/components/ActionMenu/ActionMenuButton';
import { CreateWorkspaceDialog } from '@/ui/components/ActionMenu/CreateWorkspaceDialog';
import { EditWorkspaceDialog } from '@/ui/components/ActionMenu/EditWorkspaceDialog';
import { ArrangeWorkspacesDialog } from '@/ui/components/ActionMenu/ArrangeWorkspacesDialog';
import { useWorkspacesSection } from '@/hooks/useWorkspacesSection';
import { WorkspaceCard } from '@/ui/components/WorkspaceCard';
import { WorkspaceShareDialog } from '@/ui/components/WorkspaceShareDialog';
import { useUpdateWorkspaceMutation } from '@/store/apis/workspaces.api';
import type { Workspace } from '@/types/workspace.type';

export function WorkspacesSection() {
  const {
    workspaces,
    isLoading,
    isError,
    dialogOpen,
    setDialogOpen,
    arrangeOpen,
    setArrangeOpen,
    editWorkspace,
    setEditWorkspace,
    menuItems,
    navigate,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    togglePin,
    reorderWorkspaces,
  } = useWorkspacesSection();
  const [shareWorkspace, setShareWorkspace] = useState<Workspace | null>(null);
  const [updateWorkspaceMutation, { isLoading: isSharingWorkspace }] = useUpdateWorkspaceMutation();
  const openWorkspace = (workspaceId: string) => {
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleShareWorkspace = (workspace: Workspace) => {
    setShareWorkspace(workspace);
  };

  const handleSaveWorkspaceCollaborators = async (shareWith: string) => {
    if (!shareWorkspace) return;
    await updateWorkspaceMutation({
      id: shareWorkspace.id,
      values: { collaboration: shareWith },
    }).unwrap();
  };

  const handleDeleteWorkspace = (workspace: (typeof workspaces)[number]) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;
    deleteWorkspace(workspace.id);
  };

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2
              className="font-semibold cursor-pointer hover:underline"
              onClick={() => navigate('/workspaces')}
            >
              My Workspaces
            </h2>
            <ActionMenuButton
              ariaLabel="Workspace actions"
              items={menuItems}
              className="text-muted-foreground hover:text-foreground"
            />
          </div>

          {isError && (
            <p className="text-xs text-destructive">Failed to load workspaces.</p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
                ))
              : workspaces.slice(0, 6).map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onOpen={() => openWorkspace(workspace.id)}
                  onTogglePin={togglePin}
                  onEdit={setEditWorkspace}
                  onShare={handleShareWorkspace}
                  onDelete={handleDeleteWorkspace}
                  onDownload={() => navigate('/workspaces')}
                />
              ))}
          </div>
          {workspaces.length > 6 && (
            <button
              onClick={() => navigate('/workspaces')}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline self-start"
            >
              +{workspaces.length - 6} more — View all
            </button>
          )}
        </div>
      </section>

      <CreateWorkspaceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={addWorkspace}
      />

      <EditWorkspaceDialog
        workspace={editWorkspace}
        open={editWorkspace !== null}
        onOpenChange={(open) => { if (!open) setEditWorkspace(null); }}
        onSubmit={(id, values) => { updateWorkspace(id, values); setEditWorkspace(null); }}
        onDelete={deleteWorkspace}
      />

      <WorkspaceShareDialog
        workspace={shareWorkspace}
        open={shareWorkspace !== null}
        onOpenChange={(open) => { if (!open) setShareWorkspace(null); }}
        onSaveCollaborators={handleSaveWorkspaceCollaborators}
        isLoading={isSharingWorkspace}
      />

      <ArrangeWorkspacesDialog
        open={arrangeOpen}
        onOpenChange={setArrangeOpen}
        workspaces={workspaces}
        onSave={reorderWorkspaces}
      />
    </>
  );
}
