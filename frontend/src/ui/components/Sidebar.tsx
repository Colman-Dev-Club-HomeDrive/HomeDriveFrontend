import { NavLink } from 'react-router';
import {
  Cloud,
  Home,
  Triangle,
  Users,
  Link2,
  Star,
  BarChart2,
  Trash2,
  Settings,
} from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import type { User } from '@/types/user.type';

const NAV = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/drive', icon: Triangle, label: 'My Drive' },
  { to: '/workspaces', icon: Users, label: 'Workspaces' },
  { to: '/shared', icon: Link2, label: 'Shared with Me' },
  { to: '/starred', icon: Star, label: 'Starred' },
  { to: '/stats', icon: BarChart2, label: 'Statistics' },
  { to: '/trash', icon: Trash2, label: 'Trash' },
] as const;

type SidebarProps = {
  user?: User;
};

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="flex h-screen w-14 flex-col items-center border-r border-border bg-card transition-all duration-300 hover:w-52">
      {/* Logo */}
      <div className="flex h-14 w-full shrink-0 items-center justify-start px-4">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'var(--color-hero)' }}
        >
          <Cloud className="size-5 text-white" />
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex w-full flex-1 flex-col gap-1 px-2 py-2">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
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
        ))}
      </nav>

      {/* Bottom: settings + avatar */}
      <div className="flex w-full flex-col gap-1 px-2 pb-4">
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

        <div className="flex h-10 w-full items-center gap-3 overflow-hidden rounded-lg px-2.5">
          <div
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--color-hero)' }}
          >
            {(user?.name ?? 'U').charAt(0).toUpperCase()}
          </div>
          <span className="whitespace-nowrap text-sm text-muted-foreground opacity-0 transition-opacity duration-200 [aside:hover_&]:opacity-100">
            {user?.name ?? 'Account'}
          </span>
        </div>
      </div>
    </aside>
  );
}
