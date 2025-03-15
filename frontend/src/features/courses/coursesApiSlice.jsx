import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const coursesAdapter = createEntityAdapter({})

const initialStateCourses = coursesAdapter.getInitialState()

export const coursesApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getCourses: builder.query({
      query: () => '/courses',
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError
      },
      transformResponse: responseData => {
        const loadedCourses = responseData.map(course => {
          course.id = course._id
          return course
        });
        return coursesAdapter.setAll(initialStateCourses, loadedCourses)
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: 'Course', id: 'LIST'},
            ...result.ids.map(id => ({ type: 'Course', id }))
          ]
        } else return [{ type: 'Course', id: 'LIST' }]
      }
    }),
    addNewCourse: builder.mutation({
        query: initialCourse => ({
            url: '/courses',
            method: 'POST',
            body: {
                ...initialCourse,
            }
        }),
        invalidatesTags: [
            { type: 'Course', id: "LIST" }
        ]
    }),
    editCourse: builder.mutation({
      query: initialCourseData => ({
        url: '/courses',
        method: 'PATCH',
        body: {
            ...initialCourseData,
        }
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Course', id: arg.id }
      ]
    }),
    joinCourse: builder.mutation({
      query: initialCourseData => ({
        url: '/courses/join',
        method: 'POST',
        body: {
          ...initialCourseData,
        }
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Course', id: arg.id }
      ]
    }),
    leaveCourse: builder.mutation({
      query: initialCourseData => ({
        url: '/courses/leave',
        method: 'POST',
        body: {
          ...initialCourseData,
        }
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Course', id: arg.id }
      ]
    }),
    deleteCourse: builder.mutation({
      query: initialCourseData => ({
          url: `/courses`,
          method: 'DELETE',
          body: {
            ...initialCourseData
          }
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Course', id: arg.id }
      ]
    }),
    kick: builder.mutation({
      query: initialCourseData => ({
        url: '/courses/kick',
        method: 'POST',
        body: {
          ...initialCourseData,
        }
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Course', id: arg.id }
      ]
    }),
    getMatchingSuggestions: builder.query({
      query: initialData => ({
        url: `/groups/match/suggest`,
        method: 'GET',
        params: { ...initialData },
      }),
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError
      },
      providesTags: (result, error, arg) => {
        return [{ type: 'Match', id: 'LIST'}]
      }
    }),
    assignGroupsProjects: builder.mutation({
      query: initialCourseData => ({
        url: '/groups/match/assign',
        method: 'PUT',
        body: {
            ...initialCourseData,
        }
      }),
      invalidatesTags: (result, error, arg) => [
          {type: 'Match', id: 'LIST' }, 
          {type: 'Group', id: 'LIST'}, 
          {type: 'Project', id: 'LIST'}
      ]
    }),
    clearProjectAssignments: builder.mutation({
      query: initialCourseData => ({
        url: '/groups/clearprojectassignments',
        method: 'PATCH',
        body: {
            ...initialCourseData,
        }
      }),
      invalidatesTags: (result, error, arg) => [
          {type: 'Group', id: 'LIST'}, 
          {type: 'Project', id: 'LIST'}
      ]
    }),
  }),
})

export const {
    useGetCoursesQuery,
    useAddNewCourseMutation,
    useDeleteCourseMutation,
    useEditCourseMutation,
    useJoinCourseMutation,
    useLeaveCourseMutation,
    useKickMutation,
    useGetMatchingSuggestionsQuery,
    useAssignGroupsProjectsMutation,
    useClearProjectAssignmentsMutation
} = coursesApiSlice

// returns the query result object
export const selectCoursesResult = coursesApiSlice.endpoints.getCourses.select()

// creates memoized selector
const selectCoursesData = createSelector(
    selectCoursesResult,
    coursesResult => coursesResult.data //normalized state object with ids & entities
)

// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllCourses,
  selectById: selectCourseById,
  selectIds: selectCourseIds
  // Pass in a selector that returns the Users slice of state
} = coursesAdapter.getSelectors(state => selectCoursesData(state) ?? initialState)
