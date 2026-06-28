import type { IndexedFile } from '@/types/file.type';

export function getIndexedFileId(file: IndexedFile): string {
  return file.id || file._id;
}

function getDirectoryPathPrefix(path: string): string {
  if (path.endsWith('/') || path.endsWith('\\')) return path;
  return `${path}/`;
}

export function getChildFiles(files: IndexedFile[], folderId: string | null): IndexedFile[] {
  if (!folderId) {
    const directoryPrefixes = files
      .filter((file) => file.isDirectory && file.path)
      .map((file) => getDirectoryPathPrefix(file.path));

    return files.filter((file) => {
      if (!file.path) return true;

      const isNestedUnderDirectory = directoryPrefixes.some((prefix) => {
        const directoryPath = prefix.slice(0, -1);
        if (file.path === directoryPath) return false;
        return file.path.startsWith(prefix);
      });

      return !isNestedUnderDirectory;
    });
  }

  const folder = files.find((file) => getIndexedFileId(file) === folderId);
  if (!folder?.path) {
    return [];
  }

  const prefix = getDirectoryPathPrefix(folder.path);
  return files.filter((file) => {
    const fileId = getIndexedFileId(file);
    if (fileId === folderId) return false;
    if (!file.path?.startsWith(prefix)) return false;

    const remainder = file.path.slice(prefix.length);
    return remainder.length > 0 && !remainder.includes('/') && !remainder.includes('\\');
  });
}

export function getCurrentFolder(files: IndexedFile[], folderId: string | null): IndexedFile | null {
  if (!folderId) return null;
  return files.find((file) => getIndexedFileId(file) === folderId) ?? null;
}
