import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useChangePasswordMutation } from '@/store/apis/auth.api';
import { selectUser, updateUserName } from '@/store/slices/user.slice';
import type { ChangePasswordPayload } from '@/types/settings.type';
import type { ApiErrorResponse } from '@/types/auth.type';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { ChangePasswordSection } from '@/ui/components/settings/ChangePasswordSection';
import { ProfileNameSection } from '@/ui/components/settings/ProfileNameSection';
import { UserProfileAvatar } from '@/ui/components/settings/UserProfileAvatar';

export function Settings() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [changePassword] = useChangePasswordMutation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  const handleNameSave = async (name: string) => {
    // TODO: replace with profile update API call when backend is ready.
    dispatch(updateUserName(name));
  };

  const handlePasswordSave = async (payload: ChangePasswordPayload) => {
    try {
      await changePassword(payload).unwrap();
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      const data = fetchError.data as ApiErrorResponse | undefined;
      throw new Error(data?.message ?? 'Failed to update password. Please try again.');
    }
  };

  const handleAvatarChange = (file: File) => {
    setAvatarUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
    // TODO: upload avatar file when backend is ready.
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and account security.</p>
      </div>

      <section className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-6">
          <UserProfileAvatar
            displayName={user.name}
            email={user.email}
            imageUrl={avatarUrl}
            size={112}
            showChangePhoto
            onImageChange={handleAvatarChange}
          />
          <ProfileNameSection
            name={user.name || 'Account'}
            email={user.email}
            onSave={handleNameSave}
          />
        </div>
      </section>

      <ChangePasswordSection onSave={handlePasswordSave} />
    </div>
  );
}
