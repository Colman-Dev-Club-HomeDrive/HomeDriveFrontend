const AVATAR_COLORS = [
  '#6b7280',
  '#8b5cf6',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
  '#84cc16',
] as const;

export function getUserInitials(displayName?: string, email?: string): string {
  const trimmedName = displayName?.trim();
  if (trimmedName) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
    }
    return (parts[0]?.[0] ?? '?').toUpperCase();
  }

  const trimmedEmail = email?.trim();
  if (trimmedEmail) {
    return trimmedEmail[0].toUpperCase();
  }

  return '?';
}

export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
