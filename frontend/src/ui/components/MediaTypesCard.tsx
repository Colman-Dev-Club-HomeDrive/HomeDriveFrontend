import { MEDIA_TYPES } from '@/consts/consts';
import { useGetMediaTypeCountsQuery } from '@/store/apis/files.api';
import type { MediaType } from '@/types/file.type';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';


export function MediaTypesCard() {
  const navigate = useNavigate();
  const { data: counts = [] } = useGetMediaTypeCountsQuery(undefined);

  const countMap = useMemo(
    () =>
      counts.reduce<Record<MediaType, number>>(
        (acc, item) => {
          acc[item.mediaType] = item.count;
          return acc;
        },
        {
          documents: 0,
          photos: 0,
          videos: 0,
          audio: 0,
        }
      ),
    [counts]
  );

  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-card p-4 shadow-sm">
      <p className="text-sm font-medium px-3 py-1">Media Types</p>
      {MEDIA_TYPES.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary active:scale-[0.98]"
          onClick={() => navigate(`/mydrive?mediaType=${key}`)}
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm">{label}</span>
          <span className="text-sm text-muted-foreground">{countMap[key]}</span>
        </button>
      ))}
    </div>
  );
}
