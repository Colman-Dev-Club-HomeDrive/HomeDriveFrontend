import { useState } from 'react';
import { useNavigate } from 'react-router';
import { WORKSPACES } from '@/consts/consts';
import { useWorkspaceMenuItems } from '@/ui/components/ActionMenu/MenuItems';
import type { Workspace } from '@/types/workspace.type';

export function useWorkspacesSection() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(WORKSPACES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [arrangeOpen, setArrangeOpen] = useState(false);
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null);
  const navigate = useNavigate();

  const menuItems = useWorkspaceMenuItems({
    onAdd: () => setDialogOpen(true),
    onArrange: () => setArrangeOpen(true),
  });

  function addWorkspace(values: { name: string; icon: Workspace['icon']; color: string }) {
    setWorkspaces((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: values.name,
        fileCount: 0,
        icon: values.icon,
        color: values.color,
        pinned: false,
      },
    ]);
  }

  function updateWorkspace(id: string, values: Partial<Workspace>) {
    setWorkspaces((prev) => prev.map((ws) => (ws.id === id ? { ...ws, ...values } : ws)));
  }

  function deleteWorkspace(id: string) {
    setWorkspaces((prev) => prev.filter((ws) => ws.id !== id));
  }

  function togglePin(id: string) {
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === id ? { ...ws, pinned: !ws.pinned } : ws))
    );
  }

  return {
    workspaces,
    setWorkspaces,
    dialogOpen,
    setDialogOpen,
    arrangeOpen,
    setArrangeOpen,
    editWorkspace,
    setEditWorkspace,
    menuItems,
    navigate,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    togglePin,
  };
}
