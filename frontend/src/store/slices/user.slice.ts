import type { User } from '@/types/user.type';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type UserState = User & {
  notificationCount: number;
};

const initialState: UserState = {
  id: crypto.randomUUID(),
  name: 'Itay',
  notificationCount: 3,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
    },
    updateUserName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    resetUser: (state) => {
      state.id = crypto.randomUUID();
      state.name = 'Itay';
    },
    setNotificationCount: (state, action: PayloadAction<number>) => {
      state.notificationCount = action.payload;
    },
  }
});

export const { setUser, updateUserName, resetUser, setNotificationCount } = userSlice.actions;

export const selectUser = (state: { user: UserState }) => state.user;
export const selectNotificationCount = (state: { user: UserState }) => state.user.notificationCount;


export default userSlice.reducer;
