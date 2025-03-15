import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: { user: null },
  reducers: {
    setCurrentUser: (state, action) => {
      const user = action.payload;
      state.user = user;
    },
    logoutOfUser: (state) => {
      state.user = null;
    },
  },
});

export const { setCurrentUser, logoutOfUser } = userSlice.actions;

export default userSlice.reducer;

export const selectCurrentUser = (state) => state.user.user // state -> slice -> object.
