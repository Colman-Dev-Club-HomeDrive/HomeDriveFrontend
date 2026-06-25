import { Bell, Download, File, Folder } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shadcn/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import { cn } from '@/shadcn/lib/utils';
import { useAppNotifications } from '../../../hooks/useAppNotifications';
import { useTransferNotifications } from '../../../hooks/useTransferNotifications';

function NotificationIcon({ kind }: { kind: 'workspace-access' | 'file-access' | 'download-request' }) {
  if (kind === 'workspace-access') {
    return <Folder className="size-4 text-sky-500" />;
  }

  if (kind === 'file-access') {
    return <File className="size-4 text-emerald-500" />;
  }

  return <Download className="size-4 text-amber-500" />;
}

export function NotificationsButton() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {
    notificationCount,
    sharedAccessNotifications,
    downloadRequestNotifications,
  } = useAppNotifications();
  const { setToastOpen } = useTransferNotifications();

  function openTransferCenter() {
    setToastOpen(true);
    setDropdownOpen(false);
  }

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Notifications"
        >
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
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[24rem] p-0">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Notifications</p>
            {notificationCount > 0 ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {notificationCount}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Shared workspace or file access, plus shared-file download requests.
          </p>
        </div>

        {notificationCount === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">No notifications right now.</div>
        ) : (
          <div className="max-h-112 overflow-y-auto">
            {sharedAccessNotifications.length > 0 ? (
              <div className="px-2 py-2">
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Shared With You
                </p>
                <div className="space-y-1">
                  {sharedAccessNotifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 rounded-md px-2 py-2">
                      <div className="mt-0.5 shrink-0">
                        <NotificationIcon kind={notification.kind} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-5">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {sharedAccessNotifications.length > 0 && downloadRequestNotifications.length > 0 ? (
              <DropdownMenuSeparator />
            ) : null}

            {downloadRequestNotifications.length > 0 ? (
              <div className="px-2 py-2">
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Download Requests
                </p>
                <div className="space-y-1">
                  {downloadRequestNotifications.map((notification) => (
                    <div key={notification.id} className="rounded-md px-2 py-2">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          <NotificationIcon kind={notification.kind} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-5">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                              onPointerDown={(event) => event.preventDefault()}
                              onClick={openTransferCenter}
                            >
                              Review in Transfer Center
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
