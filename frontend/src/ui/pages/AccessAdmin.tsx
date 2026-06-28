import { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useListAccessAdminUsersQuery } from '@/store/apis/access.api';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function roleLabel(role: 'manager' | 'editor' | 'viewer'): string {
  if (role === 'manager') return 'Owner';
  if (role === 'editor') return 'Editor';
  return 'Viewer';
}

export function AccessAdmin() {
  const { data = [], isLoading, isError, error } = useListAccessAdminUsersQuery();

  const errorMessage = useMemo(() => {
    if (!isError) return '';
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const status = (error as { status?: number | string }).status;
      if (status === 403) return 'Only owners can view this page.';
      if (status === 401) return 'Please log in to continue.';
    }
    return 'Failed to load admin access users.';
  }, [error, isError]);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Access Admin</h1>
          <p className="text-sm text-muted-foreground">Persisted access list and role audit view</p>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {errorMessage}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="h-4 w-44 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                      </td>
                    </tr>
                  ))
                : data.map((entry) => (
                    <tr key={entry.email} className="border-t border-border">
                      <td className="px-4 py-3">{entry.email}</td>
                      <td className="px-4 py-3">{roleLabel(entry.role)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(entry.createdAt)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(entry.updatedAt)}</td>
                    </tr>
                  ))}
              {!isLoading && !isError && data.length === 0 && (
                <tr className="border-t border-border">
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    No access entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
