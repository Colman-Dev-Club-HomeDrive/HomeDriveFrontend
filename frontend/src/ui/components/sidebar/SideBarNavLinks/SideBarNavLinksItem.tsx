import { NavLink } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';

type SideBarNavLinksItemProps = {
  to: string;
  icon: LucideIcon;
  label: string;
};

export function SideBarNavLinksItem({ to, icon: Icon, label }: SideBarNavLinksItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex h-10 w-full items-center gap-3 overflow-hidden rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent font-medium text-accent-foreground',
        )
      }
    >
      <Icon className="size-4.5 shrink-0" />
      <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 [aside:hover_&]:opacity-100">
        {label}
      </span>
    </NavLink>
  );
}
