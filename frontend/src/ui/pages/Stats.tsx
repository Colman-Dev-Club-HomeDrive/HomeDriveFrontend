import { useMemo } from 'react';
import { BarChart3, Cloud, FileText, Image, Music, Users, Video } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useGetStorageStatsQuery, useListFilesQuery } from '@/store/apis/files.api';
import { useListUsersQuery } from '@/store/apis/users.api';
import { useListWorkspacesQuery } from '@/store/apis/workspaces.api';
import type { IndexedFile, MediaType } from '@/types/file.type';
import { formatSize } from '@/utils/formatSize';

type MediaConfig = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const MEDIA_CONFIG: Record<MediaType, MediaConfig> = {
  documents: { label: 'Documents', icon: FileText, color: '#5E7892' },
  photos: { label: 'Photos', icon: Image, color: '#4A7C6B' },
  videos: { label: 'Videos', icon: Video, color: '#C98A2E' },
  audio: { label: 'Audio', icon: Music, color: '#7B6AA9' },
};

function getMediaTypeFromFile(file: IndexedFile): MediaType {
  const mime = file.mimeType.toLowerCase();
  if (mime.startsWith('image/')) return 'photos';
  if (mime.startsWith('video/')) return 'videos';
  if (mime.startsWith('audio/')) return 'audio';
  return 'documents';
}

export function Stats() {
  const {
    data: storageStats,
    isLoading: isStorageLoading,
    isError: isStorageError,
  } = useGetStorageStatsQuery();
  const {
    data: files = [],
    isLoading: isFilesLoading,
    isError: isFilesError,
  } = useListFilesQuery(undefined);
  const { data: users = [], isLoading: isUsersLoading, isError: isUsersError } = useListUsersQuery();
  const { data: workspaces = [], isLoading: isWorkspacesLoading, isError: isWorkspacesError } = useListWorkspacesQuery();

  const chartData = useMemo(
    () => {
      const grouped = files.reduce<Record<MediaType, { count: number; bytes: number }>>(
        (acc, file) => {
          if (file.isDirectory) return acc;
          const mediaType = getMediaTypeFromFile(file);
          acc[mediaType] = {
            count: acc[mediaType].count + 1,
            bytes: acc[mediaType].bytes + file.size,
          };
          return acc;
        },
        {
          documents: { count: 0, bytes: 0 },
          photos: { count: 0, bytes: 0 },
          videos: { count: 0, bytes: 0 },
          audio: { count: 0, bytes: 0 },
        },
      );

      return (Object.keys(MEDIA_CONFIG) as MediaType[]).map((key) => ({
        key,
        label: MEDIA_CONFIG[key].label,
        color: MEDIA_CONFIG[key].color,
        count: grouped[key].count,
        bytes: grouped[key].bytes,
      }));
    },
    [files],
  );

  const totalFiles = chartData.reduce((sum, item) => sum + item.count, 0);
  const totalBytes = chartData.reduce((sum, item) => sum + item.bytes, 0);
  const capacityBytes = storageStats?.capacityBytes ?? 0;
  const usedBytes = storageStats?.metadataUsedBytes ?? 0;
  const availableBytes = storageStats?.availableBytes ?? 0;
  const usagePct = capacityBytes > 0 ? Math.min((usedBytes / capacityBytes) * 100, 100) : 0;

  const usageByUser = useMemo(() => {
    const userNameById = new Map(users.map((user) => [user._id, user.name]));
    const grouped = files.reduce<Record<string, { bytes: number; files: number }>>((acc, file) => {
      if (file.isDirectory) return acc;
      const key = file.ownerId;
      const current = acc[key] ?? { bytes: 0, files: 0 };
      acc[key] = {
        bytes: current.bytes + file.size,
        files: current.files + 1,
      };
      return acc;
    }, {});

    const rows = Object.entries(grouped)
      .map(([ownerId, totals]) => ({
        ownerId,
        ownerName: userNameById.get(ownerId) ?? 'Unknown user',
        bytes: totals.bytes,
        files: totals.files,
      }))
      .sort((a, b) => b.bytes - a.bytes);

    const topBytes = rows[0]?.bytes ?? 0;
    return rows.map((row) => ({
      ...row,
      sharePct: topBytes > 0 ? (row.bytes / topBytes) * 100 : 0,
    }));
  }, [files, users]);

  const usageByWorkspace = useMemo(() => {
    const rows = workspaces.map((workspace) => ({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      bytes: 0,
      files: 0,
    }));
    const rowByWorkspaceId = new Map(rows.map((row) => [row.workspaceId, row]));
    let unassigned = { workspaceId: 'unassigned', workspaceName: 'Unassigned', bytes: 0, files: 0 };

    for (const file of files) {
      if (file.isDirectory) continue;

      if (!file.workspaceId) {
        unassigned = {
          ...unassigned,
          bytes: unassigned.bytes + file.size,
          files: unassigned.files + 1,
        };
        continue;
      }

      const existing = rowByWorkspaceId.get(file.workspaceId);
      if (existing) {
        existing.bytes += file.size;
        existing.files += 1;
        continue;
      }

      const orphanWorkspace = {
        workspaceId: file.workspaceId,
        workspaceName: 'Archived workspace',
        bytes: file.size,
        files: 1,
      };
      rows.push(orphanWorkspace);
      rowByWorkspaceId.set(file.workspaceId, orphanWorkspace);
    }

    if (unassigned.files > 0) {
      rows.push(unassigned);
    }

    rows.sort((a, b) => b.bytes - a.bytes || a.workspaceName.localeCompare(b.workspaceName));

    const topBytes = rows[0]?.bytes ?? 0;
    return rows.map((row) => ({
      ...row,
      sharePct: topBytes > 0 ? (row.bytes / topBytes) * 100 : 0,
    }));
  }, [files, workspaces]);

  const isUserUsageLoading = isFilesLoading || isUsersLoading;
  const isUserUsageError = isFilesError || isUsersError;
  const isWorkspaceUsageLoading = isFilesLoading || isWorkspacesLoading;
  const isWorkspaceUsageError = isFilesError || isWorkspacesError;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your storage footprint across all files, users, and workspaces</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Storage Usage</h2>
          </div>
          <span className="text-xs text-muted-foreground">{usagePct.toFixed(1)}%</span>
        </div>

        {isStorageError ? (
          <p className="text-sm text-destructive">Could not load storage usage.</p>
        ) : isStorageLoading ? (
          <div className="space-y-3">
            <div className="h-8 w-44 animate-pulse rounded-lg bg-muted" />
            <div className="h-2.5 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-60 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold tracking-tight">{formatSize(usedBytes)}</p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>Capacity: {formatSize(capacityBytes)}</span>
              <span>Available: {formatSize(availableBytes)}</span>
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Usage By File Type</h2>
          </div>
          <span className="text-xs text-muted-foreground">{totalFiles} files • {formatSize(totalBytes)}</span>
        </div>

        {isFilesError ? (
          <p className="text-sm text-destructive">Could not load file type data.</p>
        ) : isFilesLoading ? (
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
        ) : (
          <>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'var(--color-accent-soft)' }}
                    formatter={(value, _name, item) => {
                      const bytes = Number(item?.payload?.bytes ?? 0);
                      return [`${value} files • ${formatSize(bytes)}`, 'Usage'];
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    {chartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {chartData.map((item) => {
                const Icon = MEDIA_CONFIG[item.key].icon;
                return (
                  <div key={item.key} className="rounded-xl bg-muted/60 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Icon className="size-3.5" style={{ color: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold">{item.count} file{item.count !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(item.bytes)}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Usage By Workspaces</h2>
          </div>
          <span className="text-xs text-muted-foreground">Top spaces by data usage</span>
        </div>

        {isWorkspaceUsageError ? (
          <p className="text-sm text-destructive">Could not load workspace usage data.</p>
        ) : isWorkspaceUsageLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : usageByWorkspace.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workspace usage data yet.</p>
        ) : (
          <div className="space-y-3">
            {usageByWorkspace.map((entry, index) => (
              <div key={entry.workspaceId} className="rounded-xl border border-border/80 bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      #{index + 1} {entry.workspaceName}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.files} file{entry.files !== 1 ? 's' : ''}</p>
                  </div>
                  <p className="text-sm font-medium">{entry.bytes === 0 ? '0 KB' : formatSize(entry.bytes)}</p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/70">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${entry.sharePct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Usage By User</h2>
          </div>
          <span className="text-xs text-muted-foreground">Top consumers first</span>
        </div>

        {isUserUsageError ? (
          <p className="text-sm text-destructive">Could not load user usage data.</p>
        ) : isUserUsageLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : usageByUser.length === 0 ? (
          <p className="text-sm text-muted-foreground">No user usage data yet.</p>
        ) : (
          <div className="space-y-3">
            {usageByUser.map((entry, index) => (
              <div key={entry.ownerId} className="rounded-xl border border-border/80 bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      #{index + 1} {entry.ownerName}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.files} file{entry.files !== 1 ? 's' : ''}</p>
                  </div>
                  <p className="text-sm font-medium">{formatSize(entry.bytes)}</p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/70">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${entry.sharePct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
