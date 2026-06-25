import type { Socket } from 'socket.io-client';
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

export type ServerToClientEvents = {
  'file:permission-prompt': (payload: TransferRequestDto) => void;
  'file:permission-result': (payload: TransferPermissionResponseDto) => void;
  'file:stream-start': (payload: TransferStartDto) => void;
  'file:chunk': (payload: TransferChunkDto) => void;
  'file:durable-ack': (payload: TransferDurableAckDto) => void;
  'file:resume-sync': (payload: TransferResumeSyncDto) => void;
  'file:complete': (payload: TransferCompleteDto) => void;
  'file:cancel': (payload: TransferCancelDto) => void;
  'file:error': (payload: TransferErrorDto) => void;
};
export type ClientToServerEvents = {
  'file:request': (payload: TransferRequestDto) => void;
  'file:permission-response': (payload: TransferPermissionResponseDto) => void;
  'file:stream-start': (payload: TransferStartDto) => void;
  'file:chunk': (payload: TransferChunkDto) => void;
  'file:durable-ack': (payload: TransferDurableAckDto) => void;
  'file:resume-sync': (payload: TransferResumeSyncDto) => void;
  'file:complete': (payload: TransferCompleteDto) => void;
  'file:cancel': (payload: TransferCancelDto) => void;
  'file:error': (payload: TransferErrorDto) => void;
};
export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
export type SocketsByUrl = Record<string, AppSocket>;
export type SocketStatusByUrl = Record<string, SocketStatus>;

export type SocketsContextValue = SocketsByUrl;
export type SocketStatusesContextValue = SocketStatusByUrl;
