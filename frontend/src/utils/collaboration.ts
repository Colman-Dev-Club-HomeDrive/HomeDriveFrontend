import type { CollaboratorAccess, SharePermission } from '@/types/share.type';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeSharePermission(value: string): SharePermission | null {
  const normalized = value.trim().toLowerCase().replace(/[\s_-]+/g, '');

  if (normalized === 'readonly' || normalized === 'read') {
    return 'readonly';
  }

  if (normalized === 'editor' || normalized === 'write') {
    return 'editor';
  }

  return null;
}

export function parseCollaboration(value?: string): CollaboratorAccess[] {
  if (!value) return [];

  const unique = new Map<string, CollaboratorAccess>();

  for (const entry of value.split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const separatorIndex = trimmed.lastIndexOf(':');
    if (separatorIndex > 0) {
      const email = normalizeEmail(trimmed.slice(0, separatorIndex));
      const permission = normalizeSharePermission(trimmed.slice(separatorIndex + 1));
      if (email && permission) {
        unique.set(email, { email, permission });
        continue;
      }
    }

    const email = normalizeEmail(trimmed);
    if (email) {
      unique.set(email, { email, permission: 'editor' });
    }
  }

  return Array.from(unique.values());
}

export function serializeCollaboration(collaborators: CollaboratorAccess[]): string {
  return collaborators
    .map((collaborator) => `${collaborator.email}:${collaborator.permission}`)
    .join(', ');
}

export function parseCollaboratorEmails(value?: string): string[] {
  return parseCollaboration(value).map((collaborator) => collaborator.email);
}
