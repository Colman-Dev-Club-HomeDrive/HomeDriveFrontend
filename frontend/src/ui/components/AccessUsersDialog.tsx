import { useMemo, useState } from 'react';
import { Loader2, Lock, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn/components/ui/select';
import type { AccessUser, AccessUserRole } from '@/store/apis/access.api';

type AccessUsersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: AccessUser[];
  currentUserEmail: string;
  canManage: boolean;
  isLoading?: boolean;
  onAddUser: (email: string) => Promise<void>;
  onChangeRole: (email: string, role: AccessUserRole) => Promise<void>;
  onRemoveUser: (email: string) => Promise<void>;
};

function getInitials(email: string): string {
  const localPart = email.split('@')[0] ?? '';
  const parts = localPart.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function AccessUsersDialog({
  open,
  onOpenChange,
  users,
  currentUserEmail,
  canManage,
  isLoading = false,
  onAddUser,
  onChangeRole,
  onRemoveUser,
}: AccessUsersDialogProps) {
  const [newEmail, setNewEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);

  const sortedUsers = useMemo(() => {
    return [...users].sort((left, right) => {
      if (left.email === currentUserEmail) return -1;
      if (right.email === currentUserEmail) return 1;
      return left.email.localeCompare(right.email);
    });
  }, [currentUserEmail, users]);

  const canSubmit = canManage && newEmail.trim().length > 0 && !isLoading;

  const submitAddUser = async () => {
    setErrorMessage('');
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      await onAddUser(email);
      setNewEmail('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not add user right now.');
    }
  };

  const changeRole = async (email: string, role: AccessUserRole) => {
    setErrorMessage('');
    setUpdatingEmail(email);

    try {
      await onChangeRole(email, role);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update role right now.');
    } finally {
      setUpdatingEmail(null);
    }
  };

  const removeUser = async (email: string) => {
    setErrorMessage('');
    setUpdatingEmail(email);

    try {
      await onRemoveUser(email);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not remove user right now.');
    } finally {
      setUpdatingEmail(null);
    }
  };

  const onInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (!canSubmit) return;
    await submitAddUser();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Access</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Add people, groups, or emails</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="name@example.com"
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition-colors focus:border-slate-500"
                disabled={!canManage || isLoading}
              />
              <button
                type="button"
                onClick={submitAddUser}
                className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
                disabled={!canSubmit}
              >
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Add
              </button>
            </div>
            {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
          </div>

          <div className="space-y-2">
            <p className="text-base font-semibold text-slate-900">People with access</p>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              {sortedUsers.map((entry, index) => {
                const isCurrentUser = entry.email === currentUserEmail;
                return (
                  <div
                    key={entry.email}
                    className={`flex items-center gap-3 px-3 py-3 ${index < sortedUsers.length - 1 ? 'border-b border-slate-200' : ''}`}
                  >
                    <div
                      aria-hidden="true"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold leading-none text-white ${
                        isCurrentUser ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    >
                      <span className="select-none">{getInitials(entry.email)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-800">{entry.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrentUser ? (
                        <span className="text-sm text-slate-500">{entry.role === 'manager' ? 'Owner' : 'Connected'}</span>
                      ) : canManage ? (
                        <>
                          <Select
                            value={entry.role}
                            onValueChange={(value) => {
                              void changeRole(entry.email, value as AccessUserRole);
                            }}
                            disabled={isLoading || updatingEmail === entry.email}
                          >
                            <SelectTrigger size="sm" className="h-8 w-34.5">
                              {updatingEmail === entry.email ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manager">Owner</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <button
                            type="button"
                            onClick={() => {
                              void removeUser(entry.email);
                            }}
                            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Remove ${entry.email}`}
                            disabled={isLoading || updatingEmail === entry.email}
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-slate-500">
                          {entry.role === 'manager'
                            ? 'Owner'
                            : entry.role === 'editor'
                              ? 'Editor'
                              : 'Viewer'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            <p className="text-base font-semibold text-slate-900">General access</p>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Lock className="size-4" />
              Restricted - only invited people can access this view.
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--color-dark-card)' }}
          >
            Done
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
