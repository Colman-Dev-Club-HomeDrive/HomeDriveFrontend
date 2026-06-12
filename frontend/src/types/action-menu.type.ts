import type { ElementType } from 'react';

export type ActionMenuItem = {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: ElementType;
  disabled?: boolean;
  destructive?: boolean;
};

export type ActionMenuButtonProps = {
  items: ActionMenuItem[];
  ariaLabel?: string;
  align?: 'start' | 'center' | 'end';
  className?: string;
};

export type WorkspaceMenuOptions = {
  onAdd: () => void;
  onArrange: () => void;
};
