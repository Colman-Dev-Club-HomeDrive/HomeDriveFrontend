import { useState, useEffect, useMemo } from 'react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  ChevronUp,
  Folder,
  File,
  FileText,
  Image,
  Video,
  Music,
  Check,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { useBrowseDirectoryQuery, useIndexFileMutation, useListFilesQuery } from '@/store/apis/files.api';
import { formatSize } from '@/utils/formatSize';
import { cn } from '@/shadcn/lib/utils';
import type { BrowseEntry } from '@/types/file.type';

type FileBrowserModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
};

function getEntryIcon(entry: BrowseEntry) {
  if (entry.isDirectory) return Folder;
  const m = entry.mimeType;
  if (m.startsWith('image/')) return Image;
  if (m.startsWith('video/')) return Video;
  if (m.startsWith('audio/')) return Music;
  if (m.startsWith('text/') || m === 'application/pdf') return FileText;
  return File;
}

/** Returns the parent path string, or null if already at root. */
function getParentPath(fullPath: string): string | null {
  const clean = fullPath.replace(/[\\/]+$/, '');
  const lastSep = Math.max(clean.lastIndexOf('/'), clean.lastIndexOf('\\'));
  // Windows root like "C:" or Unix root "/"
  if (lastSep <= 0) return null;
  // "C:\something" — parent is "C:\" but after trim becomes "C:" which is the root
  if (lastSep === 2 && clean[1] === ':') return null;
  return clean.slice(0, lastSep);
}

/** Builds breadcrumb segments from a full path string. */
function pathToBreadcrumbs(fullPath: string): { label: string; path: string }[] {
  const parts = fullPath.replace(/\\/g, '/').split('/').filter(Boolean);
  return parts.map((label, i) => ({
    label,
    path: fullPath.includes('\\')
      ? parts.slice(0, i + 1).join('\\')
      : '/' + parts.slice(0, i + 1).join('/'),
  }));
}

export function FileBrowserModal({ open, onOpenChange, workspaceId }: FileBrowserModalProps) {
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined);
  const [indexingPaths, setIndexingPaths] = useState<Set<string>>(new Set());
  const [justIndexedPaths, setJustIndexedPaths] = useState<Set<string>>(new Set());

  // Reset to root whenever the modal opens
  useEffect(() => {
    if (open) {
      setCurrentPath(undefined);
      setJustIndexedPaths(new Set());
    }
  }, [open]);

  const { data, isLoading, isFetching, isError } = useBrowseDirectoryQuery(currentPath, {
    skip: !open,
  });

  const { data: indexedFiles } = useListFilesQuery(undefined, { skip: !open });
  const indexedPathSet = useMemo(
    () => new Set((indexedFiles ?? []).map((f) => f.path)),
    [indexedFiles],
  );

  const [indexFileMutation] = useIndexFileMutation();

  const isIndexed = (path: string) => indexedPathSet.has(path) || justIndexedPaths.has(path);

  const handleNavigate = (path: string) => setCurrentPath(path);

  const handleGoUp = () => {
    if (!data?.path) return;
    const parent = getParentPath(data.path);
    setCurrentPath(parent ?? undefined);
  };

  const handleIndex = async (entry: BrowseEntry) => {
    if (isIndexed(entry.path) || indexingPaths.has(entry.path)) return;

    setIndexingPaths((prev) => new Set([...prev, entry.path]));
    try {
      await indexFileMutation({ path: entry.path, workspaceId }).unwrap();
      setJustIndexedPaths((prev) => new Set([...prev, entry.path]));
    } catch (err) {
      const fetchErr = err as FetchBaseQueryError;
      // 409 = already indexed — treat as success
      if (fetchErr.status === 409) {
        setJustIndexedPaths((prev) => new Set([...prev, entry.path]));
      }
    } finally {
      setIndexingPaths((prev) => {
        const next = new Set(prev);
        next.delete(entry.path);
        return next;
      });
    }
  };

  const breadcrumbs = data ? pathToBreadcrumbs(data.path) : [];
  const parentPath = data ? getParentPath(data.path) : null;
  const isBusy = isLoading || isFetching;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-3">
        <DialogHeader>
          <DialogTitle>Browse &amp; Index Files</DialogTitle>
        </DialogHeader>

        {/* Path bar */}
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <button
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            onClick={handleGoUp}
            disabled={!parentPath || isBusy}
            aria-label="Go up one level"
          >
            <ChevronUp className="size-4" />
          </button>

          {/* Breadcrumbs */}
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-xs font-mono text-muted-foreground">
            {breadcrumbs.length === 0 ? (
              <span className="truncate">{data?.path ?? '…'}</span>
            ) : (
              breadcrumbs.map((crumb, i) => (
                <span key={crumb.path} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <span className="opacity-40">/</span>}
                  <button
                    className="rounded px-1 hover:bg-background hover:text-foreground transition-colors"
                    onClick={() => handleNavigate(crumb.path)}
                  >
                    {crumb.label}
                  </button>
                </span>
              ))
            )}
          </div>

          {isBusy && <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />}
        </div>

        {/* Entry list */}
        <div className="h-80 overflow-y-auto rounded-lg border">
          {isError ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4" />
              Failed to read directory. Check server access permissions.
            </div>
          ) : isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading…
            </div>
          ) : !data?.entries.length ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Empty directory
            </div>
          ) : (
            <ul>
              {data.entries.map((entry) => {
                const EntryIcon = getEntryIcon(entry);
                const indexed = isIndexed(entry.path);
                const indexing = indexingPaths.has(entry.path);

                return (
                  <li key={entry.path}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted',
                        entry.isDirectory ? 'cursor-pointer' : 'cursor-default',
                      )}
                      onClick={() => entry.isDirectory && handleNavigate(entry.path)}
                    >
                      <EntryIcon
                        className={cn(
                          'size-4 shrink-0',
                          entry.isDirectory ? 'text-yellow-500' : 'text-muted-foreground',
                        )}
                      />

                      <span className="flex-1 truncate text-sm">{entry.name}</span>

                      {!entry.isDirectory && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatSize(entry.size)}
                        </span>
                      )}

                      {/* Index button — shown for both files and folders */}
                      {(() => {
                        const indexed = isIndexed(entry.path);
                        const indexing = indexingPaths.has(entry.path);
                        return (
                          <button
                            className={cn(
                              'flex size-6 shrink-0 items-center justify-center rounded-md transition-colors',
                              indexed
                                ? 'cursor-default text-green-500'
                                : 'text-muted-foreground hover:bg-primary hover:text-primary-foreground',
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIndex(entry);
                            }}
                            disabled={indexed || indexing}
                            aria-label={indexed ? 'Already indexed' : `Index ${entry.name}`}
                          >
                            {indexing ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : indexed ? (
                              <Check className="size-3.5" />
                            ) : (
                              <Plus className="size-3.5" />
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Click <Plus className="inline size-3" /> to index a file or folder — it stays in its original location.
          {workspaceId && ' Items will be added to this workspace.'}
        </p>

        <DialogFooter>
          <button
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={() => onOpenChange(false)}
          >
            Done
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
