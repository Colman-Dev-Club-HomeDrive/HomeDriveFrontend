import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/store/slices/user.slice';
import { authApi } from './apis/auth.api';
import { usersApi } from './apis/users.api';
import { workspacesApi } from './apis/workspaces.api';
import { filesApi } from './apis/files.api';
import { accessApi } from './apis/access.api';
import { setupListeners } from '@reduxjs/toolkit/query/react';

export const store = configureStore({
  reducer: {
    user: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [workspacesApi.reducerPath]: workspacesApi.reducer,
    [filesApi.reducerPath]: filesApi.reducer,
    [accessApi.reducerPath]: accessApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>

    getDefaultMiddleware().concat(
      authApi.middleware,
      usersApi.middleware,
      workspacesApi.middleware,
      filesApi.middleware,
      accessApi.middleware
    ),

});

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
