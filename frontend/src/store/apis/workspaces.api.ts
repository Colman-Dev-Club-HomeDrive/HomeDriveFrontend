import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';
import type { CreateWorkspaceFormValues, EditWorkspaceFormValues, Workspace } from '@/types/workspace.type';

export const workspacesApi = createApi({
  reducerPath: 'workspacesApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Workspace'],
  endpoints: (builder) => ({
    listWorkspaces: builder.query<Workspace[], void>({
      query: () => '/workspaces',
      providesTags: ['Workspace'],
    }),

    createWorkspace: builder.mutation<Workspace, CreateWorkspaceFormValues>({
      query: (body) => ({ url: '/workspaces', method: 'POST', body }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const tempId = `temp-${crypto.randomUUID()}`;
        const patchResult = dispatch(
          workspacesApi.util.updateQueryData('listWorkspaces', undefined, (draft) => {
            draft.push({ id: tempId, name: body.name, icon: body.icon, color: body.color, fileCount: 0, pinned: false, position: draft.length });
          })
        );
        try {
          const { data: created } = await queryFulfilled;
          dispatch(
            workspacesApi.util.updateQueryData('listWorkspaces', undefined, (draft) => {
              const idx = draft.findIndex((ws) => ws.id === tempId);
              if (idx !== -1) draft[idx] = created;
            })
          );
        } catch {
          patchResult.undo();
        }
      },
    }),

    updateWorkspace: builder.mutation<Workspace, { id: string; values: Partial<EditWorkspaceFormValues & Pick<Workspace, 'pinned' | 'pinnedAt'>> }>({
      query: ({ id, values }) => ({ url: `/workspaces/${id}`, method: 'PATCH', body: values }),
      async onQueryStarted({ id, values }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          workspacesApi.util.updateQueryData('listWorkspaces', undefined, (draft) => {
            const ws = draft.find((w) => w.id === id);
            if (ws) Object.assign(ws, values);
            // Re-sort: pinned first (oldest pinnedAt), then by position
            draft.sort((a, b) => {
              const aPinned = a.pinned ? 1 : 0;
              const bPinned = b.pinned ? 1 : 0;
              if (aPinned !== bPinned) return bPinned - aPinned;
              if (a.pinned && b.pinned) {
                return (a.pinnedAt ?? '').localeCompare(b.pinnedAt ?? '');
              }
              return a.position - b.position;
            });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    deleteWorkspace: builder.mutation<void, string>({
      query: (id) => ({ url: `/workspaces/${id}`, method: 'DELETE' }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          workspacesApi.util.updateQueryData('listWorkspaces', undefined, (draft) => {
            const idx = draft.findIndex((ws) => ws.id === id);
            if (idx !== -1) draft.splice(idx, 1);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    reorderWorkspaces: builder.mutation<void, string[]>({
      query: (ids) => ({ url: '/workspaces/reorder', method: 'PATCH', body: { ids } }),
      async onQueryStarted(ids, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          workspacesApi.util.updateQueryData('listWorkspaces', undefined, (draft) => {
            draft.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useListWorkspacesQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useReorderWorkspacesMutation,
} = workspacesApi;
