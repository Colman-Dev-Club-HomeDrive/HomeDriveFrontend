import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';
import type { BrowseDirectoryResult, IndexedFile, MediaType, MediaTypeCount, StorageStats } from '@/types/file.type';

type ListFilesArgs =
  | string
  | {
      workspaceId?: string;
      mediaType?: MediaType;
    }
  | undefined;

export const filesApi = createApi({
  reducerPath: 'filesApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['File'],
  endpoints: (builder) => ({
    browseDirectory: builder.query<BrowseDirectoryResult, string | undefined>({
      query: (path) => ({
        url: '/files/browse',
        params: path ? { path } : {},
      }),
    }),

    listFiles: builder.query<IndexedFile[], ListFilesArgs>({
      query: (args) => {
        const params =
          typeof args === 'string'
            ? { workspaceId: args }
            : Object.fromEntries(Object.entries(args ?? {}).filter(([, v]) => v !== undefined));

        return {
        url: '/files',
        params,
      };
      },
      providesTags: ['File'],
    }),

    getMediaTypeCounts: builder.query<MediaTypeCount[], string | undefined>({
      query: (workspaceId) => ({
        url: '/files/media-types',
        params: workspaceId ? { workspaceId } : {},
      }),
      providesTags: ['File'],
    }),

    getStorageStats: builder.query<StorageStats, void>({
      query: () => ({
        url: '/files/storage',
      }),
      providesTags: ['File'],
    }),

    indexFile: builder.mutation<IndexedFile, { path: string; workspaceId?: string; shareWith?: string }>({
      query: (body) => ({ 
        url: '/files', 
        method: 'POST', 
        body: Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined))
      }),
      invalidatesTags: ['File'],
    }),

    deleteFile: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/files/${id}`, method: 'DELETE' }),
      invalidatesTags: ['File'],
    }),

    openFile: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/files/${id}/open`, method: 'POST' }),
    }),

    renameFile: builder.mutation<IndexedFile, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/files/${id}`,
        method: 'PATCH',
        body: { name },
      }),
      invalidatesTags: ['File'],
    }),
  }),
});

export const {
  useBrowseDirectoryQuery,
  useListFilesQuery,
  useGetMediaTypeCountsQuery,
  useGetStorageStatsQuery,
  useIndexFileMutation,
  useDeleteFileMutation,
  useOpenFileMutation,
  useRenameFileMutation,
} = filesApi;
