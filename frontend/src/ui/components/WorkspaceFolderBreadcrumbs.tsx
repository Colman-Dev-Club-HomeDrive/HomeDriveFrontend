import { ChevronRight } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';

type Breadcrumb = {
  id: string | null;
  label: string;
};

type WorkspaceFolderBreadcrumbsProps = {
  crumbs: Breadcrumb[];
  onNavigate: (folderId: string | null) => void;
  className?: string;
};

export function WorkspaceFolderBreadcrumbs({
  crumbs,
  onNavigate,
  className,
}: WorkspaceFolderBreadcrumbsProps) {
  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Folder path" className={cn('flex flex-wrap items-center gap-1 text-sm', className)}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <div key={`${crumb.id ?? 'root'}-${index}`} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="size-3.5 text-muted-foreground" />}
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(crumb.id)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
