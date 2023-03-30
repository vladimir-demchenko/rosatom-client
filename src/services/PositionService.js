import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

export const positionAPI = createApi({
    reducerPath: 'positionAPI',
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:8080/api'}),
    tagTypes: ['Position'],
    endpoints: (build) => ({
        fetchAllAccesses: build.query({
            query: () => ({
                url: `/position`
            }),
            providesTags: result => ['Position']
        }),
        createAccess: build.mutation({
            query: (position) => ({
                url: `/position`,
                method: 'POST',
                body: position
            }),
            invalidatesTags: ['Position']
        }),
        updateAccess: build.mutation({
            query: (position) => ({
                url: `/position/${position.id}`,
                method: 'PUT',
                body: position
            }),
            invalidatesTags: ['Position']
        }),
        deleteAccess: build.mutation({
            query: (position) => ({
                url: `/position/${position.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Position']
        }),
    })
});