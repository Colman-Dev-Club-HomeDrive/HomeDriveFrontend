import { useMemo } from 'react';
import { useListFilesQuery } from '@/store/apis/files.api';
import { useListWorkspacesQuery } from '@/store/apis/workspaces.api';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user.slice';
import { useTransferNotifications } from '@/hooks/useTransferNotifications';

type StoredAuthUser = {
  id?: string;
  email?: string;
  name?: string;
};

type BaseNotification = {
  id: string;
  title: string;
  description: string;
};

export type SharedAccessNotification = BaseNotification & {
  kind: 'workspace-access' | 'file-access';
};

export type DownloadRequestNotification = BaseNotification & {
  kind: 'download-request';
  requestId: string;
  requesterLabel: string;
  fileName: string;
};

export type AppNotification = SharedAccessNotification | DownloadRequestNotification;

function readStoredAuthUser(): StoredAuthUser | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function parseCollaborators(value?: string): string[] {
  if (!value) return [];

  return value
    .split(',')
    .map((item) => normalize(item))
    .filter(Boolean);
}

function buildCurrentUserMarkers(userId: string, userName: string, storedUser: StoredAuthUser | null) {
  return new Set(
    [userId, userName, storedUser?.id, storedUser?.email, storedUser?.name]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map(normalize),
  );
}

function isSharedWithCurrentUser(collaboration: string | undefined, currentUserMarkers: Set<string>) {
  if (currentUserMarkers.size === 0) return false;

  return parseCollaborators(collaboration).some((collaborator) => currentUserMarkers.has(collaborator));
}

export function useAppNotifications() {
  const user = useAppSelector(selectUser);
  const storedUser = readStoredAuthUser();
  const { data: workspaces = [] } = useListWorkspacesQuery();
  const { data: files = [] } = useListFilesQuery(undefined);
  const { permissionPrompts, approvePrompt, denyPrompt } = useTransferNotifications();

  const currentUserMarkers = useMemo(
    () => buildCurrentUserMarkers(user.id, user.name, storedUser),
    [storedUser, user.id, user.name],
  );

  const sharedAccessNotifications = useMemo<SharedAccessNotification[]>(() => {
    const workspaceNotifications = workspaces
      .filter((workspace) => isSharedWithCurrentUser(workspace.collaboration, currentUserMarkers))
      .map<SharedAccessNotification>((workspace) => ({
        id: `workspace:${workspace.id}`,
        kind: 'workspace-access',
        title: `${workspace.name} was shared with you`,
        description: 'You were added as a collaborator on this workspace.',
      }));

    const fileNotifications = files
      .filter((file) => isSharedWithCurrentUser(file.collaboration, currentUserMarkers))
      .map<SharedAccessNotification>((file) => ({
        id: `file:${file.id || file._id}`,
        kind: 'file-access',
        title: `${file.name} was shared with you`,
        description: 'You were added as a collaborator on this file.',
      }));

    return [...workspaceNotifications, ...fileNotifications];
  }, [currentUserMarkers, files, workspaces]);

  const downloadRequestNotifications = useMemo<DownloadRequestNotification[]>(
    () =>
      permissionPrompts.map((prompt) => ({
        id: `request:${prompt.requestId}`,
        kind: 'download-request',
        requestId: prompt.requestId,
        fileName: prompt.fileName,
        requesterLabel: prompt.requesterName ?? prompt.requesterEmail ?? prompt.requesterUserId ?? 'Unknown user',
        title: `Download request for ${prompt.fileName}`,
        description: `${prompt.requesterName ?? prompt.requesterEmail ?? prompt.requesterUserId ?? 'Someone'} asked to download a shared file.`,
      })),
    [permissionPrompts],
  );

  return {
    notificationCount: sharedAccessNotifications.length + downloadRequestNotifications.length,
    sharedAccessNotifications,
    downloadRequestNotifications,
    approvePrompt,
    denyPrompt,
  };
}