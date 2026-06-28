import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types/auth.type';
import { normalizeAuthUser } from '@/utils/normalizeAuthUser';

const toAuthResponse = <T extends { user: NonNullable<ReturnType<typeof normalizeAuthUser>> }>(
  response: unknown,
): T => {
  const user = normalizeAuthUser(response);
  if (!user) {
    throw new Error('Invalid auth response: user is missing');
  }

  const token =
    response !== null && typeof response === 'object' && 'token' in response
      ? (response as Record<string, unknown>).token
      : undefined;

  return { user, token } as T;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => toAuthResponse<LoginResponse>(response),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            localStorage.setItem('token', data.token);
          }
        } catch {
          // Error handled by the component
        }
      },
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => toAuthResponse<RegisterResponse>(response),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            localStorage.setItem('token', data.token);
          }
        } catch {
          // Error handled by the component
        }
      },
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      onQueryStarted: async () => {
        localStorage.removeItem('token');
      },
      invalidatesTags: ['Auth'],
    }),
    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useChangePasswordMutation,
} = authApi;
