export type Workspace = {
    id: string;
    name: string;
    fileCount: number;
    icon: WorkspaceIcon;
    color: string;
    description?: string;
    collaboration?: string;
    pinned?: boolean;
  };

  export type WorkspaceIcon = 'folder' | 'link' | 'document' | 'code';

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
