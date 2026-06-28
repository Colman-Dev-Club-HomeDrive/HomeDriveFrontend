import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Copy, Moon, Save, Sun } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn/components/ui/select';
import {
  loadWorkspaceCodeState,
  saveWorkspaceCodeState,
} from '@/services/workspaceCodeStorage.service';
import { downloadFileAsText } from '@/services/fileDownload.service';
import {
  CODE_LANGUAGE_OPTIONS,
  DEFAULT_WORKSPACE_CODE_STATE,
  type CodeLanguage,
  type WorkspaceCodeState,
} from '@/types/workspaceCode.type';
import { highlightCode } from '@/utils/highlightCode';
import {
  createFileNode,
  createFolderNode,
  deleteNode,
  findNode,
  getFirstFileId,
  getNodePath,
  inferLanguageFromFileName,
  renameNode,
  sanitizeNodeName,
  statesAreEqual,
  updateNode,
  upsertIndexedFileNode,
} from '@/utils/workspaceCodeTree';
import { cn } from '@/shadcn/lib/utils';
import { WorkspaceCodeExplorer } from '@/ui/components/workspace/WorkspaceCodeExplorer';
import { CodeItemNameDialog } from '@/ui/components/workspace/CodeItemNameDialog';
import { CODE_TOOLBAR_BUTTON_CLASS } from '@/ui/components/workspace/codeToolbar.const';

type OpenIndexedFileTarget = {
  id: string;
  name: string;
  content?: string;
};

type WorkspaceCodeEditorProps = {
  workspaceId: string;
  workspaceName: string;
  topBar?: (controls: ReactNode) => ReactNode;
  openIndexedFile?: OpenIndexedFileTarget | null;
};

type NameDialogState =
  | { open: false }
  | {
      open: true;
      mode: 'create-file' | 'create-folder' | 'rename';
      parentId: string | null;
      targetId: string | null;
      initialName: string;
      title: string;
    };

const EDITOR_THEMES = {
  dark: {
    shell: 'bg-[#0d1117] border-border',
    toolbar: 'border-white/10 text-[#8b949e]',
    gutter: 'border-white/10 bg-[#010409] text-[#6e7681]',
    text: 'text-[#e6edf3]',
    caret: 'caret-[#e6edf3]',
    placeholder: 'placeholder:text-[#6e7681]',
    input: 'bg-white/5 text-[#e6edf3] border-white/10 focus:border-white/20',
  },
  light: {
    shell: 'bg-[#f6f8fa] border-border',
    toolbar: 'border-border text-[#57606a]',
    gutter: 'border-border bg-[#eaeef2] text-[#57606a]',
    text: 'text-[#24292f]',
    caret: 'caret-[#24292f]',
    placeholder: 'placeholder:text-[#8c959f]',
    input: 'bg-white text-[#24292f] border-border focus:border-ring',
  },
} as const;

export function WorkspaceCodeEditor({
  workspaceId,
  workspaceName,
  topBar,
  openIndexedFile,
}: WorkspaceCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const [project, setProject] = useState<WorkspaceCodeState>(DEFAULT_WORKSPACE_CODE_STATE);
  const [savedState, setSavedState] = useState<WorkspaceCodeState>(DEFAULT_WORKSPACE_CODE_STATE);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [nameDialog, setNameDialog] = useState<NameDialogState>({ open: false });

  useEffect(() => {
    const stored = loadWorkspaceCodeState(workspaceId);
    setProject(stored);
    setSavedState(stored);
    setCopyMessage(null);
    setNameDialog({ open: false });
  }, [workspaceId]);

  useEffect(() => {
    if (!openIndexedFile) return;

    let cancelled = false;

    void (async () => {
      try {
        const content =
          openIndexedFile.content ?? (await downloadFileAsText(openIndexedFile.id));
        if (cancelled) return;

        setProject((current) => {
          const { files, fileId } = upsertIndexedFileNode(
            current.files,
            openIndexedFile.id,
            openIndexedFile.name,
            content,
          );
          return { ...current, files, activeFileId: fileId };
        });
      } catch (error) {
        console.error('Failed to load file into editor:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [openIndexedFile?.id, openIndexedFile?.name, openIndexedFile?.content]);

  const activeFile = project.activeFileId ? findNode(project.files, project.activeFileId) : null;
  const activeFileIsOpen = activeFile?.type === 'file';
  const content = activeFileIsOpen ? (activeFile.content ?? '') : '';
  const language = activeFileIsOpen
    ? (activeFile.language ?? inferLanguageFromFileName(activeFile.name))
    : 'plain';
  const filePath = project.activeFileId ? (getNodePath(project.files, project.activeFileId) ?? '') : '';
  const fileName = activeFileIsOpen ? (activeFile.name ?? '') : '';

  const isDirty = !statesAreEqual(project, savedState);
  const lineCount = useMemo(() => Math.max((content ?? '').split('\n').length, 1), [content]);
  const themeStyles = EDITOR_THEMES[project.theme];

  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, index) => index + 1),
    [lineCount],
  );

  const highlightedHtml = useMemo(
    () => `${highlightCode(content, language, project.theme)}\n`,
    [content, language, project.theme],
  );

  const placeholder = language === 'python' ? '# Write your code here...' : '// Write your code here...';

  const handleSave = useCallback(() => {
    saveWorkspaceCodeState(workspaceId, project);
    setSavedState(project);
  }, [workspaceId, project]);

  const handleCopy = useCallback(async () => {
    if (!activeFileIsOpen) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopyMessage('Copied!');
      window.setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage('Copy failed');
      window.setTimeout(() => setCopyMessage(null), 2000);
    }
  }, [activeFileIsOpen, content]);

  const loadIndexedFileIntoNode = useCallback(
    async (indexedFileId: string, name: string, nodeId: string) => {
      try {
        const content = await downloadFileAsText(indexedFileId);
        setProject((current) => ({
          ...current,
          files: updateNode(current.files, nodeId, (node) => ({
            ...node,
            content,
            language: inferLanguageFromFileName(name),
            indexedFileId,
          })),
        }));
      } catch (error) {
        console.error('Failed to load file into editor:', error);
      }
    },
    [],
  );

  const handleSelectFile = (fileId: string) => {
    setProject((current) => {
      const node = findNode(current.files, fileId);
      if (node?.type === 'file' && node.indexedFileId && !node.content?.trim()) {
        void loadIndexedFileIntoNode(node.indexedFileId, node.name, fileId);
      }
      return { ...current, activeFileId: fileId };
    });
  };

  const handleContentChange = (nextContent: string) => {
    if (!project.activeFileId || !activeFileIsOpen) return;
    setProject((current) => ({
      ...current,
      files: updateNode(current.files, project.activeFileId!, (node) => ({
        ...node,
        content: nextContent,
      })),
    }));
  };

  const handleLanguageChange = (nextLanguage: CodeLanguage) => {
    if (!project.activeFileId || !activeFileIsOpen) return;
    setProject((current) => ({
      ...current,
      files: updateNode(current.files, project.activeFileId!, (node) => ({
        ...node,
        language: nextLanguage,
      })),
    }));
  };

  const handleFileNameChange = (nextName: string) => {
    if (!project.activeFileId || !activeFileIsOpen) return;
    const sanitized = sanitizeNodeName(nextName);
    if (!sanitized) return;
    setProject((current) => ({
      ...current,
      files: renameNode(current.files, project.activeFileId!, sanitized),
    }));
  };

  const openCreateFileDialog = (parentId: string | null) => {
    setNameDialog({
      open: true,
      mode: 'create-file',
      parentId,
      targetId: null,
      initialName: 'untitled.js',
      title: parentId ? 'New File in Folder' : 'New File',
    });
  };

  const openCreateFolderDialog = (parentId: string | null) => {
    setNameDialog({
      open: true,
      mode: 'create-folder',
      parentId,
      targetId: null,
      initialName: 'New Folder',
      title: parentId ? 'New Folder' : 'New Folder',
    });
  };

  const openRenameDialog = (targetId: string) => {
    const node = findNode(project.files, targetId);
    if (!node) return;
    setNameDialog({
      open: true,
      mode: 'rename',
      parentId: null,
      targetId,
      initialName: node.name,
      title: node.type === 'folder' ? 'Rename Folder' : 'Rename File',
    });
  };

  const handleDelete = (targetId: string) => {
    const node = findNode(project.files, targetId);
    if (!node) return;

    const label = node.type === 'folder' ? 'folder' : 'file';
    const confirmed = window.confirm(`Delete ${label} "${node.name}"?`);
    if (!confirmed) return;

    setProject((current) => {
      const nextFiles = deleteNode(current.files, targetId);
      const activeStillExists = current.activeFileId
        ? Boolean(findNode(nextFiles, current.activeFileId))
        : false;

      return {
        ...current,
        files: nextFiles,
        activeFileId: activeStillExists ? current.activeFileId : getFirstFileId(nextFiles),
      };
    });
  };

  const handleNameDialogConfirm = (name: string) => {
    if (!nameDialog.open) return;

    if (nameDialog.mode === 'create-file') {
      setProject((current) => {
        const { files, fileId } = createFileNode(current.files, nameDialog.parentId, name);
        return { ...current, files, activeFileId: fileId };
      });
      return;
    }

    if (nameDialog.mode === 'create-folder') {
      setProject((current) => {
        const { files } = createFolderNode(current.files, nameDialog.parentId, name);
        return { ...current, files };
      });
      return;
    }

    if (nameDialog.targetId) {
      setProject((current) => ({
        ...current,
        files: renameNode(current.files, nameDialog.targetId!, name),
      }));
    }
  };

  const handleScroll = () => {
    const textarea = textareaRef.current;
    const gutter = gutterRef.current;
    const highlight = highlightRef.current;
    if (!textarea) return;

    if (gutter) gutter.scrollTop = textarea.scrollTop;
    if (highlight) {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault();
      handleSave();
      return;
    }

    if (event.key !== 'Tab') return;

    event.preventDefault();
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const indent = '  ';
    const nextValue = `${content.slice(0, start)}${indent}${content.slice(end)}`;

    handleContentChange(nextValue);

    requestAnimationFrame(() => {
      textarea.selectionStart = start + indent.length;
      textarea.selectionEnd = start + indent.length;
    });
  };

  const editorControls = (
    <>
      <span className={cn(CODE_TOOLBAR_BUTTON_CLASS, 'cursor-default')}>
        {isDirty ? 'Unsaved changes' : 'Saved'}
      </span>

      <Select
        value={language}
        onValueChange={(value) => handleLanguageChange(value as CodeLanguage)}
        disabled={!activeFileIsOpen}
      >
        <SelectTrigger
          className={cn(
            CODE_TOOLBAR_BUTTON_CLASS,
            'h-auto w-auto min-w-[9.5rem] border-0 shadow-none focus:ring-0 data-[size=sm]:h-auto',
            "[&_svg:not([class*='text-'])]:text-primary-foreground",
          )}
        >
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {CODE_LANGUAGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        className={CODE_TOOLBAR_BUTTON_CLASS}
        onClick={() =>
          setProject((current) => ({
            ...current,
            theme: current.theme === 'dark' ? 'light' : 'dark',
          }))
        }
        aria-label={project.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {project.theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        {project.theme === 'dark' ? 'Light' : 'Dark'}
      </button>

      <button
        type="button"
        className={CODE_TOOLBAR_BUTTON_CLASS}
        onClick={() => void handleCopy()}
        disabled={!activeFileIsOpen}
      >
        <Copy className="size-4" />
        Copy
      </button>
      {copyMessage ? <span className={cn(CODE_TOOLBAR_BUTTON_CLASS, 'cursor-default')}>{copyMessage}</span> : null}

      <button type="button" className={CODE_TOOLBAR_BUTTON_CLASS} onClick={handleSave} disabled={!isDirty}>
        <Save className="size-4" />
        Save
      </button>
    </>
  );

  return (
    <section className="flex flex-col gap-2">
      {topBar ? (
        topBar(editorControls)
      ) : (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Code</h2>
            <p className="text-sm text-muted-foreground">
              Edit code for <span className="font-medium text-foreground">{workspaceName}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">{editorControls}</div>
        </div>
      )}

      <div className={cn('overflow-hidden rounded-2xl border shadow-sm', themeStyles.shell)}>
        <div className="flex h-[min(78vh,760px)] min-h-[420px]">
          <WorkspaceCodeExplorer
            files={project.files}
            activeFileId={project.activeFileId}
            theme={project.theme}
            onSelectFile={handleSelectFile}
            onCreateFile={openCreateFileDialog}
            onCreateFolder={openCreateFolderDialog}
            onRename={openRenameDialog}
            onDelete={handleDelete}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div
              className={cn(
                'flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2',
                themeStyles.toolbar,
              )}
            >
              <input
                type="text"
                value={fileName}
                onChange={(event) => handleFileNameChange(event.target.value)}
                disabled={!activeFileIsOpen}
                aria-label="File name"
                className={cn(
                  'min-w-[140px] rounded-md border px-2 py-1 font-mono text-xs outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50',
                  themeStyles.input,
                )}
              />
              <span className="truncate text-xs">
                {filePath || 'Select a file'}
                {activeFileIsOpen ? ` · ${lineCount} line${lineCount !== 1 ? 's' : ''}` : ''}
              </span>
            </div>

            {activeFileIsOpen ? (
              <div className="flex min-h-[320px] flex-1">
                <div
                  ref={gutterRef}
                  aria-hidden
                  className={cn(
                    'select-none overflow-hidden border-r px-3 py-3 text-right font-mono text-xs leading-6',
                    themeStyles.gutter,
                  )}
                >
                  {lineNumbers.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>

                <div className="relative min-h-[320px] flex-1 overflow-hidden">
                  <pre
                    ref={highlightRef}
                    aria-hidden
                    className={cn(
                      'pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-sm leading-6',
                      themeStyles.text,
                    )}
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                  />

                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(event) => handleContentChange(event.target.value)}
                    onScroll={handleScroll}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    className={cn(
                      'relative z-10 min-h-[320px] w-full resize-none bg-transparent px-4 py-3 font-mono text-sm leading-6 text-transparent outline-none',
                      themeStyles.caret,
                      themeStyles.placeholder,
                    )}
                    placeholder={placeholder}
                  />
                </div>
              </div>
            ) : (
              <div className={cn('flex flex-1 items-center justify-center p-8 text-sm', themeStyles.toolbar)}>
                Select a file from the explorer or create a new one.
              </div>
            )}
          </div>
        </div>
      </div>

      {nameDialog.open && (
        <CodeItemNameDialog
          open={nameDialog.open}
          mode={nameDialog.mode}
          initialName={nameDialog.initialName}
          title={nameDialog.title}
          onOpenChange={(open) => {
            if (!open) setNameDialog({ open: false });
          }}
          onConfirm={handleNameDialogConfirm}
        />
      )}
    </section>
  );
}
