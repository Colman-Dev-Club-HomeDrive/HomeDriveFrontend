import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Loader2, Lock, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { API_BASE_URL } from '@/consts/consts';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user.slice';
import type { IndexedFile } from '@/types/file.type';

type FileShareDialogProps = {
  file: IndexedFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveCollaborators: (shareWith: string) => Promise<void>;
  isLoading?: boolean;
};

function parseCollaborators(value?: string): string[] {
  if (!value) return [];

  const unique = new Set<string>();
  for (const part of value.split(',')) {
    const normalized = part.trim().toLowerCase();
    if (normalized) unique.add(normalized);
  }

  return Array.from(unique);
}

export function FileShareDialog({
  file,
  open,
  onOpenChange,
  onSaveCollaborators,
  isLoading = false,
}: FileShareDialogProps) {
  const user = useAppSelector(selectUser);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [draftCollaborators, setDraftCollaborators] = useState<string[]>([]);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !file) return;

    setDraftCollaborators(parseCollaborators(file.collaboration));
    setNewCollaborator('');
    setCopied(false);
  }, [file, open]);

  const downloadUrl = useMemo(() => {
    if (!file) return '';
    return `${API_BASE_URL}/files/${file.id || file._id}/download`;
  }, [file]);

  const everyoneWithAccess = useMemo(() => {
    const ownerMarker = user.email?.trim() || user.name?.trim() || 'You';
    return [ownerMarker, ...draftCollaborators.filter((item) => item !== ownerMarker.toLowerCase())];
  }, [draftCollaborators, user.email, user.name]);

  const addCollaboratorToDraft = () => {
    const normalized = newCollaborator.trim().toLowerCase();
    if (!normalized) return;
    if (draftCollaborators.includes(normalized)) {
      setNewCollaborator('');
      return;
    }

    setDraftCollaborators((prev) => [...prev, normalized]);
    setNewCollaborator('');
  };

  const handleCopyLink = async () => {
    if (!downloadUrl) return;

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('failed to copy share link:', error);
    } finally {
      setIsCopying(false);
    }
  };

  const handleSave = async () => {
    if (!file) return;

    const nextValue = draftCollaborators.join(', ');
    try {
      await onSaveCollaborators(nextValue);
      onOpenChange(false);
    } catch (error) {
      console.error('failed to save file collaborators:', error);
    }
  };

  const onEmailKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCollaboratorToDraft();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share &quot;{file?.name ?? 'File'}&quot;</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Add people, groups, or emails</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCollaborator}
                onChange={(event) => setNewCollaborator(event.target.value)}
                onKeyDown={onEmailKeyDown}
                placeholder="name@example.com"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-slate-500"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={addCollaboratorToDraft}
                className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
                disabled={isLoading || !newCollaborator.trim()}
              >
                <Plus className="size-4" />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-base font-semibold text-slate-900">People with access</p>
            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              {everyoneWithAccess.map((person, index) => (
                <div key={`${person}-${index}`} className="flex items-center justify-between text-sm">
                  <span className="text-slate-800">{person}</span>
                  <span className="text-slate-500">{index === 0 ? 'Owner' : 'Editor'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            <p className="text-base font-semibold text-slate-900">General access</p>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Lock className="size-4" />
              Restricted - only invited people can access this file.
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between">
          <button
            type="button"
            onClick={handleCopyLink}
            disabled={isCopying || !downloadUrl}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            {copied ? <Check className="size-4 text-emerald-600" /> : isCopying ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />}
            {copied ? 'Link copied' : 'Copy link'}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              Done
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
