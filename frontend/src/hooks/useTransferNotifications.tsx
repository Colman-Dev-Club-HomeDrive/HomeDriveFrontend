import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { TransferChunkDto, TransferDurableAckDto, TransferRequestDto, TransferStartDto } from '@homedrive/types';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user.slice';
import { VITE_SOCKET_URL } from '@/consts/consts';
import { useFileRelayTransfer } from '@/hooks/useFileRelayTransfer';
import {
  buildTransferBlob,
  type CompletedTransferSession,
  getTransferProgress,
  initializeIncomingTransferSession,
  listCompletedTransfers,
  markTransferCompleted,
  persistIncomingChunk,
} from '@/services/transferStorage.service';

type RequestableFile = {
  id: string;
  name: string;
  ownerId: string;
};

type TransferNotificationsContextValue = {
  isToastOpen: boolean;
  setToastOpen: (isOpen: boolean) => void;
  toggleToast: () => void;
  notificationCount: number;
  permissionPrompts: ReturnType<typeof useFileRelayTransfer>['permissionPrompts'];
  permissionResults: ReturnType<typeof useFileRelayTransfer>['permissionResults'];
  transferErrors: ReturnType<typeof useFileRelayTransfer>['transferErrors'];
  approvePrompt: (requestId: string) => Promise<void>;
  denyPrompt: (requestId: string) => void;
  requestFileFromOwner: (file: RequestableFile) => void;
  clearPermissionResult: (requestId: string) => void;
  clearTransferError: (index: number) => void;
  completedTransfers: CompletedTransferSession[];
  downloadCompletedTransfer: (transferId: string) => Promise<void>;
};

const TransferNotificationsContext = createContext<TransferNotificationsContextValue | null>(null);

type StoredAuthUser = {
  id: string;
  email?: string;
  name?: string;
};

function readStoredAuthUser(): StoredAuthUser | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAuthUser;
  } catch (_error) {
    return null;
  }
}

function getCurrentUserId(userId: string, storedUser: StoredAuthUser | null): string {
  return storedUser?.id ?? userId;
}

function toUint8Array(payload: TransferChunkDto['payload']): Uint8Array {
  if (payload instanceof Uint8Array) {
    return payload;
  }

  return new Uint8Array(payload);
}

function pickFileFromDevice(acceptFileName?: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.accept = acceptFileName ? `.${acceptFileName.split('.').pop() ?? ''}` : '';

    input.onchange = () => {
      const file = input.files?.[0] ?? null;
      input.remove();
      resolve(file);
    };

    input.oncancel = () => {
      input.remove();
      resolve(null);
    };

    document.body.appendChild(input);
    input.click();
  });
}

export function TransferNotificationsProvider({ children }: { children: ReactNode }) {
  const user = useAppSelector(selectUser);
  const storedUser = readStoredAuthUser();
  const socketUrl = VITE_SOCKET_URL ?? '';
  const currentUserId = getCurrentUserId(user.id, storedUser);

  const {
    socket,
    permissionPrompts,
    permissionResults,
    transferErrors,
    requestFile,
    respondToPermission,
    sendStreamStart,
    sendChunk,
    completeTransfer,
    cancelTransfer,
    emitTransferError,
    emitDurableAckAfterWrite,
    syncResume,
    clearPermissionPrompt,
    clearPermissionResult,
    clearTransferError,
  } = useFileRelayTransfer(socketUrl);

  const [isToastOpen, setToastOpen] = useState(false);
  const [completedTransfers, setCompletedTransfers] = useState<CompletedTransferSession[]>([]);
  const ackWaitersRef = useRef<
    Map<
      string,
      {
        resolve: () => void;
        reject: (error: Error) => void;
        timeoutId: number;
      }
    >
  >(new Map());
  const resumeHintsRef = useRef<Map<string, number>>(new Map());

  const waitForAck = useCallback((transferId: string, sequence: number) => {
    const key = `${transferId}:${sequence}`;

    return new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        ackWaitersRef.current.delete(key);
        reject(new Error(`Ack timeout for ${key}`));
      }, 20_000);

      ackWaitersRef.current.set(key, { resolve, reject, timeoutId });
    });
  }, []);

  const toggleToast = useCallback(() => {
    setToastOpen((prev) => !prev);
  }, []);

  const refreshCompletedTransfers = useCallback(async () => {
    const transfers = await listCompletedTransfers();
    setCompletedTransfers(transfers);
  }, []);

  useEffect(() => {
    refreshCompletedTransfers().catch(() => {
      // best-effort refresh
    });
  }, [refreshCompletedTransfers]);

  const approvePrompt = useCallback(
    async (requestId: string) => {
      const promptData = permissionPrompts.find((item) => item.requestId === requestId);
      if (!promptData) return;

      const file = await pickFileFromDevice(promptData.fileName);
      if (!file) {
        respondToPermission({
          requestId,
          approved: false,
          reason: 'Denied by owner',
        });
        clearPermissionPrompt(requestId);
        return;
      }

      respondToPermission({
        requestId,
        transferId: requestId,
        approved: true,
      });
      clearPermissionPrompt(requestId);

      const chunkSize = 512 * 1024;
      const startPayload: TransferStartDto = {
        transferId: requestId,
        requestId,
        fileId: promptData.fileId,
        fileName: file.name,
        totalSize: file.size,
        chunkSize,
        ownerUserId: currentUserId,
        requesterUserId: promptData.requesterUserId ?? '',
      };

      sendStreamStart(startPayload);

      await new Promise((resolve) => window.setTimeout(resolve, 300));
      const resumeSequence = resumeHintsRef.current.get(requestId) ?? -1;
      const startSequence = resumeSequence + 1;
      const startOffset = startSequence * chunkSize;

      if (startOffset >= file.size) {
        completeTransfer({ transferId: requestId, totalDurableBytesWritten: file.size });
        return;
      }

      try {
        for (
          let sequence = startSequence, offset = startOffset;
          offset < file.size;
          sequence += 1, offset += chunkSize
        ) {
          const nextChunk = file.slice(offset, offset + chunkSize);
          const payload = await nextChunk.arrayBuffer();
          const isLast = offset + chunkSize >= file.size;

          sendChunk({
            transferId: requestId,
            sequence,
            isLast,
            payload,
          });

          await waitForAck(requestId, sequence);
        }

        completeTransfer({ transferId: requestId, totalDurableBytesWritten: file.size });
        resumeHintsRef.current.delete(requestId);
      } catch (error) {
        cancelTransfer({ transferId: requestId, reason: 'Streaming aborted while waiting for ACK' });
        emitTransferError({
          transferId: requestId,
          requestId,
          code: 'stream_interrupted',
          message: error instanceof Error ? error.message : 'Unknown streaming error',
        });
        resumeHintsRef.current.delete(requestId);
      }
    },
    [
      permissionPrompts,
      respondToPermission,
      clearPermissionPrompt,
      currentUserId,
      sendStreamStart,
      sendChunk,
      waitForAck,
      completeTransfer,
      cancelTransfer,
      emitTransferError,
    ],
  );

  const denyPrompt = useCallback(
    (requestId: string) => {
      respondToPermission({
        requestId,
        approved: false,
        reason: 'Denied by owner',
      });
      clearPermissionPrompt(requestId);
    },
    [respondToPermission, clearPermissionPrompt],
  );

  const requestFileFromOwner = useCallback(
    (file: RequestableFile) => {
      if (!socketUrl) return;

      requestFile({
        requestId: crypto.randomUUID(),
        fileId: file.id,
        fileName: file.name,
        ownerUserId: file.ownerId,
        requesterUserId: currentUserId,
        requesterEmail: storedUser?.email,
        requesterName: storedUser?.name ?? user.name,
        requestedAt: new Date().toISOString(),
      });
    },
    [requestFile, socketUrl, currentUserId, storedUser?.email, storedUser?.name, user.name],
  );

  const downloadCompletedTransfer = useCallback(async (transferId: string) => {
    const result = await buildTransferBlob(transferId);
    if (!result) {
      throw new Error('No transfer data found to download');
    }

    const objectUrl = URL.createObjectURL(result.blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = result.fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onDurableAck = (payload: TransferDurableAckDto) => {
      const key = `${payload.transferId}:${payload.sequence}`;
      const waiter = ackWaitersRef.current.get(key);
      if (!waiter) return;

      window.clearTimeout(waiter.timeoutId);
      ackWaitersRef.current.delete(key);
      waiter.resolve();
    };

    const onStreamStart = async (payload: TransferStartDto) => {
      await initializeIncomingTransferSession(payload);

      const progress = await getTransferProgress(payload.transferId);
      if (progress && progress.lastDurableSequence >= 0) {
        syncResume({
          transferId: payload.transferId,
          lastDurableSequence: progress.lastDurableSequence,
          durableBytesWritten: progress.durableBytesWritten,
        });
      }

      setToastOpen(true);
    };

    const onChunk = async (payload: TransferChunkDto) => {
      const binaryPayload = toUint8Array(payload.payload);

      await emitDurableAckAfterWrite(
        {
          transferId: payload.transferId,
          sequence: payload.sequence,
          durableBytesWritten: 0,
        },
        async () => {
          const progress = await persistIncomingChunk(payload.transferId, payload.sequence, binaryPayload);
          return progress.durableBytesWritten;
        },
      );
    };

    const onComplete = async (payload: { transferId: string }) => {
      await markTransferCompleted(payload.transferId);
      await refreshCompletedTransfers();
    };

    const onResumeSync = (payload: { transferId: string; lastDurableSequence: number }) => {
      resumeHintsRef.current.set(payload.transferId, payload.lastDurableSequence);
    };

    const onCancel = (payload: { transferId: string }) => {
      resumeHintsRef.current.delete(payload.transferId);
    };

    socket.on('file:durable-ack', onDurableAck);
    socket.on('file:stream-start', onStreamStart);
    socket.on('file:chunk', onChunk);
    socket.on('file:complete', onComplete);
    socket.on('file:resume-sync', onResumeSync);
    socket.on('file:cancel', onCancel);

    return () => {
      socket.off('file:durable-ack', onDurableAck);
      socket.off('file:stream-start', onStreamStart);
      socket.off('file:chunk', onChunk);
      socket.off('file:complete', onComplete);
      socket.off('file:resume-sync', onResumeSync);
      socket.off('file:cancel', onCancel);
    };
  }, [socket, emitDurableAckAfterWrite, refreshCompletedTransfers, syncResume]);

  const value = useMemo<TransferNotificationsContextValue>(
    () => ({
      isToastOpen,
      setToastOpen,
      toggleToast,
      notificationCount: permissionPrompts.length,
      permissionPrompts,
      permissionResults,
      transferErrors,
      approvePrompt,
      denyPrompt,
      requestFileFromOwner,
      clearPermissionResult,
      clearTransferError,
      completedTransfers,
      downloadCompletedTransfer,
    }),
    [
      isToastOpen,
      toggleToast,
      permissionPrompts,
      permissionResults,
      transferErrors,
      approvePrompt,
      denyPrompt,
      requestFileFromOwner,
      clearPermissionResult,
      clearTransferError,
      completedTransfers,
      downloadCompletedTransfer,
    ],
  );

  return <TransferNotificationsContext.Provider value={value}>{children}</TransferNotificationsContext.Provider>;
}

export function useTransferNotifications() {
  const context = useContext(TransferNotificationsContext);
  if (!context) {
    throw new Error('useTransferNotifications must be used within <TransferNotificationsProvider>');
  }

  return context;
}
