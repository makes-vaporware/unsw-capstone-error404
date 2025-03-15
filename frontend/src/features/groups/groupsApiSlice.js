import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const groupsAdapter = createEntityAdapter({})

const initialStateGroups = groupsAdapter.getInitialState()

export const groupsApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getGroups: builder.query({
      query: () => '/groups',
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError
      },
      transformResponse: responseData => {
        const loadedGroups = responseData.map(group => {
          group.id = group._id
          return group
        });
        return groupsAdapter.setAll(initialStateGroups, loadedGroups)
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: 'Group', id: 'LIST'},
            ...result.ids.map(id => ({ type: 'Group', id }))
          ]
        } else return [{ type: 'Group', id: 'LIST' }]
      }
    }),
    recommendGroups: builder.query({
      query: arg => {
        return ({
        url: `/groups/recommend`,
        method: 'GET',
        params: { courseId: arg.courseId }
      })},
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError
      },
      providesTags: (result, error, arg) => {
        return [{ type: 'GroupRec', id: 'LIST' }]
      }
    }),
    getGroupSCPAvg: builder.query({
      query: initialGroupData => ({
        url: `/groups/scp`,
        method: 'GET',
        params: { ...initialGroupData },
      }),
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError
      },
      providesTags: (result, error, arg) => {
        return [{ type: 'GroupSCP', id: arg.groupId}]
      }
    }),
    getGroupSCPSum: builder.query({
      query: initialGroupData => ({
        url: `/groups/scptotal`,
        method: 'GET',
        params: { ...initialGroupData },
      }),
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError
      },
      providesTags: (result, error, arg) => {
        return [{ type: 'GroupSCP', id: arg.groupId}]
      }
    }),
    editGroup: builder.mutation({
      query: initialGroupData => ({
        url: `/groups`,
        method: 'PATCH',
        body: {
            ...initialGroupData,
        }
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Group', id: arg.id }
      ]
    }),
    newGroup: builder.mutation({
      query: initialGroupData => ({
        url: '/groups',
        method: 'POST',
        body: {
            ...initialGroupData,
        }
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Group', id: arg.id },
          { type: 'GroupRec', id: 'LIST'}
      ]
    }),
    deleteGroup: builder.mutation({
      query: initialGroupData => ({
        url: `/groups`,
        method: 'DELETE',
        body: { ...initialGroupData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Group', id: arg.id },
        { type: 'GroupRec', id: 'LIST'}
      ]
    }),
    joinGroup: builder.mutation({
      query: initialGroupData => ({
        url: `/groups/join`,
        method: 'POST',
        body: { ...initialGroupData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Group', id: arg.id },
        { type: 'GroupRec', id: 'LIST'},
        { type: 'GroupSCP', id: arg.id},
        { type: 'ProjectRec', id: arg.id}
      ]
    }),
    leaveGroup: builder.mutation({
      query: initialGroupData => ({
        url: `/groups/leave`,
        method: 'POST',
        body: { ...initialGroupData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Group', id: arg.id },
        { type: 'GroupRec', id: 'LIST'},
        { type: 'GroupSCP', id: arg.id},
        { type: 'ProjectRec', id: arg.id}
      ]
    }),
    changeGroupOwner: builder.mutation({
      query: initialGroupData => ({
        url: `/groups/changeOwner`,
        method: 'POST',
        body: { ...initialGroupData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Group', id: arg.id }
      ]
    }),
    addMemberToGroup: builder.mutation({
      query: initialGroupData => ({
        url: `/groups/adduser`,
        method: 'POST',
        body: { ...initialGroupData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Group', id: arg.id },
        { type: 'GroupRec', id: 'LIST'},
        { type: 'GroupSCP', id: arg.id},
        { type: 'ProjectRec', id: arg.id}
      ]
    }),
    removeMemberFromGroup: builder.mutation({
      query: initialGroupData => ({
        url: `/groups/removeuser`,
        method: 'POST',
        body: { ...initialGroupData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Group', id: arg.id },
        { type: 'GroupRec', id: 'LIST'},
        { type: 'GroupSCP', id: arg.id},
        { type: 'ProjectRec', id: arg.id}
      ]
    }),
  })
})

export const {
  useGetGroupsQuery,
  useEditGroupMutation,
  useDeleteGroupMutation,
  useNewGroupMutation,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useChangeGroupOwnerMutation,
  useAddMemberToGroupMutation,
  useRemoveMemberFromGroupMutation,
  useRecommendGroupsQuery,
  useGetGroupSCPAvgQuery,
  useGetGroupSCPSumQuery
} = groupsApiSlice

// returns the query result object
export const selectGroupsResult = groupsApiSlice.endpoints.getGroups.select()

// creates memoized selector
const selectGroupsData = createSelector(
    selectGroupsResult,
    groupsResult => groupsResult.data //normalized state object with ids & entities
)


// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllGroups,
  selectById: selectGroupById,
  selectIds: selectGroupIds
  // Pass in a selector that returns the Users slice of state
} = groupsAdapter.getSelectors(state => selectGroupsData(state) ?? initialState)
