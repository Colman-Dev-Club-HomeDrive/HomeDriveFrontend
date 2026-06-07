import { MEDIA_TYPES } from '@/consts/consts';


export function MediaTypesCard() {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-card p-4 shadow-sm">
      <p className="text-sm font-medium px-3 py-1">Media Types</p>
      {MEDIA_TYPES.map(({ label, icon: Icon, count }) => (
        <button
          key={label}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary active:scale-[0.98]"
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm">{label}</span>
          <span className="text-sm text-muted-foreground">{count}</span>
        </button>
      ))}
    </div>
  );
}
