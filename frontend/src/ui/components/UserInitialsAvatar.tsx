import { getAvatarColor, getUserInitials } from '@/utils/userAvatar';
import { cn } from '@/shadcn/lib/utils';

type UserInitialsAvatarProps = {
  displayName?: string;
  email?: string;
  seed?: string;
  size?: number;
  className?: string;
};

export function UserInitialsAvatar({
  displayName,
  email,
  seed,
  size = 38,
  className,
}: UserInitialsAvatarProps) {
  const initials = getUserInitials(displayName, email);
  const backgroundColor = getAvatarColor(seed ?? email ?? displayName ?? initials);

  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold leading-none text-white',
        className,
      )}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        backgroundColor,
        fontSize: initials.length > 1 ? size * 0.32 : size * 0.4,
      }}
    >
      <span className="select-none">{initials}</span>
    </div>
  );
}
