import type { IndexedFile } from '@/types/file.type';
import { inferLanguageFromFileName } from '@/utils/workspaceCodeTree';

export function isCodeFileName(fileName: string): boolean {
  return inferLanguageFromFileName(fileName) !== 'plain';
}

export function isCodeFile(file: IndexedFile): boolean {
  if (file.isDirectory) return false;
  return isCodeFileName(file.name);
}
