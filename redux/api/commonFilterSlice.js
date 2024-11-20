// redux/api/commonFilterSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const commonFilterApi = createApi({
    reducerPath: 'commonFilterApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8000/api/common-filters',
        credentials: 'include',
      }), 
    tagTypes: ['CommonFilter'],
    endpoints: (builder) => ({
        getCommonFilters: builder.query({
            query: () => '',
            providesTags: ['CommonFilter'],
        }),
        createCommonFilter: builder.mutation({
            query: (filter) => ({
                url: '',
                method: 'POST',
                body: filter,
            }),
            invalidatesTags: ['CommonFilter'],
        }),
        updateCommonFilter: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: ['CommonFilter'],
        }),
        deleteCommonFilter: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CommonFilter'],
        }),
    }),
});

export const {
    useGetCommonFiltersQuery,
    useCreateCommonFilterMutation,
    useUpdateCommonFilterMutation,
    useDeleteCommonFilterMutation,
} = commonFilterApi;