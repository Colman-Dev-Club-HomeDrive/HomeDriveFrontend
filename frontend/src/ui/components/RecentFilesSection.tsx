import { useMemo } from 'react';
import { useListFilesQuery } from '@/store/apis/files.api';
import { FileItem } from '@/ui/components/FileItem';

const MAX_RECENT_FILES = 6;

export function RecentFilesSection() {
  const { data: files = [], isLoading, isError } = useListFilesQuery(undefined);

  const recentFiles = useMemo(
    () =>
      [...files]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, MAX_RECENT_FILES),
    [files]
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Recently Added Files</h2>
        {files.length > MAX_RECENT_FILES && (
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

        {!isLoading && recentFiles.length === 0 && (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            No files indexed yet. Add files from Create New to see them here.
          </p>
        )}

        {!isLoading && recentFiles.length > 0 && (
          <div className="space-y-1">
            {recentFiles.map((file) => (
              <FileItem key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
