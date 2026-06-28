export type CodeLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'markdown' | 'plain';

export type EditorTheme = 'dark' | 'light';

export type CodeFileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: CodeLanguage;
  indexedFileId?: string;
  children?: CodeFileNode[];
};

export type WorkspaceCodeState = {
  files: CodeFileNode[];
  activeFileId: string | null;
  theme: EditorTheme;
};

export const DEFAULT_WORKSPACE_CODE_STATE: WorkspaceCodeState = {
  files: [],
  activeFileId: null,
  theme: 'dark',
};

export const CODE_LANGUAGE_OPTIONS: { value: CodeLanguage; label: string; extension: string }[] = [
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'typescript', label: 'TypeScript', extension: 'ts' },
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'java', label: 'Java', extension: 'java' },
  { value: 'markdown', label: 'Markdown', extension: 'md' },
  { value: 'plain', label: 'Plain Text', extension: 'txt' },
];

/** @deprecated Legacy single-file fields kept for migration only. */
export type LegacyWorkspaceCodeState = {
  content?: string;
  fileName?: string;
  language?: CodeLanguage;
};
