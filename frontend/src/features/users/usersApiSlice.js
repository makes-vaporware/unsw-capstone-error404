import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const usersAdapter = createEntityAdapter({})

const initialStateUsers = usersAdapter.getInitialState()

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query({
      query: () => '/users',
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError
      },
      transformResponse: responseData => {
        const loadedUsers = responseData.map(user => {
          user.id = user._id
          return user
        });
        return usersAdapter.setAll(initialStateUsers, loadedUsers)
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: 'User', id: 'LIST'},
            ...result.ids.map(id => ({ type: 'User', id }))
          ]
        } else return [{ type: 'User', id: 'LIST' }]
      }
    }),
    getUser: builder.query({
      query: arg => ({
        url: '/users/profile',
        method: 'GET',
        params: {...arg}
      }),
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError
      },
      transformResponse: responseData => {
        responseData.id = responseData._id
        const loadedCourses = responseData.courses.map(course => {
          course.id = course._id
          return course
        });
        responseData.courses = loadedCourses
        return responseData
      },
      providesTags: (result, error, arg) => {
        if (!error) return [{ type: 'User', id: arg.userId}]
        else return [{ type: 'Error'}]
      }
    }),
    getUserSCP: builder.query({
      query: (arg) => ({
        url: '/users/scp',
        method: 'GET',
        params: {...arg }
      }),
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError
      },
      providesTags: (result, error, arg) => {
        return [{ type: 'UserSCP', id: arg.id}]
      }
    }),
    editProfile: builder.mutation({
      query: initialUserData => ({
        url: '/users',
        method: 'PATCH',
        body: {
            ...initialUserData,
        }
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'User', id: arg.id }
      ]
    }),
    deleteUser: builder.mutation({
      query: ({ id }) => ({
          url: `/users`,
          method: 'DELETE',
          body: { userId: id }
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'User', id: arg.id }
      ]
  }),
  }),
})

export const {
    useGetUsersQuery,
    useEditProfileMutation,
    useDeleteUserMutation,
    useGetUserQuery,
    useGetUserSCPQuery,
} = usersApiSlice

// returns the query result object
export const selectUsersResult = usersApiSlice.endpoints.getUsers.select()
export const selectUserResult = usersApiSlice.endpoints.getUser.select()

// creates memoized selector
const selectUsersData = createSelector(
    selectUsersResult,
    usersResult => usersResult.data //normalized state object with ids & entities
)

// creates memoized selector
const selectUserData = createSelector(
  selectUserResult,
  userResult => userResult.data //normalized state object with ids & entities
)

// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds
  // Pass in a selector that returns the Users slice of state
} = usersAdapter.getSelectors(state => selectUsersData(state) ?? initialState)
