import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";

export const testAPI = createApi({
    reducerPath: 'testAPI',
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:8080/api'}),
    tagTypes: ['Test'],
    endpoints: (build) => ({
        fetchAllTest: build.query({
            query: () => ({
                url: `/test`
            }),
            providesTags: result => ['Test']
        }),
        updateTest: build.mutation({
            query: (test) => ({
                url: `/test/${test.name}`,
                method: 'PUT',
                body: test
            }),
            invalidatesTags: ['Test']
        })
    })
})