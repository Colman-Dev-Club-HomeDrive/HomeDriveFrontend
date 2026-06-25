import type { TransferResumeSyncDto } from '@homedrive/types';

const CHECKPOINT_KEY_PREFIX = 'transfer-checkpoint:';

export type TransferCheckpoint = TransferResumeSyncDto & {
  updatedAt: string;
  writerMode?: 'file-system-access' | 'streamed-download' | 'durable-browser-storage';
};

function toStorageKey(transferId: string): string {
  return `${CHECKPOINT_KEY_PREFIX}${transferId}`;
}

export function saveTransferCheckpoint(checkpoint: TransferCheckpoint): void {
  localStorage.setItem(toStorageKey(checkpoint.transferId), JSON.stringify(checkpoint));
}

export function loadTransferCheckpoint(transferId: string): TransferCheckpoint | null {
  const raw = localStorage.getItem(toStorageKey(transferId));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TransferCheckpoint;
  } catch (_error) {
    return null;
  }
}

export function clearTransferCheckpoint(transferId: string): void {
  localStorage.removeItem(toStorageKey(transferId));
}
