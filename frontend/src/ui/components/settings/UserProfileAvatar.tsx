import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import { getAvatarColor, getUserInitials } from '@/utils/userAvatar';

type UserProfileAvatarProps = {
  displayName?: string;
  email?: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
  onImageChange?: (file: File) => void;
  showChangePhoto?: boolean;
};

export function UserProfileAvatar({
  displayName,
  email,
  imageUrl,
  size = 112,
  className,
  onImageChange,
  showChangePhoto = false,
}: UserProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initials = getUserInitials(displayName, email);
  const backgroundColor = getAvatarColor(email ?? displayName ?? initials);
  const fontSize = initials.length > 1 ? size * 0.32 : size * 0.4;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange?.(file);
    }
    event.target.value = '';
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative">
        <div
          className="overflow-hidden rounded-full ring-4 ring-border"
          style={{ width: size, height: size }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayName ? `${displayName}'s avatar` : 'User avatar'}
              className="size-full object-cover"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center font-semibold leading-none text-white"
              style={{ backgroundColor, fontSize }}
              aria-hidden
            >
              <span className="select-none">{initials}</span>
            </div>
          )}
        </div>

        {showChangePhoto && onImageChange ? (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              aria-label="Change profile photo"
            >
              <Camera className="size-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
