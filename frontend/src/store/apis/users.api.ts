import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';

type ApiUser = {
  _id: string;
  email: string;
  name: string;
  posts: string[];
  createdAt: string;
  updatedAt: string;
};

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    listUsers: builder.query<ApiUser[], void>({
      query: () => '/users',
    }),
  }),
});

export const { useListUsersQuery, useLazyListUsersQuery } = usersApi;
