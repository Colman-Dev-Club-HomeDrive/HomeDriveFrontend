import { ACTIONS } from '@/consts/consts';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useHotkey } from '@tanstack/react-hotkeys';
import { FolderPlus, Plus } from 'lucide-react';
import { useRef } from 'react';

export function CreateNewCard() {
  const { addFiles, isDragging } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleActionClick = (label: string) => {
    if (label === 'Upload Files') fileInputRef.current?.click();
    if (label === 'New Folder') folderInputRef.current?.click();
  };

  const isTypingTarget = (target: EventTarget | null) =>
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable);

  useHotkey('Mod+U', (event) => {
    if (isTypingTarget(event.target)) return;
    event.preventDefault();
    fileInputRef.current?.click();
  });

  useHotkey('Mod+F', (event) => {
    if (isTypingTarget(event.target)) return;
    event.preventDefault();
    folderInputRef.current?.click();
  });

  return (
    <div
      className={`flex h-full flex-col justify-between rounded-2xl p-5 text-white transition-all duration-200 ${
        isDragging ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent' : ''
      }`}
      style={{ backgroundColor: 'var(--color-dark-card)' }}
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files, 'file')}
      />
      <input
        ref={(el) => {
          folderInputRef.current = el;
          if (el) {
            el.setAttribute('webkitdirectory', '');
            el.setAttribute('directory', '');
          }
        }}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files, 'folder')}
      />

      {/* Top: drop hint + heading */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button
            className="flex size-7 items-center justify-center rounded-full hover:opacity-80"
            style={{ backgroundColor: 'var(--color-dark-card-alt)' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="size-4" />
          </button>
          Drop anywhere to upload
        </div>
        <div>
          <h2 className="text-2xl font-bold">Add to Drive</h2>
          <p className="mt-0.5 text-sm text-slate-400">Upload files or folders to your drive</p>
        </div>
      </div>

      {/* Bottom: action rows */}
      <div className="flex flex-col gap-2">
        {ACTIONS.map(({ label, icon: Icon, shortcut }) => (
          <button
            key={label}
            onClick={() => handleActionClick(label)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--color-dark-card-alt)' }}
          >
            {label === 'New Folder' ? <FolderPlus className="size-4 shrink-0 text-slate-400" /> : <Icon className="size-4 shrink-0 text-slate-400" />}
            <span className="flex-1 text-left">{label}</span>
            <span className="text-xs text-slate-500">{shortcut}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
