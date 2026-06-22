import { useFileUpload } from '@/hooks/useFileUpload';
import { formatSize } from '@/utils/formatSize';
import { FileText, Image, Music, Video, File, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  const cls = 'size-4 shrink-0';
  if (mimeType.startsWith('image/')) return <Image className={cls} />;
  if (mimeType.startsWith('video/')) return <Video className={cls} />;
  if (mimeType.startsWith('audio/')) return <Music className={cls} />;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text'))
    return <FileText className={cls} />;
  return <File className={cls} />;
}

export function UploadProgressToast() {
  const { files, removeFile, clearAll } = useFileUpload();
  const [collapsed, setCollapsed] = useState(false);

  if (files.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-5 right-5 z-50 w-80 overflow-hidden rounded-2xl border border-border shadow-2xl"
      style={{ backgroundColor: 'var(--color-dark-card)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: 'var(--color-dark-card-alt)' }}
      >
        <span className="text-sm font-semibold text-white">
          Uploads{' '}
          <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-xs">{files.length}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-slate-400 transition-colors hover:text-white"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          <button
            onClick={clearAll}
            className="text-slate-400 transition-colors hover:text-white"
            title="Clear all"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* File list */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.ul
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {files.map((file) => (
              <li key={file.id} className="flex flex-col gap-1.5 border-t border-white/5 px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                  <FileTypeIcon mimeType={file.type} />
                  <span className="flex-1 truncate text-sm">{file.name}</span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                    {file.source}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">{formatSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="shrink-0 text-slate-500 transition-colors hover:text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                {file.path ? <span className="truncate text-[11px] text-slate-500">{file.path}</span> : null}
                {/* Progress bar */}
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${file.progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs capitalize text-slate-500">{file.status}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
