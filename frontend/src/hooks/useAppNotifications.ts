import { useMemo } from 'react';
import { useListFilesQuery } from '@/store/apis/files.api';
import { useListWorkspacesQuery } from '@/store/apis/workspaces.api';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user.slice';
import { useTransferNotifications } from '@/hooks/useTransferNotifications';
import { parseCollaboratorEmails } from '@/utils/collaboration';

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

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function buildCurrentUserMarkers(userId: string, userName: string, userEmail: string) {
  return new Set(
    [userId, userName, userEmail]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map(normalize),
  );
}

function isSharedWithCurrentUser(collaboration: string | undefined, currentUserMarkers: Set<string>) {
  if (currentUserMarkers.size === 0) return false;

  return parseCollaboratorEmails(collaboration).some((collaborator) => currentUserMarkers.has(collaborator));
}

export function useAppNotifications() {
  const user = useAppSelector(selectUser);
  const { data: workspaces = [] } = useListWorkspacesQuery();
  const { data: files = [] } = useListFilesQuery(undefined);
  const { permissionPrompts, approvePrompt, denyPrompt } = useTransferNotifications();

  const currentUserMarkers = useMemo(
    () => buildCurrentUserMarkers(user.id, user.name, user.email),
    [user.email, user.id, user.name],
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