export type SharePermission = 'readonly' | 'editor';

export type ShareRole = SharePermission | 'owner';

export type CollaboratorAccess = {
  email: string;
  permission: SharePermission;
};

export type ShareAccessPerson = {
  id: string;
  email: string;
  displayName?: string;
  role: 'owner' | 'collaborator';
  permission?: SharePermission;
};

export const SHARE_PERMISSION_LABELS: Record<SharePermission, string> = {
  readonly: 'Read only',
  editor: 'Editor',
};

export const SHARE_ROLE_LABELS: Record<ShareRole, string> = {
  owner: 'Owner',
  editor: 'Editor',
  readonly: 'Read only',
};
