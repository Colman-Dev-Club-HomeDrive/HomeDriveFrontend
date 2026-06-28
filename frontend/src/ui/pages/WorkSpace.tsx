import { useRef, useState, useMemo } from 'react';
import { FolderSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceCard } from '@/ui/components/WorkspaceCard';
import { EditWorkspaceDialog } from '@/ui/components/ActionMenu/EditWorkspaceDialog';
import { WorkspaceShareDialog } from '@/ui/components/WorkspaceShareDialog';
import { FileItem } from '@/ui/components/FileItem';
import { useWorkspacesSection } from '@/hooks/useWorkspacesSection';
import { useListFilesQuery } from '@/store/apis/files.api';
import { useUpdateWorkspaceMutation } from '@/store/apis/workspaces.api';
import type { Workspace } from '@/types/workspace.type';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFileSearch } from '@/hooks/useFileSearch';
import {
  filterIndexedFilesBySearch,
  filterWorkspacesBySearch,
  normalizeSearchQuery,
} from '@/utils/filterBySearchQuery';
import { getWorkspacePath } from '@/utils/workspaceNavigation';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user.slice';
import { TEMP_ALLOWED_EMAILS } from '@/consts/consts';
import { useListAccessUsersQuery } from '@/store/apis/access.api';

const DEFAULT_ACCESS_USERS = TEMP_ALLOWED_EMAILS.map((email) => ({ email, role: 'manager' as const }));

export function WorkSpace() {
  const { workspaces, isLoading, isError, updateWorkspace, deleteWorkspace, togglePin } = useWorkspacesSection();
  const navigate = useNavigate();
  const { email: userEmail } = useAppSelector(selectUser);
  const normalizedUserEmail = (userEmail ?? '').trim().toLowerCase();
  const { data: sharedAccessUsers = DEFAULT_ACCESS_USERS } = useListAccessUsersQuery();
  const currentUserAccess = sharedAccessUsers.find((entry) => entry.email === normalizedUserEmail);
  const canSeeSharedInfo = Boolean(currentUserAccess);
  const canUploadFiles = currentUserAccess?.role === 'manager' || currentUserAccess?.role === 'editor';
  const canDownloadFiles = Boolean(currentUserAccess);
  const canWriteFiles = currentUserAccess?.role === 'manager' || currentUserAccess?.role === 'editor';
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null);
  const [shareWorkspace, setShareWorkspace] = useState<Workspace | null>(null);
  const [updateWorkspaceMutation, { isLoading: isSharingWorkspace }] = useUpdateWorkspaceMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFiles } = useFileUpload();
  const { query } = useFileSearch();
  const isSearching = normalizeSearchQuery(query).length > 0;

  const { data: files, isLoading: filesLoading } = useListFilesQuery(undefined);

  const displayedWorkspaces = useMemo(
    () => (isSearching ? filterWorkspacesBySearch(workspaces, query) : workspaces),
    [workspaces, query, isSearching],
  );

  const filteredFiles = useMemo(
    () => filterIndexedFilesBySearch(files ?? [], query),
    [files, query],
  );

  const hasSearchResults = displayedWorkspaces.length > 0 || filteredFiles.length > 0;

  const handleShareWorkspace = (workspace: Workspace) => {
    setShareWorkspace(workspace);
  };

  const handleDeleteWorkspace = (workspace: Workspace) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;
    deleteWorkspace(workspace.id);
  };

  const handleSaveWorkspaceCollaborators = async (shareWith: string) => {
    if (!shareWorkspace) return;
    await updateWorkspaceMutation({
      id: shareWorkspace.id,
      values: { collaboration: shareWith },
    }).unwrap();
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Workspaces</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading…' : `${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canUploadFiles && (
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            onClick={() => fileInputRef.current?.click()}
          >
            <FolderSearch className="size-4" />
            Add File
          </button>
        )}
      </div>

      {!canSeeSharedInfo && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Access to workspaces and indexed files is temporarily limited for this account.
        </div>
      )}

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
          : canSeeSharedInfo && displayedWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onOpen={() => navigate(getWorkspacePath(workspace))}
                onTogglePin={togglePin}
                onEdit={setEditWorkspace}
                onShare={handleShareWorkspace}
                onDelete={handleDeleteWorkspace}
                onDownload={() => {}}
                canWrite={canWriteFiles}
              />
            ))}
      </div>

      {/* Indexed files list */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Indexed Files</h2>
        {!canSeeSharedInfo ? (
          <p className="text-sm text-muted-foreground">No files available for this account right now.</p>
        ) : filesLoading ? (
          <div className="flex flex-col gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : !files?.length && !isSearching ? (
          <p className="text-sm text-muted-foreground">
            No files indexed yet. Click <strong>Add File</strong> to browse and add files.
          </p>
        ) : isSearching && !hasSearchResults ? (
          <p className="text-sm text-muted-foreground">No files found</p>
        ) : filteredFiles.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {filteredFiles.map((file) => (
              <FileItem key={file._id} file={file} canDownload={canDownloadFiles} canWrite={canWriteFiles} />
            ))}
          </div>
        ) : null}
      </section>

      <EditWorkspaceDialog
        workspace={editWorkspace}
        open={editWorkspace !== null}
        onOpenChange={(open) => { if (!open) setEditWorkspace(null); }}
        onSubmit={(id, values) => { updateWorkspace(id, values); setEditWorkspace(null); }}
        onDelete={(id) => { deleteWorkspace(id); setEditWorkspace(null); }}
      />

      <WorkspaceShareDialog
        workspace={shareWorkspace}
        open={shareWorkspace !== null}
        onOpenChange={(open) => { if (!open) setShareWorkspace(null); }}
        onSaveCollaborators={handleSaveWorkspaceCollaborators}
        isLoading={isSharingWorkspace}
      />
    </div>
  );
}
