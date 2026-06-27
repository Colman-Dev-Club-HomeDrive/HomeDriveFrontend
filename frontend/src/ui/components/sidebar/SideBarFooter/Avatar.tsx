import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '@/store/apis/auth.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUser, selectUser } from '@/store/slices/user.slice';

export function Avatar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const displayName = user.name;
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Clear local state even if the server request fails.
    } finally {
      dispatch(clearUser());
      navigate('/');
    }
  };

  return (
    <>
      <div className="flex h-10 w-full items-center gap-3 overflow-hidden rounded-lg px-2.5">
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: 'var(--color-hero)' }}
        >
          {(displayName || 'U').charAt(0).toUpperCase()}
        </div>
        <span className="whitespace-nowrap text-sm text-muted-foreground opacity-0 transition-opacity duration-200 [aside:hover_&]:opacity-100">
          {displayName || 'Account'}
        </span>
      </div>
      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={isLoading}
        className="flex h-10 w-full items-center gap-3 overflow-hidden rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-70"
      >
        <LogOut className="size-4.5 shrink-0" />
        <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 [aside:hover_&]:opacity-100">
          {isLoading ? 'Logging out...' : 'Log out'}
        </span>
      </button>
    </>
  );
}
