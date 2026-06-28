import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadFileBlob } from '@/services/fileDownload.service';
import { useListWorkspacesQuery } from '@/store/apis/workspaces.api';
import type { IndexedFile } from '@/types/file.type';
import { getIndexedFileId } from '@/utils/workspaceFolder';
import { isCodeFile } from '@/utils/isCodeFile';
import { getCodeFileEditorPath, isCodeWorkspace } from '@/utils/workspaceNavigation';

export function useOpenIndexedFile() {
  const navigate = useNavigate();
  const { data: workspaces = [] } = useListWorkspacesQuery();

  const openInBrowser = useCallback(async (file: IndexedFile) => {
    const fileId = getIndexedFileId(file);
    const blob = await downloadFileBlob(fileId);
    const objectUrl = URL.createObjectURL(blob);
    const openedWindow = window.open(objectUrl, '_blank', 'noopener,noreferrer');

    if (!openedWindow) {
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.click();
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  }, []);

  const openIndexedFile = useCallback(
    async (file: IndexedFile, onOpenFolder?: (file: IndexedFile) => void) => {
      if (file.isDirectory) {
        onOpenFolder?.(file);
        return;
      }

      if (isCodeFile(file) && file.workspaceId) {
        const workspace = workspaces.find((entry) => entry.id === file.workspaceId);
        if (workspace && isCodeWorkspace(workspace)) {
          navigate(getCodeFileEditorPath(file.workspaceId, getIndexedFileId(file)));
          return;
        }
      }

      await openInBrowser(file);
    },
    [navigate, openInBrowser, workspaces],
  );

  return { openIndexedFile };
}
