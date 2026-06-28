import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Loader2, Lock, Plus } from 'lucide-react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user.slice';
import { useUpdateWorkspaceMutation } from '@/store/apis/workspaces.api';
import type { Workspace } from '@/types/workspace.type';
import type { CollaboratorAccess, ShareAccessPerson, SharePermission } from '@/types/share.type';
import { parseCollaboration, serializeCollaboration } from '@/utils/collaboration';
import { ShareAccessList } from '@/ui/components/ShareAccessList';

type WorkspaceShareDialogProps = {
  workspace: Workspace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveCollaborators: (shareWith: string) => Promise<void>;
  isLoading?: boolean;
};

export function WorkspaceShareDialog({
  workspace,
  open,
  onOpenChange,
  onSaveCollaborators,
  isLoading = false,
}: WorkspaceShareDialogProps) {
  const user = useAppSelector(selectUser);
  const [updateWorkspace, { isLoading: isSavingPermission }] = useUpdateWorkspaceMutation();
  const [newCollaborator, setNewCollaborator] = useState('');
  const [collaborators, setCollaborators] = useState<CollaboratorAccess[]>([]);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialogStateRef = useRef({ open: false, workspaceId: '' });

  const userEmail = user.email?.trim().toLowerCase() || '';
  const collaboratorEmails = useMemo(
    () => parseCollaboration(workspace?.collaboration).map((entry) => entry.email),
    [workspace?.collaboration],
  );
  const isOwner = Boolean(workspace && !collaboratorEmails.includes(userEmail));
  const workspaceId = workspace?.id || '';

  useEffect(() => {
    if (!open || !workspace) {
      dialogStateRef.current.open = open;
      return;
    }

    const shouldSync =
      !dialogStateRef.current.open || dialogStateRef.current.workspaceId !== workspaceId;

    dialogStateRef.current = { open: true, workspaceId };

    if (shouldSync) {
      setCollaborators(parseCollaboration(workspace.collaboration));
      setNewCollaborator('');
      setCopied(false);
      setUpdatingEmail(null);
    }
  }, [open, workspace, workspaceId]);

  const shareUrl = useMemo(() => {
    if (!workspace || typeof window === 'undefined') return '';
    return `${window.location.origin}/workspaces/${workspace.id}`;
  }, [workspace]);

  const peopleWithAccess = useMemo<ShareAccessPerson[]>(() => {
    if (!workspace) return [];

    const owner: ShareAccessPerson = {
      id: 'owner',
      email: isOwner ? userEmail || user.name?.trim() || 'you' : 'Owner',
      displayName: isOwner ? user.name : 'Owner',
      role: 'owner',
    };

    const sharedPeople = collaborators
      .filter((collaborator) => (isOwner && collaborator.email === userEmail ? false : true))
      .map<ShareAccessPerson>((collaborator) => ({
        id: collaborator.email,
        email: collaborator.email,
        role: 'collaborator',
        permission: collaborator.permission,
      }));

    return [owner, ...sharedPeople];
  }, [collaborators, isOwner, user.name, userEmail, workspace]);

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
    setErrorMessage('');
    setCollaborators((prev) => prev.filter((collaborator) => collaborator.email !== email));
  };

  const getApiErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === 'object' && error !== null && 'data' in error) {
      const data = (error as FetchBaseQueryError).data;
      if (
        typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof (data as { message?: unknown }).message === 'string'
      ) {
        return (data as { message: string }).message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  };

  const handlePermissionChange = async (email: string, permission: SharePermission) => {
    if (!workspace || !isOwner) return;
    setErrorMessage('');

    const previousCollaborators = collaborators;
    const nextCollaborators = collaborators.map((collaborator) =>
      collaborator.email === email ? { ...collaborator, permission } : collaborator,
    );

    setCollaborators(nextCollaborators);
    setUpdatingEmail(email);

    try {
      const updated = await updateWorkspace({
        id: workspace.id,
        values: { collaboration: serializeCollaboration(nextCollaborators) },
      }).unwrap();
      setCollaborators(parseCollaboration(updated.collaboration));
    } catch (error) {
      setCollaborators(previousCollaborators);
      setErrorMessage(getApiErrorMessage(error, 'Failed to update collaborator permission.'));
    } finally {
      setUpdatingEmail(null);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('failed to copy workspace share link:', error);
    } finally {
      setIsCopying(false);
    }
  };

  const handleSave = async () => {
    if (!workspace) return;
    setErrorMessage('');

    const nextValue = serializeCollaboration(collaborators);
    try {
      await onSaveCollaborators(nextValue);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to save collaborators.'));
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
          <DialogTitle>Share &quot;{workspace?.name ?? 'Workspace'}&quot;</DialogTitle>
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
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition-colors focus:border-slate-500"
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
              {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
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

          {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            <p className="text-base font-semibold text-slate-900">General access</p>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Lock className="size-4" />
              Restricted - only invited people can access this workspace.
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between">
          <button
            type="button"
            onClick={handleCopyLink}
            disabled={isCopying || !shareUrl}
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
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-dark-card)' }}
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
