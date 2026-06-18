import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import type { DriveFile } from '@/types/file.type';

interface FileUploadContextValue {
  files: DriveFile[];
  isDragging: boolean;
  addFiles: (fileList: FileList | null, source?: 'file' | 'folder') => void;
  removeFile: (id: string) => void;
  clearAll: () => void;
  /** Drag-counter-safe setter — call with true on dragenter, false on dragleave/drop */
  handleDragEnter: () => void;
  handleDragLeave: () => void;
  handleDrop: (fileList: FileList | null, source?: 'file' | 'folder') => void;
}

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

export function FileUploadProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const addFiles = useCallback((fileList: FileList | null, source: 'file' | 'folder' = 'file') => {
    if (!fileList || fileList.length === 0) return;
    const newFiles: DriveFile[] = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
      source,
      path: source === 'folder' ? f.webkitRelativePath || f.name : undefined,
      status: 'queued',
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => setFiles([]), []);

  const handleDragEnter = useCallback(() => {
    dragCounter.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (fileList: FileList | null, source: 'file' | 'folder' = 'file') => {
      dragCounter.current = 0;
      setIsDragging(false);
      addFiles(fileList, source);
    },
    [addFiles],
  );

  return (
    <FileUploadContext.Provider
      value={{ files, isDragging, addFiles, removeFile, clearAll, handleDragEnter, handleDragLeave, handleDrop }}
    >
      {children}
    </FileUploadContext.Provider>
  );
}

export function useFileUpload() {
  const ctx = useContext(FileUploadContext);
  if (!ctx) throw new Error('useFileUpload must be used within <FileUploadProvider>');
  return ctx;
}
