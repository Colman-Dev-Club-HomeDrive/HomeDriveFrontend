import { useState } from 'react';
import type { ChangePasswordPayload } from '@/types/settings.type';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';
import { Button } from '@/shadcn/components/ui/button';

type ChangePasswordSectionProps = {
  onSave: (payload: ChangePasswordPayload) => Promise<void> | void;
};

const EMPTY_FORM: ChangePasswordPayload = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

export function ChangePasswordSection({ onSave }: ChangePasswordSectionProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!form.currentPassword || !form.newPassword || !form.confirmNewPassword) {
      setErrorMessage('All password fields are required.');
      return;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    if (form.newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmNewPassword,
      });
      setForm(EMPTY_FORM);
      setSuccessMessage('Password updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update password. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your password to keep your account secure.
        </p>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(event) => updateField('currentPassword', event.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(event) => updateField('newPassword', event.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={form.confirmNewPassword}
            onChange={(event) => updateField('confirmNewPassword', event.target.value)}
            disabled={isSaving}
          />
        </div>

        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p>
        ) : null}

        <div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </section>
  );
}
