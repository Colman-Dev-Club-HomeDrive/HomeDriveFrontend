import { Folder, Link2, FileText, Code2 } from 'lucide-react';

type WorkspaceIcon = 'folder' | 'link' | 'document' | 'code';

type Workspace = {
  id: string;
  name: string;
  fileCount: number;
  icon: WorkspaceIcon;
  online: boolean;
};

const ICON_MAP: Record<WorkspaceIcon, React.ElementType> = {
  folder: Folder,
  link: Link2,
  document: FileText,
  code: Code2,
};

const WORKSPACES: Workspace[] = [
  { id: '1', name: 'Personal Projects', fileCount: 48, icon: 'folder', online: true },
  { id: '2', name: 'Family Drive', fileCount: 123, icon: 'link', online: true },
  { id: '3', name: 'Work & Studies', fileCount: 76, icon: 'document', online: false },
  { id: '4', name: 'Coding', fileCount: 210, icon: 'code', online: true },
];

export function WorkspacesSection() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">My Workspaces</h2>
        <button className="text-sm text-muted-foreground hover:text-foreground">View all</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {WORKSPACES.map(({ id, name, fileCount, icon, online }) => {
          const Icon = ICON_MAP[icon];
          return (
            <button
              key={id}
              className="group flex flex-col gap-3 rounded-2xl bg-card p-4 text-left shadow-sm transition-all hover:bg-accent hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-xl bg-accent shadow-sm">
                  <Icon className="size-4 text-slate-500 dark:text-slate-400" />
                </div>
                <span
                  className={`mt-1 size-2 rounded-full ${online ? 'bg-blue-400' : 'bg-slate-300 dark:bg-slate-600'}`}
                />
              </div>
              <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{fileCount} files</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
