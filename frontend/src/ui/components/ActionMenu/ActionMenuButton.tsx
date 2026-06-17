import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import type { ActionMenuItem } from '@/types/action-menu.type';
import { ACTION_MENU_DEFAULTS } from '@/consts/consts';

export type { ActionMenuItem };

export type ActionMenuButtonProps = {
  items: ActionMenuItem[];
  ariaLabel?: string;
  align?: 'start' | 'center' | 'end';
  className?: string;
};

export function ActionMenuButton({
  items,
  ariaLabel = ACTION_MENU_DEFAULTS.ariaLabel,
  align = ACTION_MENU_DEFAULTS.align,
  className,
}: ActionMenuButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={className}
          aria-label={ariaLabel}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align}>
        {items.map(({ id, label, onSelect, icon: Icon, disabled, destructive }) => (
          <DropdownMenuItem
            key={id}
            disabled={disabled}
            variant={destructive ? 'destructive' : 'default'}
            onSelect={(event) => {
              event.preventDefault();
              onSelect();
            }}
          >
            {Icon ? <Icon className="size-4" /> : null}
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
