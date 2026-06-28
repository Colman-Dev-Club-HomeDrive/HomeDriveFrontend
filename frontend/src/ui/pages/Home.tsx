import { useMemo, useState } from 'react';
import { StorageCard } from '@/ui/components/StorageCard';
import { MediaTypesCard } from '@/ui/components/MediaTypesCard';
import { CreateNewCard } from '@/ui/components/CreateNewCard';
import { WorkspacesSection } from '@/ui/components/ActionMenu/WorkspacesSection';
import { useAppSelector } from '@/store/hooks';
import { useGetStorageStatsQuery, useListFilesQuery } from '@/store/apis/files.api';
import { selectUser } from '@/store/slices/user.slice';
import { getGreeting } from '@/utils/getGreeting';
import { useFileUpload } from '@/hooks/useFileUpload';
import { detectDropSource } from '@/utils/detectDropSource';
import { RecentFilesSection } from '@/ui/components/RecentFilesSection';
import { useNavigate } from 'react-router-dom';
import { TEMP_ALLOWED_EMAILS } from '@/consts/consts';
import { Plus } from 'lucide-react';
import {
  useAddAccessUserMutation,
  useListAccessUsersQuery,
  useRemoveAccessUserMutation,
  useUpdateAccessUserRoleMutation,
  type AccessUser,
  type AccessUserRole,
} from '@/store/apis/access.api';
import { AccessUsersDialog } from '@/ui/components/AccessUsersDialog';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const DEFAULT_ACCESS_USERS: AccessUser[] = TEMP_ALLOWED_EMAILS.map((email) => ({ email, role: 'manager' }));

function getAccessLabel(email: string): string {
  const localPart = email.split('@')[0] ?? email;
  if (!localPart) return email;
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

function getAvatarInitials(email: string): string {
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


export function Home() {
  const navigate = useNavigate();
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const { handleDragEnter, handleDragLeave, handleDrop } = useFileUpload();
  const { data: sharedAccessUsers = DEFAULT_ACCESS_USERS } = useListAccessUsersQuery();
  const [addAccessUser, { isLoading: isAddingAccessUser }] = useAddAccessUserMutation();
  const [removeAccessUser, { isLoading: isRemovingAccessUser }] = useRemoveAccessUserMutation();
  const [updateAccessUserRole, { isLoading: isUpdatingAccessRole }] = useUpdateAccessUserRoleMutation();
  const { data: filesData, isLoading: isFilesLoading } = useListFilesQuery(undefined);
  const {
    data: storageStats,
    isLoading: isStorageLoading,
    isError: isStorageError,
  } = useGetStorageStatsQuery();
  const { name: storeName, email: userEmail } = useAppSelector(selectUser);
  const userName = storeName;
  const normalizedUserEmail = (userEmail ?? '').trim().toLowerCase();
  const currentUserAccess = sharedAccessUsers.find((entry) => entry.email === normalizedUserEmail);
  const canSeeSharedInfo = Boolean(currentUserAccess);
  const canUploadFiles = currentUserAccess?.role === 'manager' || currentUserAccess?.role === 'editor';
  const canManageAccess = currentUserAccess?.role === 'manager';

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

  const allowedUsersForView = useMemo(() => {
    return [...sharedAccessUsers].sort((left, right) => {
      const leftIsCurrent = left.email === normalizedUserEmail;
      const rightIsCurrent = right.email === normalizedUserEmail;
      if (leftIsCurrent === rightIsCurrent) return 0;
      return leftIsCurrent ? 1 : -1;
    });
  }, [normalizedUserEmail, sharedAccessUsers]);

  const handleAddAccessUser = async (email: string) => {
    try {
      await addAccessUser(email).unwrap();
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not add this user right now.'));
    }
  };

  const handleChangeAccessRole = async (email: string, role: AccessUserRole) => {
    try {
      await updateAccessUserRole({ email, role }).unwrap();
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update role right now.'));
    }
  };

  const handleRemoveAccessUser = async (email: string) => {
    try {
      await removeAccessUser(email).unwrap();
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not remove user right now.'));
    }
  };

  const metadataUsedBytes = useMemo(
    () =>
      (filesData ?? []).reduce((sum, file) => {
        if (file.isDirectory) {
          return sum;
        }

        return sum + file.size;
      }, 0),
    [filesData],
  );

  const capacityBytes = storageStats?.capacityBytes ?? 0;
  const isStorageCardLoading = isStorageLoading || isFilesLoading;

  return (
    <div
      className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 bg-background px-4 py-8 sm:px-6"
      onDragEnter={(e) => {
        e.preventDefault();
        if (!canUploadFiles) return;
        handleDragEnter();
      }}
      onDragLeave={() => {
        if (!canUploadFiles) return;
        handleDragLeave();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (!canUploadFiles) return;
        const source = detectDropSource(e.dataTransfer.items);
        handleDrop(e.dataTransfer.files, source);
      }}
    >
      {/* Greeting */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}
            {userName ? `, ${userName}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground">Explore your files and workspaces</p>
        </div>
        <div className="flex items-center gap-3 sm:pt-1">
          <button
            type="button"
            onClick={() => setIsAccessDialogOpen(true)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-slate-50 hover:text-slate-700"
            title={canManageAccess ? 'Manage user access' : 'View access list'}
          >
            <Plus className="size-3" />
            Access
          </button>
          <div className="flex items-center">
            {allowedUsersForView.map((entry, index) => {
              const isCurrent = entry.email === normalizedUserEmail;
              return (
                <div
                  key={entry.email}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold shadow-sm ${
                    isCurrent
                      ? 'border-emerald-200 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-300'
                      : 'border-slate-200 bg-slate-100 text-slate-700'
                  }`}
                  style={{
                    marginLeft: index === 0 ? 0 : -10,
                    zIndex: isCurrent ? 20 : 10 + index,
                  }}
                  title={isCurrent ? `${getAccessLabel(entry.email)} (connected)` : getAccessLabel(entry.email)}
                >
                  {getAvatarInitials(entry.email)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!canSeeSharedInfo && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Access to shared files and workspaces is temporarily limited for this account.
        </div>
      )}

      <AccessUsersDialog
        open={isAccessDialogOpen}
        onOpenChange={setIsAccessDialogOpen}
        users={allowedUsersForView}
        currentUserEmail={normalizedUserEmail}
        canManage={canManageAccess}
        isLoading={isAddingAccessUser || isUpdatingAccessRole || isRemovingAccessUser}
        onAddUser={handleAddAccessUser}
        onChangeRole={handleChangeAccessRole}
        onRemoveUser={handleRemoveAccessUser}
      />

      {/* Top row: left column (Storage + Media) | right column (Create New) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.6fr]">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <StorageCard
            usedBytes={metadataUsedBytes}
            totalBytes={capacityBytes}
            isLoading={isStorageCardLoading}
            hasError={isStorageError}
            onClick={() => navigate('/stats')}
          />
          <MediaTypesCard />
        </div>
        <CreateNewCard canUpload={canUploadFiles} />
      </div>
      {canSeeSharedInfo && <WorkspacesSection canWrite={canUploadFiles} />}
      <RecentFilesSection />
    </div>
  );
}
