import { Cloud } from 'lucide-react';
import { formatSize } from '@/utils/formatSize';

type StorageCardProps = {
  usedBytes: number;
  totalBytes: number;
  isLoading?: boolean;
  hasError?: boolean;
};

export function StorageCard({ usedBytes, totalBytes, isLoading = false, hasError = false }: StorageCardProps) {
  const safeTotalBytes = Math.max(totalBytes, 0);
  const safeUsedBytes = Math.max(usedBytes, 0);
  const pct = safeTotalBytes > 0 ? Math.min((safeUsedBytes / safeTotalBytes) * 100, 100) : 0;

  const titleText = hasError ? 'Storage unavailable' : 'Storage Used';
  const usedText = isLoading ? 'Loading...' : formatSize(safeUsedBytes);
  const totalText = safeTotalBytes > 0 ? formatSize(safeTotalBytes) : 'Unknown';

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm transition-colors hover:bg-accent">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{titleText}</span>
        <Cloud className="size-4 text-muted-foreground" />
      </div>
      <p className="text-3xl font-bold tracking-tight">{usedText}</p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Out of {totalText} total
      </p>
    </div>
  );
}
