import { useState } from 'react';
import { File, FileText, Image, Video, Music, Folder, ExternalLink, Trash2, Loader2, Pencil } from 'lucide-react';
import { useDeleteFileMutation, useOpenFileMutation, useRenameFileMutation } from '@/store/apis/files.api';
import { RenameFileDialog } from '@/ui/components/RenameFileDialog';
import { formatSize } from '@/utils/formatSize';
import type { IndexedFile } from '@/types/file.type';

type FileItemProps = {
  file: IndexedFile;
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

export function FileItem({ file }: FileItemProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [openFile, { isLoading: isOpening }] = useOpenFileMutation();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();
  const [renameFile, { isLoading: isRenaming }] = useRenameFileMutation();

  const Icon = getMimeIcon(file);

  async function handleRenameConfirm(newName: string) {
    try {
      await renameFile({ id: file._id, name: newName }).unwrap();
    } catch (error) {
      console.error('rename failed:', error);
      throw error;
    }
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className={`size-4 ${file.isDirectory ? 'text-yellow-500' : 'text-muted-foreground'}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="truncate text-xs text-muted-foreground">{file.path}</p>
      </div>

      {!file.isDirectory && (
        <span className="shrink-0 text-xs text-muted-foreground">{formatSize(file.size)}</span>
      )}

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          onClick={() => setRenameDialogOpen(true)}
          disabled={isRenaming}
          aria-label={`Rename ${file.name}`}
          title="Rename"
        >
          {isRenaming ? <Loader2 className="size-3.5 animate-spin" /> : <Pencil className="size-3.5" />}
        </button>

        <button
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          onClick={() => openFile(file._id)}
          disabled={isOpening}
          aria-label={file.isDirectory ? `Open folder ${file.name}` : `Open ${file.name}`}
          title={file.isDirectory ? 'Open in file explorer' : 'Open with default app'}
        >
          {isOpening ? <Loader2 className="size-3.5 animate-spin" /> : <ExternalLink className="size-3.5" />}
        </button>

        <button
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
          onClick={() => deleteFile(file._id)}
          disabled={isDeleting}
          aria-label={`Remove ${file.name}`}
          title="Remove from index"
        >
          {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
        </button>
      </div>

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
