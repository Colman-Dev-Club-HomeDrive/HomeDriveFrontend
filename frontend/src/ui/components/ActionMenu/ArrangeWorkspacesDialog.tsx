import { useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shadcn/components/ui/dialog';
import { ICON_MAP } from '@/consts/consts';
import type { Workspace, ArrangeWorkspacesDialogProps } from '@/types/workspace.type';

function DraggableRow({ ws }: { ws: Workspace }) {
  const controls = useDragControls();
  const Icon = ICON_MAP[ws.icon];

  return (
    <Reorder.Item
      value={ws}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 rounded-xl bg-accent/60 px-3 py-2.5 select-none"
    >
      {/* Drag handle */}
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label={`Drag to reorder ${ws.name}`}
        className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Workspace icon */}
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card shadow-sm">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      {/* Name */}
      <span className="flex-1 truncate text-sm font-medium">{ws.name}</span>
    </Reorder.Item>
  );
}

export function ArrangeWorkspacesDialog({
  open,
  onOpenChange,
  workspaces,
  onSave,
}: ArrangeWorkspacesDialogProps) {
  const [list, setList] = useState<Workspace[]>(workspaces);

  function handleOpen(isOpen: boolean) {
    if (isOpen) setList(workspaces);
    onOpenChange(isOpen);
  }

  function handleSave() {
    onSave(list);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arrange Workspaces</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Drag to reorder your workspaces.
          </p>
        </DialogHeader>

        <Reorder.Group
          axis="y"
          values={list}
          onReorder={setList}
          className="flex flex-col gap-2 py-2"
        >
          {list.map((ws) => (
            <DraggableRow key={ws.id} ws={ws} />
          ))}
        </Reorder.Group>

        <DialogFooter className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => handleOpen(false)}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-muted-foreground bg-muted transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center rounded-full px-5 py-2 text-sm font-medium text-primary-foreground bg-primary transition-colors hover:bg-(--color-hero-dark) shadow-sm"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
