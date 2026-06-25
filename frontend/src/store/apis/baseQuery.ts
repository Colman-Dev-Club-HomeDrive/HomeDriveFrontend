import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { VITE_API_URL } from '@/consts/consts';

export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: VITE_API_URL || '/api',
  credentials: 'include',
});
