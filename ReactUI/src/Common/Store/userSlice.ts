// src/store/userSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


interface User {
  userId: string;
  roles:string[];
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  fetched:boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  fetched:false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      debugger;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.fetched=true;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.fetched=false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
