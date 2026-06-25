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

export type TransferRequestDto = {
  requestId: string;
  fileId: string;
  fileName: string;
  ownerUserId?: string;
  ownerEmail?: string;
  requesterUserId?: string;
  requesterEmail?: string;
  requesterName?: string;
  requestedAt?: string;
};

export type TransferPermissionResponseDto = {
  requestId: string;
  transferId?: string;
  approved: boolean;
  reason?: string;
  ownerUserId?: string;
  ownerEmail?: string;
};

export type TransferStartDto = {
  transferId: string;
  requestId: string;
  fileId: string;
  fileName: string;
  totalSize: number;
  chunkSize: number;
  ownerUserId: string;
  requesterUserId: string;
};

export type TransferChunkPayload = ArrayBuffer | Uint8Array;

export type TransferChunkDto = {
  transferId: string;
  sequence: number;
  isLast: boolean;
  payload: TransferChunkPayload;
};

export type TransferDurableAckDto = {
  transferId: string;
  sequence: number;
  durableBytesWritten: number;
};

export type TransferResumeSyncDto = {
  transferId: string;
  lastDurableSequence: number;
  durableBytesWritten: number;
};

export type TransferCompleteDto = {
  transferId: string;
  totalDurableBytesWritten?: number;
  fileHash?: string;
};

export type TransferCancelDto = {
  transferId: string;
  reason?: string;
};

export type TransferErrorDto = {
  transferId?: string;
  requestId?: string;
  code: string;
  message: string;
};
