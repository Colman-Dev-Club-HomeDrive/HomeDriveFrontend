import { Bell } from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';
import { cn } from '@/shadcn/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { selectNotificationCount } from '@/store/slices/user.slice';

export function NotificationsButton() {
  const notificationCount = useAppSelector(selectNotificationCount);

  return (
    <Button variant="ghost" size="icon" className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" aria-label="Notifications">
      <Bell className="size-5.5" />
      {notificationCount > 0 && (
        <span
          className={cn(
            'absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground',
          )}
        >
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </Button>
  );
}
