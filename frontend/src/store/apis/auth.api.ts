import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { VITE_API_URL } from '@/consts/consts';
import type { LoginRequest, LoginResponse } from '@/types/auth.type';
import type { RegisterRequest, RegisterResponse } from '@/types/auth.type';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VITE_API_URL || '/api',
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
    baseUrl: VITE_API_URL || 'http://localhost:3000/api',
  }),
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
export const { useRegisterMutation } = authApi;
