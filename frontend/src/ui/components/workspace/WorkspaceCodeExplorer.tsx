import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FileText,
  Folder,
  FolderPlus,
  MoreHorizontal,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';
import type { CodeFileNode, EditorTheme } from '@/types/workspaceCode.type';
import { cn } from '@/shadcn/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import { Button } from '@/shadcn/components/ui/button';

type WorkspaceCodeExplorerProps = {
  files: CodeFileNode[];
  activeFileId: string | null;
  theme: EditorTheme;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (parentId: string | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  onRename: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
};

const EXPLORER_THEMES = {
  dark: {
    panel: 'border-white/10 bg-[#010409] text-[#e6edf3]',
    muted: 'text-[#8b949e]',
    hover: 'hover:bg-white/5',
    active: 'bg-white/10 text-white',
  },
  light: {
    panel: 'border-border bg-[#eaeef2] text-[#24292f]',
    muted: 'text-[#57606a]',
    hover: 'hover:bg-black/5',
    active: 'bg-white text-[#24292f] shadow-sm',
  },
} as const;

function getFileIcon(name: string) {
  if (name.endsWith('.md')) return FileText;
  return FileCode;
}

type TreeNodeProps = {
  node: CodeFileNode;
  depth: number;
  activeFileId: string | null;
  theme: EditorTheme;
  expandedIds: Set<string>;
  onToggleFolder: (folderId: string) => void;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (parentId: string | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  onRename: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
};

function TreeNode({
  node,
  depth,
  activeFileId,
  theme,
  expandedIds,
  onToggleFolder,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
}: TreeNodeProps) {
  const styles = EXPLORER_THEMES[theme];
  const isFolder = node.type === 'folder';
  const isExpanded = isFolder && expandedIds.has(node.id);
  const isActive = !isFolder && node.id === activeFileId;
  const Icon = isFolder ? Folder : getFileIcon(node.name);

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md pr-1',
          styles.hover,
          isActive && styles.active,
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          <button
            type="button"
            className={cn('rounded p-0.5', styles.muted)}
            onClick={() => onToggleFolder(node.id)}
            aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
          >
            {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
        ) : (
          <span className="size-4.5" />
        )}

        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-sm"
          onClick={() => {
            if (isFolder) {
              onToggleFolder(node.id);
              return;
            }
            onSelectFile(node.id);
          }}
        >
          <Icon className={cn('size-4 shrink-0', isFolder ? 'text-amber-500' : styles.muted)} />
          <span className="truncate">{node.name}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'rounded p-1 opacity-0 transition-opacity group-hover:opacity-100',
                styles.muted,
                'hover:text-foreground',
              )}
              aria-label={`Actions for ${node.name}`}
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isFolder && (
              <>
                <DropdownMenuItem onClick={() => onCreateFile(node.id)}>
                  <Plus className="size-4" />
                  New File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateFolder(node.id)}>
                  <FolderPlus className="size-4" />
                  New Folder
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onRename(node.id)}>
              <Pencil className="size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(node.id)}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isFolder && isExpanded && node.children?.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          activeFileId={activeFileId}
          theme={theme}
          expandedIds={expandedIds}
          onToggleFolder={onToggleFolder}
          onSelectFile={onSelectFile}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export function WorkspaceCodeExplorer({
  files,
  activeFileId,
  theme,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
}: WorkspaceCodeExplorerProps) {
  const styles = EXPLORER_THEMES[theme];
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const effectiveExpandedIds = useMemo(() => {
    if (expandedIds.size > 0) return expandedIds;
    const defaults = new Set<string>();
    files.forEach((node) => {
      if (node.type === 'folder') defaults.add(node.id);
    });
    return defaults;
  }, [expandedIds, files]);

  const toggleFolder = (folderId: string) => {
    setExpandedIds((current) => {
      const base = current.size > 0 ? current : effectiveExpandedIds;
      const next = new Set(base);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  return (
    <aside className={cn('flex w-56 shrink-0 flex-col border-r', styles.panel)}>
      <div className={cn('flex items-center justify-between border-b px-3 py-2', styles.muted)}>
        <span className="text-xs font-semibold uppercase tracking-wide">Explorer</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            onClick={() => onCreateFile(null)}
            aria-label="New file"
          >
            <Plus className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            onClick={() => onCreateFolder(null)}
            aria-label="New folder"
          >
            <FolderPlus className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {files.length === 0 ? (
          <p className={cn('px-2 py-3 text-xs', styles.muted)}>No files yet. Create one to get started.</p>
        ) : (
          files.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              activeFileId={activeFileId}
              theme={theme}
              expandedIds={effectiveExpandedIds}
              onToggleFolder={toggleFolder}
              onSelectFile={onSelectFile}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </aside>
  );
}
