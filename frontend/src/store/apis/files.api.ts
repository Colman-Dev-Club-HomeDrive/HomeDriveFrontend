import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';
import type { IndexedFile, MediaType, MediaTypeCount, StorageStats } from '@/types/file.type';

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

    uploadFile: builder.mutation<
      IndexedFile,
      { file: File; workspaceId?: string; shareWith?: string }
    >({
      query: ({ file, workspaceId, shareWith }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (workspaceId) formData.append('workspaceId', workspaceId);
        if (shareWith) formData.append('shareWith', shareWith);
        return {
          url: '/files/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['File'],
    }),

    indexFile: builder.mutation<
      IndexedFile,
      {
        path?: string;
        name?: string;
        size?: number;
        mimeType?: string;
        extension?: string;
        isDirectory?: boolean;
        workspaceId?: string;
        shareWith?: string;
      }
    >({
      query: (body) => ({
        url: '/files',
        method: 'POST',
        body: Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)),
      }),
      invalidatesTags: ['File'],
    }),

    deleteFile: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/files/${id}`, method: 'DELETE' }),
      invalidatesTags: ['File'],
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
  useListFilesQuery,
  useGetMediaTypeCountsQuery,
  useGetStorageStatsQuery,
  useUploadFileMutation,
  useIndexFileMutation,
  useDeleteFileMutation,
  useRenameFileMutation,
} = filesApi;
