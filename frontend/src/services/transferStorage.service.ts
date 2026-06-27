import type { TransferStartDto } from '@homedrive/types';

const DB_NAME = 'homedrive-transfer-db';
const DB_VERSION = 2;
const SESSION_STORE = 'sessions';
const CHUNK_STORE = 'chunks';
const CHUNK_TRANSFER_ID_INDEX = 'transferId';

type TransferSessionRecord = {
  transferId: string;
  fileName: string;
  totalSize: number;
  chunkSize: number;
  lastDurableSequence: number;
  durableBytesWritten: number;
  status: 'active' | 'completed';
  updatedAt: string;
};

export type CompletedTransferSession = {
  transferId: string;
  fileName: string;
  totalSize: number;
  durableBytesWritten: number;
  updatedAt: string;
};

type TransferChunkRecord = {
  transferId: string;
  sequence: number;
  payload: Uint8Array;
  byteLength: number;
  createdAt: string;
};

export type TransferDurabilityProgress = {
  transferId: string;
  lastDurableSequence: number;
  durableBytesWritten: number;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openTransferDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: 'transferId' });
      }

      if (!db.objectStoreNames.contains(CHUNK_STORE)) {
        const chunkStore = db.createObjectStore(CHUNK_STORE, { keyPath: ['transferId', 'sequence'] });
        chunkStore.createIndex(CHUNK_TRANSFER_ID_INDEX, 'transferId', { unique: false });
      } else {
        const tx = request.transaction;
        if (tx) {
          const chunkStore = tx.objectStore(CHUNK_STORE);
          if (!chunkStore.indexNames.contains(CHUNK_TRANSFER_ID_INDEX)) {
            chunkStore.createIndex(CHUNK_TRANSFER_ID_INDEX, 'transferId', { unique: false });
          }
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open transfer database'));
  });

  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB operation failed'));
  });
}

function transactionToPromise(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
}

export async function initializeIncomingTransferSession(payload: TransferStartDto): Promise<void> {
  const db = await openTransferDatabase();
  const tx = db.transaction(SESSION_STORE, 'readwrite');
  const store = tx.objectStore(SESSION_STORE);

  const existing = await requestToPromise(store.get(payload.transferId) as IDBRequest<TransferSessionRecord | undefined>);

  const session: TransferSessionRecord = {
    transferId: payload.transferId,
    fileName: payload.fileName,
    totalSize: payload.totalSize,
    chunkSize: payload.chunkSize,
    lastDurableSequence: existing?.lastDurableSequence ?? -1,
    durableBytesWritten: existing?.durableBytesWritten ?? 0,
    status: existing?.status ?? 'active',
    updatedAt: new Date().toISOString(),
  };

  store.put(session);
  await transactionToPromise(tx);
}

export async function getTransferProgress(transferId: string): Promise<TransferDurabilityProgress | null> {
  const db = await openTransferDatabase();
  const tx = db.transaction(SESSION_STORE, 'readonly');
  const store = tx.objectStore(SESSION_STORE);
  const session = await requestToPromise(store.get(transferId) as IDBRequest<TransferSessionRecord | undefined>);
  await transactionToPromise(tx);

  if (!session) {
    return null;
  }

  return {
    transferId: session.transferId,
    lastDurableSequence: session.lastDurableSequence,
    durableBytesWritten: session.durableBytesWritten,
  };
}

export async function persistIncomingChunk(
  transferId: string,
  sequence: number,
  payload: Uint8Array,
): Promise<TransferDurabilityProgress> {
  const db = await openTransferDatabase();
  const tx = db.transaction([SESSION_STORE, CHUNK_STORE], 'readwrite');
  const sessionStore = tx.objectStore(SESSION_STORE);
  const chunkStore = tx.objectStore(CHUNK_STORE);

  const existingSession = (await requestToPromise(
    sessionStore.get(transferId) as IDBRequest<TransferSessionRecord | undefined>,
  )) ?? {
    transferId,
    fileName: transferId,
    totalSize: 0,
    chunkSize: payload.byteLength,
    lastDurableSequence: -1,
    durableBytesWritten: 0,
    status: 'active' as const,
    updatedAt: new Date().toISOString(),
  };

  const chunkRecord: TransferChunkRecord = {
    transferId,
    sequence,
    payload,
    byteLength: payload.byteLength,
    createdAt: new Date().toISOString(),
  };

  chunkStore.put(chunkRecord);

  const nextLastSequence = Math.max(existingSession.lastDurableSequence, sequence);
  const nextDurableBytesWritten =
    sequence > existingSession.lastDurableSequence
      ? existingSession.durableBytesWritten + payload.byteLength
      : existingSession.durableBytesWritten;

  sessionStore.put({
    ...existingSession,
    lastDurableSequence: nextLastSequence,
    durableBytesWritten: nextDurableBytesWritten,
    status: 'active',
    updatedAt: new Date().toISOString(),
  } satisfies TransferSessionRecord);

  await transactionToPromise(tx);

  return {
    transferId,
    lastDurableSequence: nextLastSequence,
    durableBytesWritten: nextDurableBytesWritten,
  };
}

export async function markTransferCompleted(transferId: string): Promise<void> {
  const db = await openTransferDatabase();
  const tx = db.transaction(SESSION_STORE, 'readwrite');
  const store = tx.objectStore(SESSION_STORE);
  const existing = await requestToPromise(store.get(transferId) as IDBRequest<TransferSessionRecord | undefined>);

  if (existing) {
    store.put({
      ...existing,
      status: 'completed',
      updatedAt: new Date().toISOString(),
    } satisfies TransferSessionRecord);
  }

  await transactionToPromise(tx);
}

export async function listCompletedTransfers(): Promise<CompletedTransferSession[]> {
  const db = await openTransferDatabase();
  const tx = db.transaction(SESSION_STORE, 'readonly');
  const store = tx.objectStore(SESSION_STORE);
  const allSessions = await requestToPromise(store.getAll() as IDBRequest<TransferSessionRecord[]>);
  await transactionToPromise(tx);

  return allSessions
    .filter((session) => session.status === 'completed')
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .map((session) => ({
      transferId: session.transferId,
      fileName: session.fileName,
      totalSize: session.totalSize,
      durableBytesWritten: session.durableBytesWritten,
      updatedAt: session.updatedAt,
    }));
}

async function listChunksByTransferId(transferId: string): Promise<TransferChunkRecord[]> {
  const db = await openTransferDatabase();
  const tx = db.transaction(CHUNK_STORE, 'readonly');
  const store = tx.objectStore(CHUNK_STORE);

  const records: TransferChunkRecord[] = [];

  await new Promise<void>((resolve, reject) => {
    let request: IDBRequest<IDBCursorWithValue | null>;

    if (store.indexNames.contains(CHUNK_TRANSFER_ID_INDEX)) {
      const index = store.index(CHUNK_TRANSFER_ID_INDEX);
      request = index.openCursor(IDBKeyRange.only(transferId));
    } else {
      request = store.openCursor(IDBKeyRange.bound([transferId, 0], [transferId, Number.MAX_SAFE_INTEGER]));
    }

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve();
        return;
      }

      records.push(cursor.value as TransferChunkRecord);
      cursor.continue();
    };

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to iterate transfer chunks'));
    };
  });

  await transactionToPromise(tx);
  records.sort((a, b) => a.sequence - b.sequence);
  return records;
}

export async function buildTransferBlob(
  transferId: string,
): Promise<{ blob: Blob; fileName: string; totalSize: number } | null> {
  const db = await openTransferDatabase();
  const tx = db.transaction(SESSION_STORE, 'readonly');
  const store = tx.objectStore(SESSION_STORE);
  const session = await requestToPromise(store.get(transferId) as IDBRequest<TransferSessionRecord | undefined>);
  await transactionToPromise(tx);

  if (!session) {
    return null;
  }

  const chunks = await listChunksByTransferId(transferId);
  if (chunks.length === 0) {
    return null;
  }

  const parts = chunks.map((chunk) => chunk.payload.buffer.slice(0));
  const blob = new Blob(parts.filter((p): p is ArrayBuffer => p instanceof ArrayBuffer));

  return {
    blob,
    fileName: session.fileName,
    totalSize: session.totalSize,
  };
}
