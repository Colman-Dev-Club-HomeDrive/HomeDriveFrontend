import { Search } from './Search';
import { ChatBotButton } from './ChatBotButton';
import { NotificationsButton } from './NotificationsButton';

export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4">
      <div className="flex-1" />
      <Search />
      <div className="flex flex-1 items-center justify-end gap-3">
        <ChatBotButton />
        <NotificationsButton />
      </div>
    </header>
  );
}
