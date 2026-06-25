import { useFileUpload } from '@/hooks/useFileUpload';
import { formatSize } from '@/utils/formatSize';
import { Check, FileText, Image, Music, Video, File, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useTransferNotifications } from '../../hooks/useTransferNotifications';

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
  const {
    isToastOpen,
    setToastOpen,
    permissionPrompts,
    permissionResults,
    transferErrors,
    approvePrompt,
    denyPrompt,
    clearPermissionResult,
    clearTransferError,
    completedTransfers,
    downloadCompletedTransfer,
  } = useTransferNotifications();
  const [collapsed, setCollapsed] = useState(false);

  const hasTransferData =
    permissionPrompts.length > 0 || permissionResults.length > 0 || transferErrors.length > 0;
  const hasUploadData = files.length > 0;

  if (!hasUploadData && !hasTransferData) return null;
  if (!isToastOpen && !hasUploadData) return null;

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
          Transfer Center{' '}
          <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-xs">
            {files.length + permissionPrompts.length}
          </span>
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
            onClick={() => {
              clearAll();
              setToastOpen(false);
            }}
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
            {permissionPrompts.map((prompt) => (
              <li key={prompt.requestId} className="flex flex-col gap-1.5 border-t border-white/5 px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                  <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                  <span className="flex-1 truncate text-sm">Approval needed: {prompt.fileName}</span>
                  <button
                    onClick={() => approvePrompt(prompt.requestId)}
                    className="shrink-0 rounded-md p-1 text-emerald-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
                    title="Approve"
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    onClick={() => denyPrompt(prompt.requestId)}
                    className="shrink-0 rounded-md p-1 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                    title="Deny"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <span className="truncate text-[11px] text-slate-500">
                  Request from {prompt.requesterEmail ?? prompt.requesterUserId ?? 'unknown user'}
                </span>
              </li>
            ))}

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

            {permissionResults.slice(0, 3).map((result) => (
              <li key={result.requestId} className="flex flex-col gap-1.5 border-t border-white/5 px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                  <Check className={`size-4 shrink-0 ${result.approved ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="flex-1 truncate text-sm">
                    Request {result.approved ? 'approved' : 'denied'}
                  </span>
                  <button
                    onClick={() => clearPermissionResult(result.requestId)}
                    className="shrink-0 text-slate-500 transition-colors hover:text-white"
                    title="Dismiss"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <span className="truncate text-[11px] text-slate-500">Request id: {result.requestId}</span>
              </li>
            ))}

            {transferErrors.slice(0, 3).map((error, index) => (
              <li key={`${error.code}-${index}`} className="flex flex-col gap-1.5 border-t border-white/5 px-4 py-3">
                <div className="flex items-center gap-2 text-red-300">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span className="flex-1 truncate text-sm">{error.code}</span>
                  <button
                    onClick={() => clearTransferError(index)}
                    className="shrink-0 text-slate-500 transition-colors hover:text-white"
                    title="Dismiss"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <span className="truncate text-[11px] text-slate-500">{error.message}</span>
              </li>
            ))}

            {completedTransfers.slice(0, 5).map((transfer) => (
              <li
                key={transfer.transferId}
                className="flex flex-col gap-1.5 border-t border-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-white">
                  <Check className="size-4 shrink-0 text-emerald-400" />
                  <span className="flex-1 truncate text-sm">Ready to download: {transfer.fileName}</span>
                  <button
                    onClick={() => downloadCompletedTransfer(transfer.transferId)}
                    className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-200 transition-colors hover:bg-white/20"
                    title="Download"
                  >
                    Save
                  </button>
                </div>
                <span className="truncate text-[11px] text-slate-500">
                  {formatSize(transfer.durableBytesWritten)} received
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
