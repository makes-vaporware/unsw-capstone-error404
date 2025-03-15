import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
  name: "project",
  initialState: { project: null },
  reducers: {
    setCurrentProject: (state, action) => {
      const project = action.payload;
      state.project = project;
    },
    logoutOfProject: (state) => {
      state.project = null;
    },
  },
});

export const { setCurrentProject, logoutOfProject } = projectSlice.actions;

export default projectSlice.reducer;

export const selectCurrentProject = (state) => state.project.project; // state -> slice -> object.
