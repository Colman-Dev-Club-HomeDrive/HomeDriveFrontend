import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useWorkspaceMenuItems } from '@/ui/components/ActionMenu/MenuItems';
import {
  useListWorkspacesQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useReorderWorkspacesMutation,
} from '@/store/apis/workspaces.api';
import type { CreateWorkspaceFormValues, EditWorkspaceFormValues, Workspace } from '@/types/workspace.type';

export function useWorkspacesSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [arrangeOpen, setArrangeOpen] = useState(false);
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null);
  const navigate = useNavigate();

  const { data: workspaces = [], isLoading, isError } = useListWorkspacesQuery();
  const [createWorkspace] = useCreateWorkspaceMutation();
  const [updateWorkspaceMutation] = useUpdateWorkspaceMutation();
  const [deleteWorkspaceMutation] = useDeleteWorkspaceMutation();
  const [reorderWorkspacesMutation] = useReorderWorkspacesMutation();

  const menuItems = useWorkspaceMenuItems({
    onAdd: () => setDialogOpen(true),
    onArrange: () => setArrangeOpen(true),
  });

  function addWorkspace(values: CreateWorkspaceFormValues) {
    createWorkspace(values);
  }

  function updateWorkspace(id: string, values: Partial<EditWorkspaceFormValues>) {
    updateWorkspaceMutation({ id, values });
  }

  function deleteWorkspace(id: string) {
    deleteWorkspaceMutation(id);
  }

  function togglePin(id: string) {
    const ws = workspaces.find((w) => w.id === id);
    if (!ws) return;
    const pinning = !ws.pinned;
    updateWorkspaceMutation({
      id,
      values: {
        pinned: pinning,
        pinnedAt: pinning ? new Date().toISOString() : undefined,
      },
    });
  }

  function reorderWorkspaces(updated: Workspace[]) {
    reorderWorkspacesMutation(updated.map((ws) => ws.id));
  }

  return {
    workspaces,
    isLoading,
    isError,
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
    reorderWorkspaces,
  };
}
