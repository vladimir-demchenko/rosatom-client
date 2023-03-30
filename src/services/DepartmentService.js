import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

export const departmentAPI = createApi({
    reducerPath: 'departmentAPI',
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:8080/api'}),
    tagTypes: ['Department'],
    endpoints: (build) => ({
        fetchAllAccesses: build.query({
            query: () => ({
                url: `/department`
            }),
            providesTags: result => ['Department']
        }),
        createAccess: build.mutation({
            query: (department) => ({
                url: `/department`,
                method: 'POST',
                body: department
            }),
            invalidatesTags: ['Department']
        }),
        updateAccess: build.mutation({
            query: (department) => ({
                url: `/department/${department.id}`,
                method: 'PUT',
                body: department
            }),
            invalidatesTags: ['Department']
        }),
        deleteAccess: build.mutation({
            query: (department) => ({
                url: `/department/${department.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Department']
        }),
    })
});