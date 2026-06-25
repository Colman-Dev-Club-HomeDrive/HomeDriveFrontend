import { ActionMenuButton } from '@/ui/components/ActionMenu/ActionMenuButton';
import { CreateWorkspaceDialog } from '@/ui/components/ActionMenu/CreateWorkspaceDialog';
import { EditWorkspaceDialog } from '@/ui/components/ActionMenu/EditWorkspaceDialog';
import { ArrangeWorkspacesDialog } from '@/ui/components/ActionMenu/ArrangeWorkspacesDialog';
import { useWorkspacesSection } from '@/hooks/useWorkspacesSection';
import { WorkspaceCard } from '@/ui/components/WorkspaceCard';

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

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
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

          <div className="grid grid-cols-2 gap-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
                ))
              : workspaces.slice(0, 6).map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onTogglePin={togglePin}
                  onEdit={setEditWorkspace}
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

      <ArrangeWorkspacesDialog
        open={arrangeOpen}
        onOpenChange={setArrangeOpen}
        workspaces={workspaces}
        onSave={reorderWorkspaces}
      />
    </>
  );
}
