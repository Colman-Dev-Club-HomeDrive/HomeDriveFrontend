import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';
import { Button } from '@/shadcn/components/ui/button';

type ProfileNameSectionProps = {
  name: string;
  email: string;
  onSave: (name: string) => Promise<void> | void;
};

export function ProfileNameSection({ name, email, onSave }: ProfileNameSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraftName(name);
    }
  }, [name, isEditing]);

  const handleCancel = () => {
    setDraftName(name);
    setErrorMessage('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmed = draftName.trim();
    setErrorMessage('');
    setSuccessMessage('');

    if (!trimmed) {
      setErrorMessage('Name cannot be empty.');
      return;
    }

    if (trimmed === name) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmed);
      setSuccessMessage('Name updated.');
      setIsEditing(false);
    } catch {
      setErrorMessage('Failed to update name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 text-center">
      {isEditing ? (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <div className="flex flex-col gap-1.5 text-left">
            <Label htmlFor="profile-name">Display name</Label>
            <Input
              id="profile-name"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Enter your name"
              autoFocus
              disabled={isSaving}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void handleSave();
                } else if (event.key === 'Escape') {
                  handleCancel();
                }
              }}
            />
          </div>
          <div className="flex justify-center gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-2xl font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1"
            onClick={() => {
              setSuccessMessage('');
              setErrorMessage('');
              setIsEditing(true);
            }}
          >
            <Pencil className="size-3.5" />
            Edit name
          </Button>
        </div>
      )}

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p>
      ) : null}
    </div>
  );
}
