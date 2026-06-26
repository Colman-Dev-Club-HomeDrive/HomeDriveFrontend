import { useState } from 'react';
import { FolderSearch } from 'lucide-react';
import { FileBrowserModal } from '@/ui/components/FileBrowserModal';
import { FileItem } from '@/ui/components/FileItem';
import { useListFilesQuery } from '@/store/apis/files.api';
import type { MediaType } from '@/types/file.type';
import { useSearchParams } from 'react-router-dom';

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

export function MyDrive() {
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const mediaType = parseMediaType(searchParams.get('mediaType'));
  const { data: files, isLoading, isError } = useListFilesQuery(
    mediaType ? { mediaType } : undefined
  );

  const clearMediaFilter = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('mediaType');
    setSearchParams(nextParams);
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Drive</h1>
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
