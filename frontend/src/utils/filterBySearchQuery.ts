import type { IndexedFile } from '@/types/file.type';
import type { Workspace } from '@/types/workspace.type';

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function fileMatchesSearchQuery(file: IndexedFile, query: string): boolean {
  const search = normalizeSearchQuery(query);
  if (!search) return true;

  return (
    file.name.toLowerCase().includes(search) ||
    file.path.toLowerCase().includes(search)
  );
}

export function filterIndexedFilesBySearch(files: IndexedFile[], query: string): IndexedFile[] {
  const search = normalizeSearchQuery(query);
  if (!search) return files;
  return files.filter((file) => fileMatchesSearchQuery(file, search));
}

export function workspaceMatchesSearchQuery(workspace: Workspace, query: string): boolean {
  const search = normalizeSearchQuery(query);
  if (!search) return true;
  return workspace.name.toLowerCase().includes(search);
}

export function filterWorkspacesBySearch(workspaces: Workspace[], query: string): Workspace[] {
  const search = normalizeSearchQuery(query);
  if (!search) return workspaces;
  return workspaces.filter((workspace) => workspaceMatchesSearchQuery(workspace, search));
}
