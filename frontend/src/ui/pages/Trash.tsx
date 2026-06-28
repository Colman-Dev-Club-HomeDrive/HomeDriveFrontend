import { useState } from 'react';
import { CheckCircle2, File, FileText, Folder, Image, Loader2, Music, RotateCcw, Trash2, Video, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  useListTrashFilesQuery,
  usePermanentlyDeleteFileMutation,
  useRestoreFileMutation,
} from '@/store/apis/files.api';
import type { TrashFile } from '@/types/file.type';
import { formatSize } from '@/utils/formatSize';

function getMimeIcon(file: TrashFile) {
  if (file.isDirectory) return Folder;
  const mimeType = file.mimeType;
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType.startsWith('text/') || mimeType === 'application/pdf') return FileText;
  return File;
}

function formatDeletedAt(value?: string | null) {
  if (!value) return 'Deleted recently';

  const deletedAt = new Date(value);
  if (Number.isNaN(deletedAt.getTime())) {
    return 'Deleted recently';
  }

  return `Deleted ${formatDistanceToNow(deletedAt, { addSuffix: true })}`;
}

export function Trash() {
  const { data: files = [], isLoading, isError } = useListTrashFilesQuery();
  const [restoreFile, { isLoading: isRestoring }] = useRestoreFileMutation();
  const [permanentlyDeleteFile, { isLoading: isDeletingPermanently }] = usePermanentlyDeleteFileMutation();
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  function showToast(kind: 'success' | 'error', message: string) {
    setToast({ kind, message });
    window.setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 2800);
  }

  async function handleRestore(fileId: string) {
    try {
      await restoreFile(fileId).unwrap();
      showToast('success', 'File restored successfully.');
    } catch (error) {
      console.error('restore failed:', error);
      showToast('error', 'Failed to restore file.');
    }
  }

  async function handlePermanentDelete(fileId: string, fileName: string) {
    const confirmed = window.confirm(`Permanently delete ${fileName}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await permanentlyDeleteFile(fileId).unwrap();
      showToast('success', 'File permanently deleted.');
    } catch (error) {
      console.error('permanent delete failed:', error);
      showToast('error', 'Failed to permanently delete file.');
    }
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      {toast && (
        <div className="pointer-events-none fixed right-6 top-6 z-50">
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm shadow-lg ${
              toast.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            {toast.kind === 'success' ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">Trash</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading
            ? 'Loading...'
            : `${files.length} deleted item${files.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {isError && <p className="text-sm text-destructive">Failed to load deleted files.</p>}

      {isLoading ? (
        <div className="flex flex-col gap-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <p className="text-sm text-muted-foreground">Trash is empty.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {files.map((file) => {
            const Icon = getMimeIcon(file);

            return (
              <div
                key={file.id || file._id}
                className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 transition-colors hover:bg-slate-50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-muted-foreground">
                  <Icon className={`size-4 ${file.isDirectory ? 'text-yellow-500' : ''}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <Trash2 className="size-3" />
                      Trashed
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{file.path || 'No original path recorded'}</p>
                </div>

                <div className="shrink-0 text-right">
                  {!file.isDirectory && (
                    <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{formatDeletedAt(file.deletedAt)}</p>
                  <div className="mt-1.5 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                      onClick={() => handleRestore(file.id || file._id)}
                      disabled={isRestoring || isDeletingPermanently}
                    >
                      {isRestoring ? <Loader2 className="size-3 animate-spin" /> : <RotateCcw className="size-3" />}
                      Restore
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60"
                      onClick={() => handlePermanentDelete(file.id || file._id, file.name)}
                      disabled={isRestoring || isDeletingPermanently}
                    >
                      {isDeletingPermanently ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                      Permanent delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}