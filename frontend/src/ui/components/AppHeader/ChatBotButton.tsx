import { Bot } from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';

export function ChatBotButton() {
  return (
    <Button variant="ghost" size="icon" className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" aria-label="AI Assistant">
      <Bot className="size-5.5" />
    </Button>
  );
}
