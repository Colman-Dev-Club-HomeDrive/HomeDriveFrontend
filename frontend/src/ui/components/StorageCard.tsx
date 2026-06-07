import { Cloud } from 'lucide-react';

type StorageCardProps = {
  usedGb: number;
  totalGb: number;
};

export function StorageCard({ usedGb, totalGb }: StorageCardProps) {
  const pct = Math.min((usedGb / totalGb) * 100, 100);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm transition-colors hover:bg-accent">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Storage Used</span>
        <Cloud className="size-4 text-muted-foreground" />
      </div>
      <p className="text-3xl font-bold tracking-tight">
        {usedGb.toFixed(1)}
        <span className="ml-1 text-lg font-normal text-muted-foreground">GB</span>
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Out of {totalGb} GB total</p>
    </div>
  );
}
