import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials } from '../../features/auth/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3500',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token

      if (token) {
          headers.set("authorization", `Bearer ${token}`)
      }
      return headers
  }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  // args - request url, method, body
  // api - signal, dispatch, getState()
  // extraOptions - custom like {shout: true}

  let result = await baseQuery(args, api, extraOptions)

  // // If you want, handle other status codes, too
  if (result?.error?.status === 403 && result?.error?.data?.message === "Unauthorized") { // check login error, not other invalid access

      // send refresh token to get new access token 
      const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)

      if (refreshResult?.data) {
        // store the new token 
        api.dispatch(setCredentials({ ...refreshResult.data }))

        // retry original query with new access token
        result = await baseQuery(args, api, extraOptions)
      } else {
          if (refreshResult?.error?.status === 403) {
              refreshResult.error.data.message = "Your login has expired. "
          }
          return refreshResult
      }
  }
  return result
}


export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Course'],
  endpoints: builder => ({})
})