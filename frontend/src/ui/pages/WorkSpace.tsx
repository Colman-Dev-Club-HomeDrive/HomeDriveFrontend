import { useRef, useState } from 'react';
import { FolderSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceCard } from '@/ui/components/WorkspaceCard';
import { EditWorkspaceDialog } from '@/ui/components/ActionMenu/EditWorkspaceDialog';
import { FileItem } from '@/ui/components/FileItem';
import { useWorkspacesSection } from '@/hooks/useWorkspacesSection';
import { useListFilesQuery } from '@/store/apis/files.api';
import type { Workspace } from '@/types/workspace.type';
import { useFileUpload } from '@/hooks/useFileUpload';

export function WorkSpace() {
  const { workspaces, isLoading, isError, updateWorkspace, deleteWorkspace, togglePin } = useWorkspacesSection();
  const navigate = useNavigate();
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFiles } = useFileUpload();

  const { data: files, isLoading: filesLoading } = useListFilesQuery(undefined);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Workspaces</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading…' : `${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
          onClick={() => fileInputRef.current?.click()}
        >
          <FolderSearch className="size-4" />
          Add File
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files, 'file');
          e.currentTarget.value = '';
        }}
      />

      {isError && (
        <p className="text-sm text-destructive">Failed to load workspaces.</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
            ))
          : workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onOpen={() => navigate(`/workspaces/${workspace.id}`)}
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
            No files indexed yet. Click <strong>Add File</strong> to browse and add files.
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
    </div>
  );
}
