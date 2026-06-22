// Shared types between backend and frontend

export type WorkspaceIcon = 'folder' | 'link' | 'document' | 'code';

/** The canonical Workspace shape returned by the API.
 *  `id` is the string form of MongoDB's `_id` (exposed via `toJSON: { virtuals: true }`).
 *  `position` is the sort index (0-based) persisted in MongoDB.
 */
export type Workspace = {
  id: string;
  name: string;
  icon: WorkspaceIcon;
  color: string;
  fileCount: number;
  position: number;
  description?: string;
  collaboration?: string;
  pinned?: boolean;
  /** ISO string — set when pinned, cleared when unpinned. Used to order pinned items. */
  pinnedAt?: string;
};

export type CreateWorkspaceDto = {
  name: string;
  icon: WorkspaceIcon;
  color: string;
  shareWith?: string;
};

export type UpdateWorkspaceDto = {
  name?: string;
  description?: string;
  collaboration?: string;
  color?: string;
  pinned?: boolean;
  pinnedAt?: string | null;
};
