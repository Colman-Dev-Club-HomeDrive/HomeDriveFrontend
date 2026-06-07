import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user.slice';

export function Avatar() {
  const user = useAppSelector(selectUser);
  return (
    <div className="flex h-10 w-full items-center gap-3 overflow-hidden rounded-lg px-2.5">
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: 'var(--color-hero)' }}
      >
        {(user?.name ?? 'U').charAt(0).toUpperCase()}
      </div>
      <span className="whitespace-nowrap text-sm text-muted-foreground opacity-0 transition-opacity duration-200 [aside:hover_&]:opacity-100">
        {user?.name ?? 'Account'}
      </span>
    </div>
  );
}
