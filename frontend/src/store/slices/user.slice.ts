import type { User } from '@/types/user.type';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/store/apis/auth.api';

type UserState = User & {
  isAuthenticated: boolean;
  isAuthChecked: boolean;
};

const initialState: UserState = {
  id: '',
  name: '',
  email: '',
  isAuthenticated: false,
  isAuthChecked: false,
};

const applyAuthenticatedUser = (
  state: UserState,
  user: { id: string; name: string; email: string },
) => {
  state.id = user.id;
  state.name = user.name;
  state.email = user.email;
  state.isAuthenticated = true;
  state.isAuthChecked = true;
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; name: string; email?: string }>) => {
      applyAuthenticatedUser(state, {
        id: action.payload.id,
        name: action.payload.name,
        email: action.payload.email ?? '',
      });
    },
    updateUserName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    clearUser: (state) => {
      state.id = '';
      state.name = '';
      state.email = '';
      state.isAuthenticated = false;
      state.isAuthChecked = true;
    },
    resetUser: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action) => {
        applyAuthenticatedUser(state, action.payload.user);
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        applyAuthenticatedUser(state, action.payload.user);
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        applyAuthenticatedUser(state, action.payload.user);
      })
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state, action) => {
        const status = action.payload?.status;
        if (status === 401 || status === 403) {
          state.id = '';
          state.name = '';
          state.email = '';
          state.isAuthenticated = false;
        }
        state.isAuthChecked = true;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.id = '';
        state.name = '';
        state.email = '';
        state.isAuthenticated = false;
        state.isAuthChecked = true;
      });
  },
});

export const { setUser, updateUserName, clearUser, resetUser } = userSlice.actions;

export const selectUser = (state: { user: UserState }) => state.user;
export const selectUserName = (state: { user: UserState }) => state.user.name;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.isAuthenticated;
export const selectIsAuthChecked = (state: { user: UserState }) => state.user.isAuthChecked;

export default userSlice.reducer;
