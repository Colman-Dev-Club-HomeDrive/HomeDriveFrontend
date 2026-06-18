import { List, Plus, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { ActionMenuItem, WorkspaceMenuOptions } from '@/types/action-menu.type';

export function useWorkspaceMenuItems({ onAdd, onArrange }: WorkspaceMenuOptions): ActionMenuItem[] {
  const navigate = useNavigate();

  return [
    {
      id: 'add',
      label: 'Add',
      icon: Plus,
      onSelect: onAdd,
    },
    {
      id: 'edit',
      label: 'Arrange',
      icon: SquarePen,
      onSelect: onArrange,
    },
    {
      id: 'view-all',
      label: 'View all',
      icon: List,
      onSelect: () => {
        void navigate('/workspaces');
      },
    },
  ];
}
