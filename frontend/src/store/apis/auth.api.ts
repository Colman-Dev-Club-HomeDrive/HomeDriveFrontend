import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
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

  return { user } as T;
};

const AUTH_ME_PATHS = ['/auth/me', '/users/me'] as const;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        let lastError: unknown = null;

        for (const url of AUTH_ME_PATHS) {
          const result = await baseQuery(url);

          if (result.error) {
            lastError = result.error;
            continue;
          }

          try {
            return { data: toAuthResponse<MeResponse>(result.data) };
          } catch (error) {
            lastError = error;
          }
        }

        return {
          error: (lastError as { status?: number }) ?? { status: 404, data: 'Current user not found' },
        };
      },
      providesTags: ['Auth'],
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => toAuthResponse<LoginResponse>(response),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => toAuthResponse<RegisterResponse>(response),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} = authApi;
