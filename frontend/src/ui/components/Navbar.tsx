import { useState, type KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Bot, Search } from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';
import { cn } from '@/shadcn/lib/utils';
import { useFileSearch } from '@/hooks/useFileSearch';

type NavbarProps = {
  notificationCount?: number;
};

/** Search field rendered in the top Navbar / header bar. */
export function NavbarSearchInput() {
  const { submitSearch } = useFileSearch();
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;

    e.preventDefault();
    submitSearch(inputValue);

    const isFileListPage =
      location.pathname === '/mydrive' ||
      location.pathname.startsWith('/workspaces');

    if (!isFileListPage) {
      navigate('/mydrive');
    }
  };

  return (
    <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors focus-within:border-ring focus-within:bg-background focus-within:text-foreground">
      <Search className="size-4 shrink-0" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search files, folders, workspaces..."
        className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

export function Navbar({ notificationCount = 0 }: NavbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4">
      {/* Left — spacer so search stays centered */}
      <div className="flex-1" />

      {/* Centre — search bar */}
      <NavbarSearchInput />

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
