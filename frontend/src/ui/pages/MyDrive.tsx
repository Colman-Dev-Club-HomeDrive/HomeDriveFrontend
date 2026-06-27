import { useRef, useMemo } from 'react';
import { Folder, FolderSearch } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FileItem } from '@/ui/components/FileItem';
import { useListFilesQuery } from '@/store/apis/files.api';
import { useListWorkspacesQuery } from '@/store/apis/workspaces.api';
import type { MediaType } from '@/types/file.type';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFileSearch } from '@/hooks/useFileSearch';
import {
  filterIndexedFilesBySearch,
  filterWorkspacesBySearch,
  normalizeSearchQuery,
} from '@/utils/filterBySearchQuery';
import { WorkspaceViewTabs, type WorkspaceViewTab } from '@/ui/components/workspace/WorkspaceViewTabs';
import { WorkspaceCodeEditor } from '@/ui/components/workspace/WorkspaceCodeEditor';

const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  documents: 'Documents',
  photos: 'Photos',
  videos: 'Videos',
  audio: 'Audio',
};

function parseMediaType(value: string | null): MediaType | undefined {
  if (!value) return undefined;
  if (value === 'documents' || value === 'photos' || value === 'videos' || value === 'audio') {
    return value;
  }
  return undefined;
}

function parseWorkspaceTab(value: string | null): WorkspaceViewTab {
  return value === 'code' ? 'code' : 'files';
}

export function MyDrive() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { addFiles } = useFileUpload();
  const [searchParams, setSearchParams] = useSearchParams();
  const { workspaceId } = useParams();
  const mediaType = parseMediaType(searchParams.get('mediaType'));
  const { data: workspaces = [] } = useListWorkspacesQuery();
  const workspace = workspaceId ? workspaces.find((entry) => entry.id === workspaceId) : undefined;
  const activeTab = workspaceId ? parseWorkspaceTab(searchParams.get('tab')) : 'files';
  const { query } = useFileSearch();
  const isSearching = normalizeSearchQuery(query).length > 0;
  const { data: files, isLoading, isError } = useListFilesQuery(
    isSearching
      ? undefined
      : workspaceId
        ? { workspaceId, ...(mediaType ? { mediaType } : {}) }
        : mediaType
          ? { mediaType }
          : undefined
  );

  const filteredWorkspaces = useMemo(
    () => (isSearching ? filterWorkspacesBySearch(workspaces, query) : []),
    [workspaces, query, isSearching],
  );

  const filteredFiles = useMemo(
    () => filterIndexedFilesBySearch(files ?? [], query),
    [files, query],
  );

  const hasSearchResults = filteredWorkspaces.length > 0 || filteredFiles.length > 0;

  const clearMediaFilter = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('mediaType');
    setSearchParams(nextParams);
  };

  const setActiveTab = (tab: WorkspaceViewTab) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === 'files') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', 'code');
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workspace?.name ?? 'My Drive'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? 'Loading...'
              : `${files?.length ?? 0} file${(files?.length ?? 0) !== 1 ? 's' : ''} indexed`}
          </p>
          {mediaType && (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Filter: {MEDIA_TYPE_LABELS[mediaType]}</p>
              <button
                type="button"
                className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                onClick={clearMediaFilter}
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
          onClick={() => fileInputRef.current?.click()}
        >
          <FolderSearch className="size-4" />
          Add File
        </button>
      </div>

      {workspaceId && workspace && (
        <WorkspaceViewTabs activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {workspaceId && workspace && activeTab === 'code' ? (
        <WorkspaceCodeEditor workspaceId={workspaceId} workspaceName={workspace.name} />
      ) : (
        <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files, 'file', workspaceId ? { workspaceId } : undefined);
          e.currentTarget.value = '';
        }}
      />

      {isError && <p className="text-sm text-destructive">Failed to load files.</p>}

      {isLoading ? (
        <div className="flex flex-col gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : !files?.length && !isSearching ? (
        <p className="text-sm text-muted-foreground">
          No files indexed yet. Click <strong>Add File</strong> to browse and add files.
        </p>
      ) : isSearching && !hasSearchResults ? (
        <p className="text-sm text-muted-foreground">No files found</p>
      ) : (
        <div className="flex flex-col gap-4">
          {isSearching && filteredWorkspaces.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {filteredWorkspaces.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => navigate(`/workspaces/${entry.id}`)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                  <Folder className="size-4 shrink-0 text-yellow-500" />
                  <span className="text-sm font-medium">{entry.name}</span>
                  <span className="text-xs text-muted-foreground">Workspace</span>
                </button>
              ))}
            </div>
          )}
          {filteredFiles.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {filteredFiles.map((file) => (
                <FileItem key={file._id} file={file} />
              ))}
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}
