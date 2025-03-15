import { apiSlice } from "../../app/api/apiSlice";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    changeSiteRole: builder.mutation({
      query: (initialData) => ({
        url: `/admin/changesiterole`,
        method: "PATCH",
        body: { ...initialData },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User"}],
    }),
    changeCourseRole: builder.mutation({
      query: (initialData) => ({
        url: `/admin/changecourserole`,
        method: "PATCH",
        body: { ...initialData },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User"}, { type: "Course"}],
    }),
  }),
});

export const {
    useChangeSiteRoleMutation,
    useChangeCourseRoleMutation
} = adminApiSlice;
