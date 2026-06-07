import { Cloud } from 'lucide-react';

export function SideBarLogo() {
  return (
    <div className="flex h-14 w-full shrink-0 items-center justify-start px-4">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: 'var(--color-hero)' }}
      >
        <Cloud className="size-5 text-white" />
      </div>
    </div>
  );
}
