import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shadcn/components/ui/dialog';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';
import type { EditWorkspaceDialogProps } from '@/types/workspace.type';
import { WORKSPACE_COLORS } from '@/consts/consts';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Max 50 characters'),
  description: z.string().max(200, 'Max 200 characters').optional(),
  collaboration: z.string().optional(),
  color: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function EditWorkspaceDialog({
  workspace,
  open,
  onOpenChange,
  onSubmit,
  onDelete,
}: EditWorkspaceDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', collaboration: '', color: WORKSPACE_COLORS[0] },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        description: workspace.description ?? '',
        collaboration: workspace.collaboration ?? '',
        color: workspace.color ?? WORKSPACE_COLORS[0],
      });
    }
  }, [workspace, reset]);

  function handleClose(isOpen: boolean) {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  }

  function handleFormSubmit(values: FormValues) {
    if (!workspace) return;
    onSubmit(workspace.id, values);
    reset();
    onOpenChange(false);
  }

  function handleDelete() {
    if (!workspace) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`
    );
    if (confirmed) {
      onDelete(workspace.id);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
        </DialogHeader>

        <form
          id="edit-workspace-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-5 py-2"
        >
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-ws-name">Name</Label>
            <Input
              id="edit-ws-name"
              placeholder="e.g. Team Projects"
              className="bg-white dark:bg-white/5"
              {...register('name')}
            />
            {errors.name ? (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            ) : null}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-ws-description">
              Description{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="edit-ws-description"
              placeholder="What is this workspace for?"
              className="bg-white dark:bg-white/5"
              {...register('description')}
            />
            {errors.description ? (
              <p className="text-destructive text-xs">{errors.description.message}</p>
            ) : null}
          </div>

          {/* Collaboration */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-ws-collab">
              Collaboration{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="edit-ws-collab"
              placeholder="Names or emails, comma-separated"
              className="bg-white dark:bg-white/5"
              {...register('collaboration')}
            />
          </div>

          {/* Dot color */}
          <div className="flex flex-col gap-2">
            <Label>Dot color</Label>
            <div className="flex flex-wrap gap-2">
              {WORKSPACE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  aria-label={`Select color ${color}`}
                  className="size-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{ backgroundColor: color, boxShadow: selectedColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined }}
                />
              ))}
            </div>
          </div>
        </form>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground bg-muted transition-colors duration-150 hover:bg-destructive/15 hover:text-destructive sm:mr-auto"
          >
            <Trash2 className="size-4" />
            Delete workspace
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-muted-foreground bg-muted transition-colors duration-150 hover:bg-muted/70 hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-workspace-form"
              className="inline-flex items-center rounded-full px-5 py-2 text-sm font-medium text-primary-foreground bg-primary transition-colors duration-150 hover:bg-(--color-hero-dark) shadow-sm"
            >
              Save
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
