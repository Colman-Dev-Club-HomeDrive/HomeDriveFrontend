import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shadcn/components/ui/dialog';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn/components/ui/select';
import type { WorkspaceIcon, CreateWorkspaceDialogProps } from '@/types/workspace.type';
import { WORKSPACE_TYPES, WORKSPACE_COLORS } from '@/consts/consts';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Max 50 characters'),
  icon: z.enum(['folder', 'link', 'document', 'code'] as const),
  color: z.string(),
  shareWith: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateWorkspaceDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', icon: 'folder', color: WORKSPACE_COLORS[0], shareWith: '' },
  });

  const selectedColor = watch('color');

  function handleClose(isOpen: boolean) {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  }

  function handleFormSubmit(values: FormValues) {
    onSubmit(values);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Workspace</DialogTitle>
        </DialogHeader>

        <form
          id="create-workspace-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-5 py-2"
        >
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ws-name">Name</Label>
            <Input
              id="ws-name"
              placeholder="e.g. Team Projects"
              {...register('name')}
            />
            {errors.name ? (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            ) : null}
          </div>

          {/* Type */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ws-type">Type</Label>
            <Select
              defaultValue="folder"
              onValueChange={(val) => setValue('icon', val as WorkspaceIcon)}
            >
              <SelectTrigger id="ws-type">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {WORKSPACE_TYPES.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <Icon className="size-4" />
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color dot */}
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

          {/* Share with */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ws-share">
              Share with
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="ws-share"
              placeholder="Names or emails, comma-separated"
              {...register('shareWith')}
            />
          </div>
        </form>

        <DialogFooter className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-muted-foreground bg-muted transition-colors duration-150 hover:bg-muted/70 hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-workspace-form"
            className="inline-flex items-center rounded-full px-5 py-2 text-sm font-medium text-primary-foreground bg-primary transition-colors duration-150 hover:bg-(--color-hero-dark) shadow-sm"
          >
            Create
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
