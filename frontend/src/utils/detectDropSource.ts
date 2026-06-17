export function detectDropSource(items: DataTransferItemList): 'file' | 'folder' {
  for (const item of Array.from(items)) {
    const webkitEntry = (
      item as DataTransferItem & { webkitGetAsEntry?: () => { isDirectory: boolean } | null }
    ).webkitGetAsEntry?.();
    if (webkitEntry?.isDirectory) return 'folder';

    const fsHandleGetter = (
      item as DataTransferItem & {
        getAsFileSystemHandle?: () => Promise<{ kind: 'file' | 'directory' }>;
      }
    ).getAsFileSystemHandle;

    if (fsHandleGetter) {
      return 'folder';
    }
  }

  return 'file';
}
