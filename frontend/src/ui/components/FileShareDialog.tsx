import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useShareFileMutation } from '@/store/apis/files.api';
import type { IndexedFile } from '@/types/file.type';
import type { CollaboratorAccess, ShareAccessPerson, SharePermission } from '@/types/share.type';
import { parseCollaboration, serializeCollaboration } from '@/utils/collaboration';
import { ShareAccessList } from '@/ui/components/ShareAccessList';

type FileShareDialogProps = {
  file: IndexedFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveCollaborators: (shareWith: string) => Promise<void>;
  isLoading?: boolean;
};

export function FileShareDialog({
  file,
  open,
  onOpenChange,
  onSaveCollaborators,
  isLoading = false,
}: FileShareDialogProps) {
  const user = useAppSelector(selectUser);
  const [shareFile, { isLoading: isSavingPermission }] = useShareFileMutation();
  const [newCollaborator, setNewCollaborator] = useState('');
  const [collaborators, setCollaborators] = useState<CollaboratorAccess[]>([]);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialogStateRef = useRef({ open: false, fileId: '' });

  const userEmail = user.email?.trim().toLowerCase() || '';
  const isOwner = Boolean(file && file.ownerId === user.id);
  const fileId = file?.id || file?._id || '';

  useEffect(() => {
    if (!open || !file) {
      dialogStateRef.current.open = open;
      return;
    }

    const shouldSync =
      !dialogStateRef.current.open || dialogStateRef.current.fileId !== fileId;

    dialogStateRef.current = { open: true, fileId };

    if (shouldSync) {
      setCollaborators(parseCollaboration(file.collaboration));
      setNewCollaborator('');
      setCopied(false);
      setUpdatingEmail(null);
    }
  }, [file, fileId, open]);

  const downloadUrl = useMemo(() => {
    if (!file) return '';
    return `${API_BASE_URL}/files/${file.id || file._id}/download`;
  }, [file]);

  const peopleWithAccess = useMemo<ShareAccessPerson[]>(() => {
    if (!file) return [];

    const owner: ShareAccessPerson = {
      id: file.ownerId,
      email: isOwner ? userEmail || user.name?.trim() || 'you' : 'Owner',
      displayName: isOwner ? user.name : 'Owner',
      role: 'owner',
    };

    const sharedPeople = collaborators
      .filter((collaborator) => isOwner && collaborator.email === userEmail ? false : true)
      .map<ShareAccessPerson>((collaborator) => ({
        id: collaborator.email,
        email: collaborator.email,
        role: 'collaborator',
        permission: collaborator.permission,
      }));

    return [owner, ...sharedPeople];
  }, [collaborators, file, isOwner, user.name, userEmail]);

  const addCollaboratorToDraft = () => {
    const normalized = newCollaborator.trim().toLowerCase();
    if (!normalized) return;
    if (collaborators.some((collaborator) => collaborator.email === normalized)) {
      setNewCollaborator('');
      return;
    }

    setCollaborators((prev) => [...prev, { email: normalized, permission: 'editor' }]);
    setNewCollaborator('');
  };

  const removeCollaborator = (email: string) => {
    setCollaborators((prev) => prev.filter((collaborator) => collaborator.email !== email));
  };

  const handlePermissionChange = async (email: string, permission: SharePermission) => {
    if (!file || !isOwner) return;

    const previousCollaborators = collaborators;
    const nextCollaborators = collaborators.map((collaborator) =>
      collaborator.email === email ? { ...collaborator, permission } : collaborator,
    );

    setCollaborators(nextCollaborators);
    setUpdatingEmail(email);

    try {
      const updated = await shareFile({
        id: fileId,
        shareWith: serializeCollaboration(nextCollaborators),
      }).unwrap();
      setCollaborators(parseCollaboration(updated.collaboration));
    } catch (error) {
      setCollaborators(previousCollaborators);
      console.error('failed to update file share permission:', error);
    } finally {
      setUpdatingEmail(null);
    }
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

    const nextValue = serializeCollaboration(collaborators);
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
          {isOwner && (
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
          )}

          <div className="space-y-2">
            <p className="text-base font-semibold text-slate-900">People with access</p>
            <ShareAccessList
              people={peopleWithAccess}
              isOwner={isOwner}
              isLoading={isLoading || isSavingPermission}
              updatingEmail={updatingEmail}
              onPermissionChange={handlePermissionChange}
              onRemove={isOwner ? removeCollaborator : undefined}
            />
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
            {isOwner && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                Done
              </button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
