import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import type { DriveFile, IndexedFile } from '@/types/file.type';
import { useUploadFileMutation } from '@/store/apis/files.api';
import { useCreateWorkspaceMutation } from '@/store/apis/workspaces.api';
import { WORKSPACE_COLORS } from '@/consts/consts';
import { isCodeFileName } from '@/utils/isCodeFile';

interface FileUploadContextValue {
  files: DriveFile[];
  isDragging: boolean;
  addFiles: (
    fileList: FileList | null,
    source?: 'file' | 'folder',
    options?: {
      workspaceId?: string;
      onUploaded?: (file: IndexedFile, localContent?: string) => void;
    },
  ) => void;
  removeFile: (id: string) => void;
  clearAll: () => void;
  /** Drag-counter-safe setter — call with true on dragenter, false on dragleave/drop */
  handleDragEnter: () => void;
  handleDragLeave: () => void;
  handleDrop: (
    fileList: FileList | null,
    source?: 'file' | 'folder',
    options?: {
      workspaceId?: string;
      onUploaded?: (file: IndexedFile, localContent?: string) => void;
    },
  ) => void;
}

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

export function FileUploadProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const [uploadFile] = useUploadFileMutation();
  const [createWorkspace] = useCreateWorkspaceMutation();

  const setFileProgress = useCallback((id: string, status: DriveFile['status'], progress: number) => {
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, status, progress } : file)));
  }, []);

  const addFiles = useCallback(
    (
      fileList: FileList | null,
      source: 'file' | 'folder' = 'file',
      options?: {
        workspaceId?: string;
        onUploaded?: (file: IndexedFile, localContent?: string) => void;
      },
    ) => {
      if (!fileList || fileList.length === 0) return;
      const selectedFiles = Array.from(fileList);
      const newFiles: DriveFile[] = selectedFiles.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        source,
        path: source === 'folder' ? f.webkitRelativePath || f.name : undefined,
        status: 'queued',
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      void (async () => {
        const workspaceIdByRootFolder = new Map<string, string>();

        if (source === 'folder' && !options?.workspaceId) {
          const rootFolders = Array.from(
            new Set(
              selectedFiles
                .map((file) => file.webkitRelativePath.split('/').filter(Boolean)[0])
                .filter((folderName) => folderName && folderName.trim() !== ''),
            ),
          );

          await Promise.all(
            rootFolders.map(async (folderName, index) => {
              try {
                const createdWorkspace = await createWorkspace({
                  name: folderName,
                  icon: 'folder',
                  color: WORKSPACE_COLORS[index % WORKSPACE_COLORS.length],
                }).unwrap();
                workspaceIdByRootFolder.set(folderName, createdWorkspace.id);
              } catch {
                // If workspace creation fails, files still upload to My Drive.
              }
            }),
          );
        }

        newFiles.forEach((queuedFile, index) => {
          const browserFile = selectedFiles[index];
          const rootFolder = browserFile.webkitRelativePath.split('/').filter(Boolean)[0];
          const derivedWorkspaceId =
            options?.workspaceId ?? (rootFolder ? workspaceIdByRootFolder.get(rootFolder) : undefined);

          void (async () => {
            try {
              setFileProgress(queuedFile.id, 'uploading', 25);
              const indexedFile = await uploadFile({
                file: browserFile,
                ...(derivedWorkspaceId ? { workspaceId: derivedWorkspaceId } : {}),
              }).unwrap();
              setFileProgress(queuedFile.id, 'done', 100);

              let localContent: string | undefined;
              if (isCodeFileName(browserFile.name)) {
                try {
                  localContent = await browserFile.text();
                } catch {
                  localContent = undefined;
                }
              }

              options?.onUploaded?.(indexedFile, localContent);
            } catch {
              setFileProgress(queuedFile.id, 'error', 0);
            }
          })();
        });
      })();
    },
    [createWorkspace, uploadFile, setFileProgress],
  );

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
    (
      fileList: FileList | null,
      source: 'file' | 'folder' = 'file',
      options?: {
        workspaceId?: string;
        onUploaded?: (file: IndexedFile, localContent?: string) => void;
      },
    ) => {
      dragCounter.current = 0;
      setIsDragging(false);
      addFiles(fileList, source, options);
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
