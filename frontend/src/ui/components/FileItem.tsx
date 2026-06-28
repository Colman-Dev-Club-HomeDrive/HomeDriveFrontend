import { useState } from 'react';
import { File, FileText, Image, Video, Music, Folder, Trash2, Loader2, Pencil, MoreHorizontal, Download, Share2 } from 'lucide-react';
import { useDeleteFileMutation, useRenameFileMutation, useShareFileMutation } from '@/store/apis/files.api';
import { API_BASE_URL } from '@/consts/consts';
import { RenameFileDialog } from '@/ui/components/RenameFileDialog';
import { FileShareDialog } from '@/ui/components/FileShareDialog';
import { formatSize } from '@/utils/formatSize';
import type { IndexedFile } from '@/types/file.type';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';

type FileItemProps = {
  file: IndexedFile;
  onOpenFolder?: (file: IndexedFile) => void;
  disableActions?: boolean;
};

function getMimeIcon(file: IndexedFile) {
  if (file.isDirectory) return Folder;
  const m = file.mimeType;
  if (m.startsWith('image/')) return Image;
  if (m.startsWith('video/')) return Video;
  if (m.startsWith('audio/')) return Music;
  if (m.startsWith('text/') || m === 'application/pdf') return FileText;
  return File;
}

export function FileItem({ file, onOpenFolder, disableActions = false }: FileItemProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();
  const [renameFile, { isLoading: isRenaming }] = useRenameFileMutation();
  const [shareFile, { isLoading: isSharing }] = useShareFileMutation();
  const fileId = file.id || file._id;

  const Icon = getMimeIcon(file);

  async function handleRenameConfirm(newName: string) {
    try {
      await renameFile({ id: fileId, name: newName }).unwrap();
    } catch (error) {
      console.error('rename failed:', error);
      throw error;
    }
  }

  async function handleOpenAction() {
    if (file.isDirectory) {
      onOpenFolder?.(file);
      return;
    }

    try {
      setIsOpening(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) throw new Error('Open failed');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const openedWindow = window.open(objectUrl, '_blank', 'noopener,noreferrer');

      // Pop-up blockers can prevent window.open; fallback to a synthetic anchor click.
      if (!openedWindow) {
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.click();
      }

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      console.error('❌ Failed to open file:', error);
    } finally {
      setIsOpening(false);
    }
  }

  async function handleDownloadAction() {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = file.name;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('❌ Failed to download file:', error);
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleShareAction() {
    setShareDialogOpen(true);
  }

  async function handleSaveCollaborators(shareWith: string) {
    try {
      await shareFile({ id: fileId, shareWith }).unwrap();
    } catch (error) {
      console.error('failed to share file:', error);
      throw error;
    }
  }

  return (
    <div className="group flex items-center gap-2 rounded-xl bg-white px-2 py-1.5 transition-colors hover:bg-slate-50">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left disabled:pointer-events-none disabled:opacity-60"
        onClick={handleOpenAction}
        disabled={isOpening || (file.isDirectory && !onOpenFolder)}
        aria-label={file.isDirectory ? `Open folder ${file.name}` : `Open ${file.name}`}
        title={file.isDirectory ? (onOpenFolder ? 'Open folder' : 'Folders cannot be opened in browser') : 'Open in browser'}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          {isOpening ? (
            <Loader2 className="size-4 animate-spin text-slate-500" />
          ) : (
            <Icon className={`size-4 ${file.isDirectory ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="truncate text-xs text-muted-foreground">{file.path}</p>
        </div>

        {!file.isDirectory && (
          <span className="shrink-0 text-xs text-muted-foreground">{formatSize(file.size)}</span>
        )}
      </button>

      {!disableActions && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label={`More actions for ${file.name}`}
            title="More actions"
            disabled={isDeleting || isRenaming || isDownloading || isSharing}
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDownloadAction} disabled={file.isDirectory || isDownloading}>
            {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Download
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleShareAction} disabled={file.isDirectory || isSharing}>
            {isSharing ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
            Share
          </DropdownMenuItem>

          <DropdownMenuItem variant="destructive" onClick={() => deleteFile(fileId)}>
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      )}

      {!disableActions && (
      <RenameFileDialog
        file={file}
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        onConfirm={handleRenameConfirm}
        isLoading={isRenaming}
      />
      )}

      {!disableActions && (
      <FileShareDialog
        file={file}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onSaveCollaborators={handleSaveCollaborators}
        isLoading={isSharing}
      />
      )}
    </div>
  );
}
