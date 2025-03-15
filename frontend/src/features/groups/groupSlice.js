import { createSlice } from "@reduxjs/toolkit";

const groupSlice = createSlice({
  name: "group",
  initialState: { group: null },
  reducers: {
    setCurrentGroup: (state, action) => {
      const group = action.payload;
      state.group = group;
    },
    logoutOfGroup: (state) => {
      state.group = null;
    },
  },
});

export const { setCurrentGroup, logoutOfGroup } = groupSlice.actions;

export default groupSlice.reducer;

export const selectCurrentGroup = (state) => state.group.group; // state -> slice -> object.
