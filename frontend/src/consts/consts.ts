import { Home, Triangle, Users, Link2, Star, BarChart2, Trash2 } from 'lucide-react';

export const VITE_API_URL = import.meta.env.VITE_API_URL as string;
export const POKE_API_URL = `https://pokeapi.co/api/v2`;

export const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/drive', icon: Triangle, label: 'My Drive' },
  { to: '/workspaces', icon: Users, label: 'Workspaces' },
  { to: '/shared', icon: Link2, label: 'Shared with Me' },
  { to: '/starred', icon: Star, label: 'Starred' },
  { to: '/stats', icon: BarChart2, label: 'Statistics' },
  { to: '/trash', icon: Trash2, label: 'Trash' },
] as const;
