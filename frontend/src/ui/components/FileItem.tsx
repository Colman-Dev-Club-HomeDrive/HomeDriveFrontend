import { useState } from 'react';
import { File, FileText, Image, Video, Music, Folder, Trash2, Loader2, Pencil, MoreHorizontal, Download } from 'lucide-react';
import { useDeleteFileMutation, useDownloadFileMutation, useOpenFileMutation, useRenameFileMutation } from '@/store/apis/files.api';
import { RenameFileDialog } from '@/ui/components/RenameFileDialog';
import { formatSize } from '@/utils/formatSize';
import type { IndexedFile } from '@/types/file.type';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user.slice';
import { useTransferNotifications } from '../../hooks/useTransferNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';

type FileItemProps = {
  file: IndexedFile;
};

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const DEV_FALLBACK_OWNER_ID = '6854abcd1234567890abcdef';

function getMimeIcon(file: IndexedFile) {
  if (file.isDirectory) return Folder;
  const m = file.mimeType;
  if (m.startsWith('image/')) return Image;
  if (m.startsWith('video/')) return Video;
  if (m.startsWith('audio/')) return Music;
  if (m.startsWith('text/') || m === 'application/pdf') return FileText;
  return File;
}

export function FileItem({ file }: FileItemProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [openFile, { isLoading: isOpening }] = useOpenFileMutation();
  const [downloadFile, { isLoading: isDownloading }] = useDownloadFileMutation();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();
  const [renameFile, { isLoading: isRenaming }] = useRenameFileMutation();
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
    try {
      await openFile(fileId).unwrap();
    } catch (error) {
      console.error('❌ Failed to open file:', error);
    }
  }

  async function handleDownloadAction() {
    const blob = await downloadFile(fileId).unwrap();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = file.name;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div className="group flex items-center gap-2 rounded-xl bg-white px-2 py-1.5 transition-colors hover:bg-slate-50">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left disabled:pointer-events-none disabled:opacity-60"
        onClick={handleOpenAction}
        disabled={isOpening}
        aria-label={file.isDirectory ? `Open folder ${file.name}` : `Open ${file.name}`}
        title={file.isDirectory ? 'Open in file explorer' : 'Open with default app'}
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label={`More actions for ${file.name}`}
            title="More actions"
            disabled={isDeleting || isRenaming || isDownloading}
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

          <DropdownMenuItem variant="destructive" onClick={() => deleteFile(fileId)}>
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameFileDialog
        file={file}
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        onConfirm={handleRenameConfirm}
        isLoading={isRenaming}
      />
    </div>
  );
}
