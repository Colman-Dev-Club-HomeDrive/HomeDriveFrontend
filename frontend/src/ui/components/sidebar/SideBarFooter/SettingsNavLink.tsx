import { NavLink } from 'react-router';
import { Settings } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';

export function SettingsNavLink() {
  return (
    <NavLink
      to="/settings"
      className={({ isActive }) =>
        cn(
          'flex h-10 w-full items-center gap-3 overflow-hidden rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent font-medium text-accent-foreground',
        )
      }
    >
      <Settings className="size-4.5 shrink-0" />
      <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 [aside:hover_&]:opacity-100">
        Settings
      </span>
    </NavLink>
  );
}
