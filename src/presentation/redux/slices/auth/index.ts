import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IAuthState {
  data: {
    user?: any;
  };
}

export const auth = createSlice({
  name: 'auth',
  initialState: {
    data: {
      user: undefined,
    },
  } as IAuthState,
  reducers: {
    authorizeSuccess: (state, action: PayloadAction<any>) => {
      state.data.user = action.payload;
    },
  },
});

export const { authorizeSuccess } = auth.actions;

export default auth.reducer;
