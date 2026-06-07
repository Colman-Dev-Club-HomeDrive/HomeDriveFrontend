import { Search as SearchIcon } from 'lucide-react';

export function Search() {
  return (
    <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors focus-within:border-ring focus-within:bg-background focus-within:text-foreground">
      <SearchIcon className="size-4 shrink-0" />
      <input
        type="text"
        placeholder="Search files, folders, workspaces..."
        className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
