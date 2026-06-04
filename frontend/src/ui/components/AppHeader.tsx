import { Bell, Bot, Search } from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';
import { cn } from '@/shadcn/lib/utils';

type AppHeaderProps = {
  notificationCount?: number;
};

export function AppHeader({ notificationCount = 0 }: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4">
      {/* Left — spacer so search stays centered */}
      <div className="flex-1" />

      {/* Centre — search bar */}
      <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors focus-within:border-ring focus-within:bg-background focus-within:text-foreground">
        <Search className="size-4 shrink-0" />
        <input
          type="text"
          placeholder="Search files, folders, workspaces..."
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Right — actions */}
      <div className="flex flex-1 items-center justify-end gap-3">
        {/* Chatbot */}
        <Button variant="outline" size="icon" className="size-9" aria-label="AI Assistant">
          <Bot className="size-5.5" />
        </Button>

        {/* Notifications */}
        <Button variant="outline" size="icon" className="relative size-9" aria-label="Notifications">
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
      </div>
    </header>
  );
}
