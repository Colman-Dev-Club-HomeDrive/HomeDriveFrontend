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
  createdAt: string;
  updatedAt: string;
}

export type BrowseEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  extension: string;
  mimeType: string;
};

export type BrowseDirectoryResult = {
  path: string;
  entries: BrowseEntry[];
};
