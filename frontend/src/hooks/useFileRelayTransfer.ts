import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  TransferCancelDto,
  TransferChunkDto,
  TransferCompleteDto,
  TransferDurableAckDto,
  TransferErrorDto,
  TransferPermissionResponseDto,
  TransferRequestDto,
  TransferResumeSyncDto,
  TransferStartDto,
} from '@homedrive/types';
import { useSockets } from '@/sockets/useSockets';
import {
  clearTransferCheckpoint,
  loadTransferCheckpoint,
  saveTransferCheckpoint,
} from '@/services/transferCheckpoint.service';

export type DurableWriteFn = () => Promise<number | void>;

export function useFileRelayTransfer(socketUrl: string) {
  const { getSocket } = useSockets();
  const socket = getSocket(socketUrl);

  const [permissionPrompts, setPermissionPrompts] = useState<TransferRequestDto[]>([]);
  const [permissionResults, setPermissionResults] = useState<TransferPermissionResponseDto[]>([]);
  const [transferErrors, setTransferErrors] = useState<TransferErrorDto[]>([]);

  useEffect(() => {
    if (!socket) return;

    const onPermissionPrompt = (payload: TransferRequestDto) => {
      setPermissionPrompts((prev) => [payload, ...prev]);
    };

    const onPermissionResult = (payload: TransferPermissionResponseDto) => {
      setPermissionResults((prev) => [payload, ...prev]);
    };

    const onTransferError = (payload: TransferErrorDto) => {
      setTransferErrors((prev) => [payload, ...prev]);
    };

    socket.on('file:permission-prompt', onPermissionPrompt);
    socket.on('file:permission-result', onPermissionResult);
    socket.on('file:error', onTransferError);

    return () => {
      socket.off('file:permission-prompt', onPermissionPrompt);
      socket.off('file:permission-result', onPermissionResult);
      socket.off('file:error', onTransferError);
    };
  }, [socket]);

  const requestFile = useCallback(
    (payload: TransferRequestDto) => {
      socket?.emit('file:request', payload);
    },
    [socket],
  );

  const respondToPermission = useCallback(
    (payload: TransferPermissionResponseDto) => {
      socket?.emit('file:permission-response', payload);
    },
    [socket],
  );

  const sendStreamStart = useCallback(
    (payload: TransferStartDto) => {
      socket?.emit('file:stream-start', payload);
    },
    [socket],
  );

  const sendChunk = useCallback(
    (payload: TransferChunkDto) => {
      socket?.emit('file:chunk', payload);
    },
    [socket],
  );

  const emitDurableAckAfterWrite = useCallback(
    async (ack: TransferDurableAckDto, writeChunk: DurableWriteFn) => {
      const maybeDurableBytes = await writeChunk();
      const durableBytesWritten =
        typeof maybeDurableBytes === 'number' ? maybeDurableBytes : ack.durableBytesWritten;
      const durableAck: TransferDurableAckDto = {
        ...ack,
        durableBytesWritten,
      };

      saveTransferCheckpoint({
        transferId: durableAck.transferId,
        lastDurableSequence: durableAck.sequence,
        durableBytesWritten: durableAck.durableBytesWritten,
        updatedAt: new Date().toISOString(),
      });
      socket?.emit('file:durable-ack', durableAck);
    },
    [socket],
  );

  const syncResume = useCallback(
    (payload: TransferResumeSyncDto) => {
      saveTransferCheckpoint({
        transferId: payload.transferId,
        lastDurableSequence: payload.lastDurableSequence,
        durableBytesWritten: payload.durableBytesWritten,
        updatedAt: new Date().toISOString(),
      });
      socket?.emit('file:resume-sync', payload);
    },
    [socket],
  );

  const syncResumeFromCheckpoint = useCallback(
    (transferId: string) => {
      const checkpoint = loadTransferCheckpoint(transferId);
      if (!checkpoint) {
        return;
      }

      socket?.emit('file:resume-sync', {
        transferId,
        lastDurableSequence: checkpoint.lastDurableSequence,
        durableBytesWritten: checkpoint.durableBytesWritten,
      });
    },
    [socket],
  );

  const completeTransfer = useCallback(
    (payload: TransferCompleteDto) => {
      socket?.emit('file:complete', payload);
      clearTransferCheckpoint(payload.transferId);
    },
    [socket],
  );

  const cancelTransfer = useCallback(
    (payload: TransferCancelDto) => {
      socket?.emit('file:cancel', payload);
      clearTransferCheckpoint(payload.transferId);
    },
    [socket],
  );

  const emitTransferError = useCallback(
    (payload: TransferErrorDto) => {
      socket?.emit('file:error', payload);
    },
    [socket],
  );

  const clearPermissionPrompt = useCallback((requestId: string) => {
    setPermissionPrompts((prev) => prev.filter((request) => request.requestId !== requestId));
  }, []);

  const clearPermissionResult = useCallback((requestId: string) => {
    setPermissionResults((prev) => prev.filter((result) => result.requestId !== requestId));
  }, []);

  const clearTransferError = useCallback((index: number) => {
    setTransferErrors((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }, []);

  return useMemo(
    () => ({
      socket,
      permissionPrompts,
      permissionResults,
      transferErrors,
      requestFile,
      respondToPermission,
      sendStreamStart,
      sendChunk,
      emitDurableAckAfterWrite,
      syncResume,
      syncResumeFromCheckpoint,
      completeTransfer,
      cancelTransfer,
      emitTransferError,
      clearPermissionPrompt,
      clearPermissionResult,
      clearTransferError,
    }),
    [
      socket,
      permissionPrompts,
      permissionResults,
      transferErrors,
      requestFile,
      respondToPermission,
      sendStreamStart,
      sendChunk,
      emitDurableAckAfterWrite,
      syncResume,
      syncResumeFromCheckpoint,
      completeTransfer,
      cancelTransfer,
      emitTransferError,
      clearPermissionPrompt,
      clearPermissionResult,
      clearTransferError,
    ],
  );
}
