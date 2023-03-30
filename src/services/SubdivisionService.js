import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

export const subdivisionAPI = createApi({
    reducerPath: 'subdivisionAPI',
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:8080/api'}),
    tagTypes: ['Subdivision'],
    endpoints: (build) => ({
        fetchAllAccesses: build.query({
            query: () => ({
                url: `/subdivision`
            }),
            providesTags: result => ['Subdivision']
        }),
        createAccess: build.mutation({
            query: (subdivision) => ({
                url: `/subdivision`,
                method: 'POST',
                body: subdivision
            }),
            invalidatesTags: ['Subdivision']
        }),
        updateAccess: build.mutation({
            query: (subdivision) => ({
                url: `/subdivision/${subdivision.id}`,
                method: 'PUT',
                body: subdivision
            }),
            invalidatesTags: ['Subdivision']
        }),
        deleteAccess: build.mutation({
            query: (subdivision) => ({
                url: `/subdivision/${subdivision.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Subdivision']
        }),
    })
});