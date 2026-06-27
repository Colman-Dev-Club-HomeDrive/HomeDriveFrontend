export type FileStatus = 'queued' | 'uploading' | 'done' | 'error';

export interface DriveFile {
  id: string;
  name: string;
  size: number;
  type: string;
  source: 'file' | 'folder';
  path?: string;
  status: FileStatus;
  progress: number;
}

/** A file or folder that has been indexed (recorded) in the backend database. */
export interface IndexedFile {
  _id: string;
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  extension: string;
  isDirectory: boolean;
  workspaceId?: string;
  ownerId: string;
  collaboration?: string;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = 'documents' | 'photos' | 'videos' | 'audio';

export type MediaTypeCount = {
  mediaType: MediaType;
  count: number;
};

export type StorageStats = {
  statsPath: string;
  capacityBytes: number;
  availableBytes: number;
  serverUsedBytes: number;
  metadataUsedBytes: number;
};
