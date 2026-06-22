import type { Workspace, WorkspaceIcon } from '@/types/workspace.type';
import { Home, Triangle, Users, Link2, Star, BarChart2, Trash2, FolderPlus, Upload, Image, Video, Music, Folder, FileText, Code2 } from 'lucide-react';

export const VITE_API_URL = import.meta.env.VITE_API_URL as string;
export const POKE_API_URL = `https://pokeapi.co/api/v2`;

export const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/mydrive', icon: Triangle, label: 'My Drive' },
  { to: '/workspaces', icon: Users, label: 'Workspaces' },
  { to: '/shared', icon: Link2, label: 'Shared with Me' },
  { to: '/starred', icon: Star, label: 'Starred' },
  { to: '/stats', icon: BarChart2, label: 'Statistics' },
  { to: '/trash', icon: Trash2, label: 'Trash' },
] as const;

export const ACTIONS = [
  { label: 'New Folder', icon: FolderPlus, shortcut: '⌘F' },
  { label: 'Upload Files', icon: Upload, shortcut: '⌘U' },
] as const;

export const MEDIA_TYPES = [
  { label: 'Documents', icon: FileText, count: 124 },
  { label: 'Photos', icon: Image, count: 856 },
  { label: 'Videos', icon: Video, count: 34 },
  { label: 'Audio', icon: Music, count: 12 },
] as const;

export const WORKSPACE_COLORS = [
  // Row 1
  '#e11d48', // crimson
  '#f43f5e', // rose
  '#fb7185', // light rose
  '#dc2626', // red
  '#ea580c', // red-orange
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  // Row 2
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#78716c', // stone
  '#6b7280', // gray
  '#94a3b8', // slate
];

export const WORKSPACES: Workspace[] = [
  { id: '1', name: 'Personal Projects', fileCount: 48, icon: 'folder', color: '#60a5fa', pinned: true },
  { id: '2', name: 'Family Drive', fileCount: 123, icon: 'link', color: '#34d399', pinned: false },
  { id: '3', name: 'Work & Studies', fileCount: 76, icon: 'document', color: '#94a3b8', pinned: false },
  { id: '4', name: 'Coding', fileCount: 210, icon: 'code', color: '#a78bfa', pinned: false },
];

export const ICON_MAP: Record<WorkspaceIcon, React.ElementType> = {
  folder: Folder,
  link: Link2,
  document: FileText,
  code: Code2,
};


export const WORKSPACE_TYPES: { value: WorkspaceIcon; label: string; icon: React.ElementType }[] = [
  { value: 'folder', label: 'Folder', icon: Folder },
  { value: 'link', label: 'Link', icon: Link2 },
  { value: 'document', label: 'Document', icon: FileText },
  { value: 'code', label: 'Code', icon: Code2 },
];

export const ACTION_MENU_DEFAULTS = {
  ariaLabel: 'Open actions menu',
  align: 'end' as const,
};
