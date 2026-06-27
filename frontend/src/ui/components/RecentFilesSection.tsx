import { useMemo } from 'react';
import { Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useListFilesQuery } from '@/store/apis/files.api';
import { useListWorkspacesQuery } from '@/store/apis/workspaces.api';
import { FileItem } from '@/ui/components/FileItem';
import { useFileSearch } from '@/hooks/useFileSearch';
import {
  filterIndexedFilesBySearch,
  filterWorkspacesBySearch,
  normalizeSearchQuery,
} from '@/utils/filterBySearchQuery';

const MAX_RECENT_FILES = 6;

export function RecentFilesSection() {
  const navigate = useNavigate();
  const { data: files = [], isLoading, isError } = useListFilesQuery(undefined);
  const { data: workspaces = [] } = useListWorkspacesQuery();
  const { query } = useFileSearch();
  const isSearching = normalizeSearchQuery(query).length > 0;

  const displayedWorkspaces = useMemo(
    () => (isSearching ? filterWorkspacesBySearch(workspaces, query) : []),
    [workspaces, query, isSearching],
  );

  const displayedFiles = useMemo(() => {
    if (isSearching) {
      return filterIndexedFilesBySearch(files, query);
    }

    return [...files]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, MAX_RECENT_FILES);
  }, [files, query, isSearching]);

  const hasSearchResults = displayedWorkspaces.length > 0 || displayedFiles.length > 0;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Recently Added Files</h2>
        {!isSearching && files.length > MAX_RECENT_FILES && (
          <span className="text-xs text-muted-foreground">Showing latest {MAX_RECENT_FILES}</span>
        )}
      </div>

      {isError && <p className="text-xs text-destructive">Failed to load recent files.</p>}

      <div className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-sm">
        {isLoading && (
          <div className="space-y-2 p-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {!isLoading && isSearching && !hasSearchResults && (
          <p className="px-3 py-4 text-sm text-muted-foreground">No files found</p>
        )}

        {!isLoading && !isSearching && displayedFiles.length === 0 && (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            No files indexed yet. Add files from Create New to see them here.
          </p>
        )}

        {!isLoading && hasSearchResults && (
          <div className="space-y-1">
            {displayedWorkspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                onClick={() => navigate(`/workspaces/${workspace.id}`)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <Folder className="size-4 shrink-0 text-yellow-500" />
                <span className="text-sm font-medium">{workspace.name}</span>
                <span className="text-xs text-muted-foreground">Workspace</span>
              </button>
            ))}
            {displayedFiles.map((file) => (
              <FileItem key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
