import { useState } from 'react';
import { FolderSearch } from 'lucide-react';
import { FileBrowserModal } from '@/ui/components/FileBrowserModal';
import { FileItem } from '@/ui/components/FileItem';
import { useListFilesQuery } from '@/store/apis/files.api';

export function MyDrive() {
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false);
  const { data: files, isLoading, isError } = useListFilesQuery(undefined);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Drive</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? 'Loading...'
              : `${files?.length ?? 0} file${(files?.length ?? 0) !== 1 ? 's' : ''} indexed`}
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={() => setFileBrowserOpen(true)}
        >
          <FolderSearch className="size-4" />
          Index File
        </button>
      </div>

      {isError && <p className="text-sm text-destructive">Failed to load files.</p>}

      {isLoading ? (
        <div className="flex flex-col gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : !files?.length ? (
        <p className="text-sm text-muted-foreground">
          No files indexed yet. Click <strong>Index File</strong> to browse and add files.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {files.map((file) => (
            <FileItem key={file._id} file={file} />
          ))}
        </div>
      )}

      <FileBrowserModal open={fileBrowserOpen} onOpenChange={setFileBrowserOpen} />
    </div>
  );
}
