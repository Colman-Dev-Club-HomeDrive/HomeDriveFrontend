import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { clearUser, setUser } from '@/store/slices/user.slice';

type JwtPayload = {
  userId?: string;
  email?: string;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const json = atob(padded);
    const parsed = JSON.parse(json) as JwtPayload;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch(clearUser());
      return;
    }

    const payload = decodeJwtPayload(token);
    if (!payload?.userId) {
      localStorage.removeItem('token');
      dispatch(clearUser());
      return;
    }

    dispatch(
      setUser({
        id: payload.userId,
        email: payload.email ?? '',
        name: payload.email?.split('@')[0] ?? 'User',
      }),
    );
  }, [dispatch]);

  return children;
}
