import { Pencil, Pin, PinOff } from 'lucide-react';
import { ICON_MAP } from '@/consts/consts';
import { ActionMenuButton } from '@/ui/components/ActionMenu/ActionMenuButton';
import { CreateWorkspaceDialog } from '@/ui/components/ActionMenu/CreateWorkspaceDialog';
import { EditWorkspaceDialog } from '@/ui/components/ActionMenu/EditWorkspaceDialog';
import { ArrangeWorkspacesDialog } from '@/ui/components/ActionMenu/ArrangeWorkspacesDialog';
import { useWorkspacesSection } from '@/hooks/useWorkspacesSection';

export function WorkspacesSection() {
  const {
    workspaces,
    setWorkspaces,
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

          <div className="grid grid-cols-2 gap-3">
            {workspaces.map((workspace) => {
              const { id, name, fileCount, icon, color, pinned } = workspace;
              const Icon = ICON_MAP[icon];
              return (
                <div
                  key={id}
                  className="group relative flex flex-col gap-3 rounded-2xl bg-card p-4 text-left shadow-sm transition-all hover:bg-accent hover:shadow-md active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-accent shadow-sm">
                      <Icon className="size-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>

                  {/* Pin toggle — top-right */}
                  <button
                    className="absolute top-3 right-8 rounded-lg p-1 opacity-0 transition-all group-hover:opacity-100 text-muted-foreground hover:text-primary"
                    onClick={(e) => { e.stopPropagation(); togglePin(id); }}
                    aria-label={pinned ? `Unpin ${name}` : `Pin ${name}`}
                  >
                    {pinned ? <Pin className="size-3.5 text-primary" /> : <PinOff className="size-3.5" />}
                  </button>
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{fileCount} files</p>
                  </div>


                  {/* Edit — bottom-right */}
                  <button
                    className="absolute bottom-3 right-3 rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); setEditWorkspace(workspace); }}
                    aria-label={`Edit ${name}`}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
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
        onSave={(updated) => setWorkspaces(updated)}
      />
    </>
  );
}
