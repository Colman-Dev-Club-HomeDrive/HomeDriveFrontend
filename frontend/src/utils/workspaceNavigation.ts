import type { Workspace } from '@/types/workspace.type';

export function isCodeWorkspace(workspace: Pick<Workspace, 'icon'>): boolean {
  return workspace.icon === 'code';
}

export function getWorkspacePath(workspace: Pick<Workspace, 'id' | 'icon'>): string {
  if (isCodeWorkspace(workspace)) {
    return `/workspaces/${workspace.id}?tab=code`;
  }

  return `/workspaces/${workspace.id}`;
}
