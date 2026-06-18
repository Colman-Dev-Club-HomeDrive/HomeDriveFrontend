import type { ElementType } from 'react';

export type ActionMenuItem = {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: ElementType;
  disabled?: boolean;
  destructive?: boolean;
};

export type WorkspaceMenuOptions = {
  onAdd: () => void;
  onArrange: () => void;
};
