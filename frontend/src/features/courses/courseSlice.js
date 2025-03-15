import { createSlice } from "@reduxjs/toolkit";

const courseSlice = createSlice({
  name: "course",
  initialState: { course: null },
  reducers: {
    setCurrentCourse: (state, action) => {
      const course = action.payload;
      state.course = course;
    },
    logoutOfCourse: (state) => {
      state.course = null;
    },
  },
});

export const { setCurrentCourse, logoutOfCourse } = courseSlice.actions;

export default courseSlice.reducer;

export const selectCurrentCourse = (state) => state.course.course; // state -> slice -> object.
