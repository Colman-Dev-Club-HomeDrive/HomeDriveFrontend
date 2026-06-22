import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import type { IndexedFile } from '@/types/file.type';

type RenameFileDialogProps = {
  file: IndexedFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newName: string) => Promise<void>;
  isLoading?: boolean;
};

export function RenameFileDialog({ file, open, onOpenChange, onConfirm, isLoading }: RenameFileDialogProps) {
  const [nextName, setNextName] = useState('');

  const handleOpen = (newOpen: boolean) => {
    if (newOpen && file) {
      setNextName(file.name);
    }
    onOpenChange(newOpen);
  };

  const handleConfirm = async () => {
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === file?.name) {
      handleOpen(false);
      return;
    }

    try {
      await onConfirm(trimmed);
      handleOpen(false);
    } catch (error) {
      console.error('rename failed:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename Item</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rename-input" className="text-sm font-medium">
              New name
            </label>
            <input
              id="rename-input"
              type="text"
              value={nextName}
              onChange={(e) => setNextName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter new name"
              autoFocus
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => handleOpen(false)}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            Confirm
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
