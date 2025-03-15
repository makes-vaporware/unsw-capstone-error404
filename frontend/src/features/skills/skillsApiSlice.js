import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const skillsAdapter = createEntityAdapter({});

const initialStateSkills = skillsAdapter.getInitialState();

export const skillsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSkills: builder.query({
      query: () => "/skills",
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData) => {
        const loadedSkills = responseData.map((skill) => {
          skill.id = skill._id;
          return skill;
        });
        return skillsAdapter.setAll(initialStateSkills, loadedSkills);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Skill", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Skill", id })),
          ];
        } else return [{ type: "Skill", id: "LIST" }];
      },
    }),
    addSkillToUser: builder.mutation({
      query: (initialData) => ({
        url: `/skills/add`,
        method: "POST",
        body: { ...initialData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.id },//invalidate (one) user because their skills are different now. 
        { type: 'GroupRec', id: 'LIST'},
        { type: 'ProjectRec'},
        { type: 'UserSCP', id: arg.id },
        { type: 'GroupSCP' }
      ], 
    }),
    removeSkillFromUser: builder.mutation({
      query: (initialData) => ({
        url: `/skills/remove`,
        method: "POST",
        body: { ...initialData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.id},
        { type: 'GroupRec', id: 'LIST'},
        { type: 'ProjectRec'},
        { type: 'UserSCP', id: arg.id },
        { type: 'GroupSCP' }
      ],
    }),
    createSkill: builder.mutation({
      query: (initialData) => ({
        url: `/skills`,
        method: "POST",
        body: { ...initialData },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Skill", id: arg.id}
      ],
    }),
  }),
});

export const {
  useGetSkillsQuery,
  useAddSkillToUserMutation,
  useRemoveSkillFromUserMutation,
  useCreateSkillMutation,
} = skillsApiSlice;

// returns the query result object
export const selectSkillsResult = skillsApiSlice.endpoints.getSkills.select();

// creates memoized selector
const selectSkillsData = createSelector(
  selectSkillsResult,
  (skillsResult) => skillsResult.data //normalized state object with ids & entities
);

// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllSkills,
  selectById: selectSkillById,
  selectIds: selectSkillIds,
  // Pass in a selector that returns the Skills slice of state
} = skillsAdapter.getSelectors(
  (state) => selectSkillsData(state) ?? initialStateSkills
);
