import type { AuthUser } from '@/types/auth.type';

function readString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

function readId(user: Record<string, unknown>): string {
  return readString(user.id) || readString(user._id);
}

function readName(user: Record<string, unknown>): string {
  for (const key of ['name', 'displayName', 'fullName', 'username'] as const) {
    const value = readString(user[key]);
    if (value) {
      return value;
    }
  }

  return '';
}

function unwrapPayload(response: unknown): Record<string, unknown> | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const payload = response as Record<string, unknown>;
  const nested = payload.data;

  if (nested && typeof nested === 'object') {
    return nested as Record<string, unknown>;
  }

  return payload;
}

export function normalizeAuthUser(response: unknown): AuthUser | null {
  const payload = unwrapPayload(response);
  if (!payload) {
    return null;
  }

  const rawUser = payload.user ?? payload;
  if (!rawUser || typeof rawUser !== 'object') {
    return null;
  }

  const user = rawUser as Record<string, unknown>;
  const id = readId(user);
  const email = readString(user.email);
  const name = readName(user);

  if (!id) {
    return null;
  }

  return { id, name, email };
}
