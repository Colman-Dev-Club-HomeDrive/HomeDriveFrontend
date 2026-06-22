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
