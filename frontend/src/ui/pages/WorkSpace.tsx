import { useState } from 'react';
import { FolderSearch } from 'lucide-react';
import { WorkspaceCard } from '@/ui/components/WorkspaceCard';
import { EditWorkspaceDialog } from '@/ui/components/ActionMenu/EditWorkspaceDialog';
import { FileBrowserModal } from '@/ui/components/FileBrowserModal';
import { FileItem } from '@/ui/components/FileItem';
import { useWorkspacesSection } from '@/hooks/useWorkspacesSection';
import { useListFilesQuery } from '@/store/apis/files.api';
import type { Workspace } from '@/types/workspace.type';

export function WorkSpace() {
  const { workspaces, isLoading, isError, updateWorkspace, deleteWorkspace, togglePin } = useWorkspacesSection();
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null);
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false);

  const { data: files, isLoading: filesLoading } = useListFilesQuery(undefined);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Workspaces</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading…' : `${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={() => setFileBrowserOpen(true)}
        >
          <FolderSearch className="size-4" />
          Index File
        </button>
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
                onDownload={() => {}}
              />
            ))}
      </div>

      {/* Indexed files list */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Indexed Files</h2>
        {filesLoading ? (
          <div className="flex flex-col gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : !files?.length ? (
          <p className="text-sm text-muted-foreground">
            No files indexed yet. Click <strong>Index File</strong> to browse and add files.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {files.map((file) => (
              <FileItem key={file._id} file={file} />
            ))}
          </div>
        )}
      </section>

      <EditWorkspaceDialog
        workspace={editWorkspace}
        open={editWorkspace !== null}
        onOpenChange={(open) => { if (!open) setEditWorkspace(null); }}
        onSubmit={(id, values) => { updateWorkspace(id, values); setEditWorkspace(null); }}
        onDelete={(id) => { deleteWorkspace(id); setEditWorkspace(null); }}
      />

      <FileBrowserModal
        open={fileBrowserOpen}
        onOpenChange={setFileBrowserOpen}
      />
    </div>
  );
}
