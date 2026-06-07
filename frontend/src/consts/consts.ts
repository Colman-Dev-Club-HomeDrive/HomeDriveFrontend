import type { Workspace, WorkspaceIcon } from '@/types/workspace.type';
import { Home, Triangle, Users, Link2, Star, BarChart2, Trash2 , FilePlus2, FolderPlus, Upload,  Image, Video, Music,Folder, FileText, Code2} from 'lucide-react';

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

export const ACTIONS = [
  { label: 'New Document', icon: FilePlus2, shortcut: '⌘D' },
  { label: 'New Folder', icon: FolderPlus, shortcut: '⌘F' },
  { label: 'Upload Files', icon: Upload, shortcut: '⌘U' },
] as const;

export const MEDIA_TYPES = [
  { label: 'Documents', icon: FileText, count: 124 },
  { label: 'Photos', icon: Image, count: 856 },
  { label: 'Videos', icon: Video, count: 34 },
  { label: 'Audio', icon: Music, count: 12 },
] as const;

export const WORKSPACES: Workspace[] = [
  { id: '1', name: 'Personal Projects', fileCount: 48, icon: 'folder', online: true },
  { id: '2', name: 'Family Drive', fileCount: 123, icon: 'link', online: true },
  { id: '3', name: 'Work & Studies', fileCount: 76, icon: 'document', online: false },
  { id: '4', name: 'Coding', fileCount: 210, icon: 'code', online: true },
];

export const ICON_MAP: Record<WorkspaceIcon, React.ElementType> = {
  folder: Folder,
  link: Link2,
  document: FileText,
  code: Code2,
};


