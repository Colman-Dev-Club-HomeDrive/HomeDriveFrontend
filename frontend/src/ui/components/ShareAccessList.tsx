import { Loader2, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn/components/ui/select';
import {
  SHARE_PERMISSION_LABELS,
  SHARE_ROLE_LABELS,
  type ShareAccessPerson,
  type SharePermission,
} from '@/types/share.type';
import { UserInitialsAvatar } from '@/ui/components/UserInitialsAvatar';

type ShareAccessListProps = {
  people: ShareAccessPerson[];
  isOwner: boolean;
  isLoading?: boolean;
  updatingEmail?: string | null;
  onPermissionChange?: (email: string, permission: SharePermission) => void;
  onRemove?: (email: string) => void;
};

export function ShareAccessList({
  people,
  isOwner,
  isLoading = false,
  updatingEmail = null,
  onPermissionChange,
  onRemove,
}: ShareAccessListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      {people.map((person, index) => {
        const isUpdating = updatingEmail === person.email;
        const permission = person.permission ?? 'editor';

        return (
          <div
            key={person.id}
            className={`flex items-center gap-3 px-3 py-3 ${
              index < people.length - 1 ? 'border-b border-slate-200' : ''
            }`}
          >
            <UserInitialsAvatar
              displayName={person.displayName}
              email={person.email}
              seed={person.id}
              size={38}
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-800">{person.email}</p>
            </div>

            <div className="flex items-center gap-2">
              {person.role === 'owner' ? (
                <span className="text-sm text-slate-500">{SHARE_ROLE_LABELS.owner}</span>
              ) : isOwner ? (
                <>
                  <Select
                    value={permission}
                    onValueChange={(value) => {
                      if (value === 'owner') return;
                      onPermissionChange?.(person.email, value as SharePermission);
                    }}
                    disabled={isLoading || isUpdating}
                  >
                    <SelectTrigger size="sm" className="h-8 w-[118px]">
                      {isUpdating ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <SelectValue>{SHARE_PERMISSION_LABELS[permission]}</SelectValue>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner" disabled>
                        {SHARE_ROLE_LABELS.owner}
                      </SelectItem>
                      <SelectItem value="editor">{SHARE_ROLE_LABELS.editor}</SelectItem>
                      <SelectItem value="readonly">{SHARE_ROLE_LABELS.readonly}</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => onRemove?.(person.email)}
                    className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Remove ${person.email}`}
                    disabled={isLoading || isUpdating}
                  >
                    <X className="size-4" />
                  </button>
                </>
              ) : (
                <span className="text-sm text-slate-500">{SHARE_PERMISSION_LABELS[permission]}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
