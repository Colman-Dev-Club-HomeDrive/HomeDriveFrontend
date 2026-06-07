export type Workspace = {
    id: string;
    name: string;
    fileCount: number;
    icon: WorkspaceIcon;
    online: boolean;
  };

  export type WorkspaceIcon = 'folder' | 'link' | 'document' | 'code';
