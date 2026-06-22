// Workspace and WorkspaceIcon are the single source of truth — defined in the shared package
import type { Workspace, WorkspaceIcon } from '@homedrive/types';
export type { Workspace, WorkspaceIcon };

export type CreateWorkspaceFormValues = {
  name: string;
  icon: WorkspaceIcon;
  color: string;
  shareWith?: string;
};

export type EditWorkspaceFormValues = {
  name: string;
  description?: string;
  collaboration?: string;
  color: string;
};

export type CreateWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateWorkspaceFormValues) => void;
};

export type EditWorkspaceDialogProps = {
  workspace: Workspace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, values: EditWorkspaceFormValues) => void;
  onDelete: (id: string) => void;
};

export type ArrangeWorkspacesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaces: Workspace[];
  onSave: (workspaces: Workspace[]) => void;
};
