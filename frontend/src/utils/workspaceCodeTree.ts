import {
  CODE_LANGUAGE_OPTIONS,
  DEFAULT_WORKSPACE_CODE_STATE,
  type CodeFileNode,
  type CodeLanguage,
  type LegacyWorkspaceCodeState,
  type WorkspaceCodeState,
} from '@/types/workspaceCode.type';

export function createCodeNodeId(): string {
  return crypto.randomUUID();
}

export function inferLanguageFromFileName(fileName?: string): CodeLanguage {
  const extension = (fileName ?? '').split('.').pop()?.toLowerCase() ?? '';

  const match = CODE_LANGUAGE_OPTIONS.find((option) => option.extension === extension);
  return match?.value ?? 'plain';
}

function normalizeFileNode(node: Partial<CodeFileNode>): CodeFileNode | null {
  if (!node.id || !node.name?.trim()) return null;

  if (node.type === 'folder') {
    return {
      id: node.id,
      name: sanitizeNodeName(node.name),
      type: 'folder',
      children: normalizeFileNodes(node.children ?? []),
    };
  }

  const name = sanitizeNodeName(node.name) || 'untitled.txt';
  return {
    id: node.id,
    name,
    type: 'file',
    content: typeof node.content === 'string' ? node.content : '',
    language: node.language ?? inferLanguageFromFileName(name),
  };
}

export function normalizeFileNodes(nodes: Partial<CodeFileNode>[]): CodeFileNode[] {
  return nodes
    .map((node) => normalizeFileNode(node))
    .filter((node): node is CodeFileNode => node !== null);
}

export function sanitizeNodeName(value: string): string {
  return value.replace(/[/\\]/g, '').trim();
}

export function createDefaultProject(): CodeFileNode[] {
  const mainId = createCodeNodeId();
  return [
    {
      id: mainId,
      name: 'main.js',
      type: 'file',
      content: '',
      language: 'javascript',
    },
  ];
}

export function findNode(nodes: CodeFileNode[], id: string): CodeFileNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === 'folder' && node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParentId(nodes: CodeFileNode[], id: string, parentId: string | null = null): string | null {
  for (const node of nodes) {
    if (node.id === id) return parentId;
    if (node.type === 'folder' && node.children) {
      const found = findParentId(node.children, id, node.id);
      if (found !== null) return found;
    }
  }
  return null;
}

export function getSiblingNodes(nodes: CodeFileNode[], parentId: string | null): CodeFileNode[] {
  if (!parentId) return nodes;
  const parent = findNode(nodes, parentId);
  return parent?.type === 'folder' ? parent.children ?? [] : [];
}

export function hasSiblingName(nodes: CodeFileNode[], parentId: string | null, name: string, excludeId?: string): boolean {
  return getSiblingNodes(nodes, parentId).some(
    (node) => node.name.toLowerCase() === name.toLowerCase() && node.id !== excludeId,
  );
}

export function uniqueSiblingName(nodes: CodeFileNode[], parentId: string | null, baseName: string): string {
  if (!hasSiblingName(nodes, parentId, baseName)) return baseName;

  const dotIndex = baseName.lastIndexOf('.');
  const stem = dotIndex > 0 ? baseName.slice(0, dotIndex) : baseName;
  const extension = dotIndex > 0 ? baseName.slice(dotIndex) : '';

  let counter = 2;
  let candidate = `${stem}-${counter}${extension}`;
  while (hasSiblingName(nodes, parentId, candidate)) {
    counter += 1;
    candidate = `${stem}-${counter}${extension}`;
  }
  return candidate;
}

export function mapNodes(
  nodes: CodeFileNode[],
  mapper: (node: CodeFileNode) => CodeFileNode,
): CodeFileNode[] {
  return nodes.map((node) => {
    const mapped = mapper(node);
    if (mapped.type === 'folder' && mapped.children) {
      return { ...mapped, children: mapNodes(mapped.children, mapper) };
    }
    return mapped;
  });
}

export function updateNode(
  nodes: CodeFileNode[],
  id: string,
  updater: (node: CodeFileNode) => CodeFileNode,
): CodeFileNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return updater(node);
    }
    if (node.type === 'folder' && node.children) {
      return { ...node, children: updateNode(node.children, id, updater) };
    }
    return node;
  });
}

export function deleteNode(nodes: CodeFileNode[], id: string): CodeFileNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) =>
      node.type === 'folder' && node.children
        ? { ...node, children: deleteNode(node.children, id) }
        : node,
    );
}

export function insertNode(
  nodes: CodeFileNode[],
  parentId: string | null,
  node: CodeFileNode,
): CodeFileNode[] {
  if (!parentId) {
    return [...nodes, node];
  }

  return updateNode(nodes, parentId, (current) => {
    if (current.type !== 'folder') return current;
    return {
      ...current,
      children: [...(current.children ?? []), node],
    };
  });
}

export function createFileNode(nodes: CodeFileNode[], parentId: string | null, name?: string): {
  files: CodeFileNode[];
  fileId: string;
} {
  const fileName = uniqueSiblingName(nodes, parentId, sanitizeNodeName(name ?? 'untitled.js') || 'untitled.js');
  const fileId = createCodeNodeId();
  const fileNode: CodeFileNode = {
    id: fileId,
    name: fileName,
    type: 'file',
    content: '',
    language: inferLanguageFromFileName(fileName),
  };

  return {
    files: insertNode(nodes, parentId, fileNode),
    fileId,
  };
}

export function createFolderNode(nodes: CodeFileNode[], parentId: string | null, name?: string): {
  files: CodeFileNode[];
  folderId: string;
} {
  const folderName = uniqueSiblingName(nodes, parentId, sanitizeNodeName(name ?? 'New Folder') || 'New Folder');
  const folderId = createCodeNodeId();
  const folderNode: CodeFileNode = {
    id: folderId,
    name: folderName,
    type: 'folder',
    children: [],
  };

  return {
    files: insertNode(nodes, parentId, folderNode),
    folderId,
  };
}

export function renameNode(nodes: CodeFileNode[], id: string, nextName: string): CodeFileNode[] {
  const parentId = findParentId(nodes, id);
  const sanitized = sanitizeNodeName(nextName);
  if (!sanitized || hasSiblingName(nodes, parentId, sanitized, id)) {
    return nodes;
  }

  return updateNode(nodes, id, (node) => {
    if (node.type === 'file') {
      return {
        ...node,
        name: sanitized,
        language: node.language ?? inferLanguageFromFileName(sanitized),
      };
    }
    return { ...node, name: sanitized };
  });
}

export function getFirstFileId(nodes: CodeFileNode[]): string | null {
  for (const node of nodes) {
    if (node.type === 'file') return node.id;
    if (node.type === 'folder' && node.children) {
      const nested = getFirstFileId(node.children);
      if (nested) return nested;
    }
  }
  return null;
}

export function getNodePath(nodes: CodeFileNode[], id: string, prefix = ''): string | null {
  for (const node of nodes) {
    const currentPath = prefix ? `${prefix}/${node.name}` : node.name;
    if (node.id === id) return currentPath;
    if (node.type === 'folder' && node.children) {
      const nested = getNodePath(node.children, id, currentPath);
      if (nested) return nested;
    }
  }
  return null;
}

export function normalizeWorkspaceCodeState(
  state: Partial<WorkspaceCodeState & LegacyWorkspaceCodeState>,
): WorkspaceCodeState {
  if (Array.isArray(state.files) && state.files.length > 0) {
    const files = normalizeFileNodes(state.files);
    if (files.length > 0) {
      const activeNode = state.activeFileId ? findNode(files, state.activeFileId) : null;
      const activeFileId =
        activeNode?.type === 'file' ? state.activeFileId! : getFirstFileId(files);

      return {
        files,
        activeFileId,
        theme: state.theme ?? DEFAULT_WORKSPACE_CODE_STATE.theme,
      };
    }
  }

  if (typeof state.content === 'string' || typeof state.fileName === 'string') {
    const fileId = createCodeNodeId();
    const fileName = sanitizeNodeName(state.fileName ?? 'main.txt') || 'main.txt';
    return {
      files: [
        {
          id: fileId,
          name: fileName,
          type: 'file',
          content: state.content ?? '',
          language: state.language ?? inferLanguageFromFileName(fileName),
        },
      ],
      activeFileId: fileId,
      theme: state.theme ?? DEFAULT_WORKSPACE_CODE_STATE.theme,
    };
  }

  const files = createDefaultProject();
  return {
    files,
    activeFileId: files[0]?.id ?? null,
    theme: state.theme ?? DEFAULT_WORKSPACE_CODE_STATE.theme,
  };
}

export function serializeWorkspaceCodeState(state: WorkspaceCodeState): string {
  return JSON.stringify(state);
}

export function statesAreEqual(a: WorkspaceCodeState, b: WorkspaceCodeState): boolean {
  return serializeWorkspaceCodeState(a) === serializeWorkspaceCodeState(b);
}
