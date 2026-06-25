import { useGetMeQuery } from '@/store/apis/auth.api';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useGetMeQuery();

  return children;
}
