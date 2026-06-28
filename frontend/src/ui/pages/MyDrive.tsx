import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Folder, FolderSearch } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FileItem } from '@/ui/components/FileItem';
import { WorkspaceFolderBreadcrumbs } from '@/ui/components/WorkspaceFolderBreadcrumbs';
import { useListFilesQuery } from '@/store/apis/files.api';
import { useListWorkspacesQuery } from '@/store/apis/workspaces.api';
import type { IndexedFile, MediaType } from '@/types/file.type';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFileSearch } from '@/hooks/useFileSearch';
import {
  filterIndexedFilesBySearch,
  filterWorkspacesBySearch,
  normalizeSearchQuery,
} from '@/utils/filterBySearchQuery';
import { getChildFiles, getCurrentFolder, getIndexedFileId } from '@/utils/workspaceFolder';
import { getWorkspacePath, isCodeWorkspace } from '@/utils/workspaceNavigation';
import { isCodeFile } from '@/utils/isCodeFile';
import { WorkspaceCodeEditor } from '@/ui/components/workspace/WorkspaceCodeEditor';
import { CODE_TOOLBAR_BUTTON_CLASS } from '@/ui/components/workspace/codeToolbar.const';

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

function sortWorkspaceItems(items: IndexedFile[]): IndexedFile[] {
  return [...items].sort((left, right) => {
    if (left.isDirectory !== right.isDirectory) {
      return left.isDirectory ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });
}

export function MyDrive() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { addFiles } = useFileUpload();
  const [searchParams, setSearchParams] = useSearchParams();
  const { workspaceId } = useParams();
  const mediaType = parseMediaType(searchParams.get('mediaType'));
  const { data: workspaces = [] } = useListWorkspacesQuery();
  const workspace = workspaceId ? workspaces.find((entry) => entry.id === workspaceId) : undefined;
  const isCodeView = Boolean(workspace && isCodeWorkspace(workspace));
  const folderId = workspaceId && !isCodeView ? searchParams.get('folder') : null;
  const openFileId = isCodeView ? searchParams.get('file') : null;
  const [uploadedOpenFile, setUploadedOpenFile] = useState<{
    id: string;
    name: string;
    content?: string;
  } | null>(null);
  const { query } = useFileSearch();
  const isSearching = normalizeSearchQuery(query).length > 0;
  const listFilesArgs = useMemo(() => {
    if (workspaceId) {
      return { workspaceId, ...(mediaType ? { mediaType } : {}) };
    }

    if (isSearching) return undefined;
    if (mediaType) return { mediaType };
    return undefined;
  }, [isSearching, mediaType, workspaceId]);

  const { data: files, isLoading, isError } = useListFilesQuery(listFilesArgs);

  const workspaceFiles = files ?? [];
  const currentFolder = getCurrentFolder(workspaceFiles, folderId);

  useEffect(() => {
    if (!workspaceId || !workspace) return;

    if (!isCodeWorkspace(workspace) && searchParams.get('tab') === 'code') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('tab');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams, workspace, workspaceId]);

  const filteredWorkspaces = useMemo(
    () => (isSearching ? filterWorkspacesBySearch(workspaces, query) : []),
    [workspaces, query, isSearching],
  );

  const workspaceFolderItems = useMemo(() => {
    if (!workspaceId || isCodeView) return [] as IndexedFile[];

    return sortWorkspaceItems(getChildFiles(workspaceFiles, folderId));
  }, [folderId, isCodeView, workspaceFiles, workspaceId]);

  const openIndexedFile = useMemo(() => {
    if (!openFileId) return null;

    const match = workspaceFiles.find((file) => getIndexedFileId(file) === openFileId);
    const name =
      uploadedOpenFile?.id === openFileId
        ? uploadedOpenFile.name
        : match?.name ?? 'untitled.txt';
    const content = uploadedOpenFile?.id === openFileId ? uploadedOpenFile.content : undefined;

    return { id: openFileId, name, content };
  }, [openFileId, uploadedOpenFile, workspaceFiles]);

  const handleUploadedFile = useCallback(
    (indexedFile: IndexedFile, localContent?: string) => {
      if (!isCodeView || !isCodeFile(indexedFile)) return;

      const fileId = getIndexedFileId(indexedFile);
      setUploadedOpenFile({ id: fileId, name: indexedFile.name, content: localContent });

      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('file', fileId);
      setSearchParams(nextParams);
    },
    [isCodeView, searchParams, setSearchParams],
  );

  const filteredFiles = useMemo(() => {
    if (workspaceId && !isSearching && !isCodeView) {
      return workspaceFolderItems;
    }

    return filterIndexedFilesBySearch(workspaceFiles, query);
  }, [isCodeView, isSearching, query, workspaceFiles, workspaceFolderItems, workspaceId]);

  const hasSearchResults = filteredWorkspaces.length > 0 || filteredFiles.length > 0;

  const breadcrumbs = useMemo(() => {
    if (!workspace || !folderId) {
      return workspace ? [{ id: null, label: workspace.name }] : [];
    }

    return [
      { id: null, label: workspace.name },
      { id: folderId, label: currentFolder?.name ?? 'Folder' },
    ];
  }, [currentFolder?.name, folderId, workspace]);

  const clearMediaFilter = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('mediaType');
    setSearchParams(nextParams);
  };

  const navigateToFolder = (nextFolderId: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('tab');

    if (!nextFolderId) {
      nextParams.delete('folder');
    } else {
      nextParams.set('folder', nextFolderId);
    }

    const search = nextParams.toString();
    navigate({
      pathname: workspaceId ? `/workspaces/${workspaceId}` : '/mydrive',
      search: search ? `?${search}` : '',
    });
  };

  const handleOpenFolder = (file: IndexedFile) => {
    navigateToFolder(getIndexedFileId(file));
  };

  const addFileButton = (
    <button
      type="button"
      className={CODE_TOOLBAR_BUTTON_CLASS}
      onClick={() => fileInputRef.current?.click()}
    >
      <FolderSearch className="size-4" />
      Add File
    </button>
  );

  const showWorkspaceFolderList = Boolean(workspaceId && !isCodeView && !isSearching);
  const visibleWorkspaceItems = showWorkspaceFolderList ? workspaceFolderItems : [];
  const visibleSearchFiles = !showWorkspaceFolderList ? filteredFiles : [];

  return (
    <div
      className={
        isCodeView
          ? 'mx-auto flex min-h-full w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6'
          : 'mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6'
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files, 'file', {
            ...(workspaceId ? { workspaceId } : {}),
            ...(isCodeView ? { onUploaded: handleUploadedFile } : {}),
          });
          e.currentTarget.value = '';
        }}
      />

      {isCodeView ? (
        <WorkspaceCodeEditor
          workspaceId={workspaceId!}
          workspaceName={workspace!.name}
          openIndexedFile={openIndexedFile}
          topBar={(controls) => (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold">Code</h1>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {controls}
                {addFileButton}
              </div>
            </div>
          )}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{workspace?.name ?? 'My Drive'}</h1>
              {workspace && folderId && (
                <WorkspaceFolderBreadcrumbs
                  crumbs={breadcrumbs}
                  onNavigate={navigateToFolder}
                  className="mt-2"
                />
              )}
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
            {addFileButton}
          </div>

          {isError && <p className="text-sm text-destructive">Failed to load files.</p>}

          {isLoading ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : showWorkspaceFolderList && visibleWorkspaceItems.length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground">This folder is empty.</p>
          ) : !files?.length && !isSearching && !workspaceId ? (
            <p className="text-sm text-muted-foreground">
              No files indexed yet. Click <strong>Add File</strong> to browse and add files.
            </p>
          ) : isSearching && !hasSearchResults ? (
            <p className="text-sm text-muted-foreground">No files found</p>
          ) : (
            <div className="flex flex-col gap-4">
              {isSearching && filteredWorkspaces.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {filteredWorkspaces.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => navigate(getWorkspacePath(entry))}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <Folder className="size-4 shrink-0 text-yellow-500" />
                      <span className="text-sm font-medium">{entry.name}</span>
                      <span className="text-xs text-muted-foreground">Workspace</span>
                    </button>
                  ))}
                </div>
              )}
              {visibleWorkspaceItems.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {visibleWorkspaceItems.map((file) => (
                    <FileItem
                      key={getIndexedFileId(file)}
                      file={file}
                      onOpenFolder={handleOpenFolder}
                    />
                  ))}
                </div>
              )}
              {visibleSearchFiles.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {visibleSearchFiles.map((file) => (
                    <FileItem
                      key={file._id}
                      file={file}
                      onOpenFolder={workspaceId ? handleOpenFolder : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
