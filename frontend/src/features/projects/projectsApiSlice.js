import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const projectsAdapter = createEntityAdapter({})

const initialStateProjects = projectsAdapter.getInitialState()

export const projectsApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAllProjects: builder.query({
      query: () => '/projects',
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError
      },
      transformResponse: responseData => {
        const loadedProjects = responseData.map(project => {
          project.id = project._id
          return project
        });
        return projectsAdapter.setAll(initialStateProjects, loadedProjects)
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: 'Project', id: 'LIST'},
            ...result.ids.map(id => ({ type: 'Project', id }))
          ]
        } else return [{ type: 'Project', id: 'LIST' }]
      }
    }),
    getProjectRecs: builder.query({
      query: arg => ({
        url: '/projects/recommend',
        method: 'GET',
        params: {...arg}
      }),
      validateStatus: (response, result) => {
        return response.status === 200 & !result.isError
      },
      providesTags: (result, error, arg) => {
        return [{ type: 'ProjectRec', id: arg.groupId }]
      }
    }),
    newProject: builder.mutation({
        query: initialProjectData => ({
          url: '/projects',
          method: 'POST',
          body: {
              ...initialProjectData,
          }
        }),
        invalidatesTags: (result, error, arg) => [
          { type: 'Project', id: arg.id },
          { type: 'ProjectRec' }
        ]
      }),
    updateProject: builder.mutation({
      query: initialProjectData => ({
        url: `/projects`,
        method: 'PATCH',
        body: { ...initialProjectData }
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Project', id: arg.id },
        { type: 'ProjectRec' }
      ]
    }),
    deleteProject: builder.mutation({
      query: initialProjectData => ({
        url: `/projects`,
        method: 'DELETE',
        body: { ...initialProjectData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Project', id: arg.id },
        { type: 'ProjectRec' }
      ]
    }),
    leaveProject: builder.mutation({
      query: initialProjectData => ({
        url: `/projects/leave`,
        method: 'POST',
        body: { ...initialProjectData },
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Project', id: arg.id }
      ]
    }),
    addClientToProject: builder.mutation({
      query: initialProjectData => ({
        url: `/projects/addclient`,
        method: 'POST',
        body: { ...initialProjectData },
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Project', id: arg.id }
      ]
    }),
    removeClientFromProject: builder.mutation({
      query: initialProjectData => ({
        url: `/projects/removeclient`,
        method: 'POST',
        body: { ...initialProjectData },
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Project', id: arg.id }
      ]
    }),
    addSkillToProject: builder.mutation({
      query: initialProjectData => ({
        url: `/projects/addskill`,
        method: 'POST',
        body: { ...initialProjectData },
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Project', id: arg.id },
          { type: 'ProjectRec' }
      ]
    }),
    removeSkillFromProject: builder.mutation({
      query: initialProjectData => ({
        url: `/projects/removeskill`,
        method: 'POST',
        body: { ...initialProjectData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Project', id: arg.projectId }, 
        { type: 'ProjectRec' }
      ]
    }),
    removeGroupFromProject: builder.mutation({
      query: initialProjectData => ({
        url: `/projects/removegroup`,
        method: 'POST',
        body: { ...initialProjectData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Project', id: arg.projectId }, 
        { type: 'Group', id: arg.groupId  },
      ]
    }),
    addProjPreferences: builder.mutation({
      query: initialProjectData => ({
        url: `/projects/addpreferences`,
        method: 'POST',
        body: { ...initialProjectData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Project', id: arg.projectId }, 
        { type: 'Group', id: arg.groupId  },
        { type: 'ProjectRec', id: arg.groupId }
      ]
    }),
    removeProjPreferences: builder.mutation({
      query: initialProjectData => ({
        url: `/projects/removepreferences`,
        method: 'POST',
        body: { ...initialProjectData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Project', id: arg.projectId }, 
        { type: 'Group', id: arg.groupId  },
        { type: 'ProjectRec', id: arg.groupId }
      ]
    }),
  })
})

export const {
  useGetAllProjectsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useNewProjectMutation,
  useLeaveProjectMutation,
  useAddClientToProjectMutation,
  useAddProjPreferencesMutation,
  useAddSkillToProjectMutation,
  useRemoveClientFromProjectMutation,
  useRemoveGroupFromProjectMutation,
  useRemoveProjPreferencesMutation,
  useRemoveSkillFromProjectMutation,
  useGetProjectRecsQuery
} = projectsApiSlice

// returns the query result object
export const selectProjectsResult = projectsApiSlice.endpoints.getAllProjects.select()

// creates memoized selector
const selectProjectsData = createSelector(
    selectProjectsResult,
    projectsResult => projectsResult.data //normalized state object with ids & entities
)


// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllProjects,
  selectById: selectProjectById,
  selectIds: selectProjectIds
  // Pass in a selector that returns the Users slice of state
} = projectsAdapter.getSelectors(state => selectProjectsData(state) ?? initialState)
