import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';

export type AccessUserRole = 'manager' | 'editor' | 'viewer';

export type AccessUser = {
  email: string;
  role: AccessUserRole;
};

export type AccessAdminUser = AccessUser & {
  createdAt: string;
  updatedAt: string;
};

type AccessUsersResponse = {
  users: AccessUser[];
};

type AccessAdminUsersResponse = {
  users: AccessAdminUser[];
};

export const accessApi = createApi({
  reducerPath: 'accessApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['AccessUsers'],
  endpoints: (builder) => ({
    listAccessUsers: builder.query<AccessUser[], void>({
      query: () => ({ url: '/access/users' }),
      transformResponse: (response: AccessUsersResponse) => response.users,
      providesTags: ['AccessUsers'],
    }),
    listAccessAdminUsers: builder.query<AccessAdminUser[], void>({
      query: () => ({ url: '/access/admin/users' }),
      transformResponse: (response: AccessAdminUsersResponse) => response.users,
      providesTags: ['AccessUsers'],
    }),
    addAccessUser: builder.mutation<AccessUser[], string>({
      query: (email) => ({
        url: '/access/users',
        method: 'POST',
        body: { email },
      }),
      transformResponse: (response: AccessUsersResponse) => response.users,
      invalidatesTags: ['AccessUsers'],
    }),
    removeAccessUser: builder.mutation<AccessUser[], string>({
      query: (email) => ({
        url: '/access/users',
        method: 'DELETE',
        body: { email },
      }),
      transformResponse: (response: AccessUsersResponse) => response.users,
      invalidatesTags: ['AccessUsers'],
    }),
    updateAccessUserRole: builder.mutation<AccessUser[], { email: string; role: AccessUserRole }>({
      query: ({ email, role }) => ({
        url: '/access/users/role',
        method: 'PATCH',
        body: { email, role },
      }),
      transformResponse: (response: AccessUsersResponse) => response.users,
      invalidatesTags: ['AccessUsers'],
    }),
  }),
});

export const {
  useListAccessUsersQuery,
  useListAccessAdminUsersQuery,
  useAddAccessUserMutation,
  useRemoveAccessUserMutation,
  useUpdateAccessUserRoleMutation,
} = accessApi;
