import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const filterApi = createApi({
    reducerPath: 'filterApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8000/',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        getFilters: builder.query({
            query: () => 'api/filters',
        }),
        createFilter: builder.mutation({
            query: (newFilter) => ({
                url: 'api/filters',
                method: 'POST',
                body: newFilter,
            }),
            async onQueryStarted(newFilter, { dispatch, queryFulfilled }) {
                // Optimistically update the filters state
                const patchResult = dispatch(
                    filterApi.util.updateQueryData('getFilters', undefined, (draft) => {
                        draft.push(newFilter); // Append new filter optimistically
                    })
                );

                try {
                    // Wait for the actual mutation to be fulfilled
                    await queryFulfilled;
                } catch {
                    // If the mutation fails, undo the optimistic update
                    patchResult.undo();
                }
            },
        }),
        updateFilter: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `api/filters/${id}`,
                method: 'PUT',
                body: patch,
            }),
            async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
                // Optimistically update the filters state
                const patchResult = dispatch(
                    filterApi.util.updateQueryData('getFilters', undefined, (draft) => {
                        const filterIndex = draft.findIndex(filter => filter._id === id);
                        if (filterIndex >= 0) {
                            draft[filterIndex] = { ...draft[filterIndex], ...patch }; // Update filter
                        }
                    })
                );

                try {
                    // Wait for the actual mutation to be fulfilled
                    await queryFulfilled;
                } catch {
                    // If the mutation fails, undo the optimistic update
                    patchResult.undo();
                }
            },
        }),
        deleteFilter: builder.mutation({
            query: (id) => ({
                url: `api/filters/${id}`,
                method: 'DELETE',
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                // Optimistically update the filters state
                const patchResult = dispatch(
                    filterApi.util.updateQueryData('getFilters', undefined, (draft) => {
                        const filterIndex = draft.findIndex(filter => filter._id === id);
                        if (filterIndex >= 0) {
                            draft.splice(filterIndex, 1); // Remove filter
                        }
                    })
                );

                try {
                    // Wait for the actual mutation to be fulfilled
                    await queryFulfilled;
                } catch {
                    // If the mutation fails, undo the optimistic update
                    patchResult.undo();
                }
            },
        }),
    }),
});

// Export hooks for usage in functional components
export const {
    useGetFiltersQuery,
    useCreateFilterMutation,
    useUpdateFilterMutation,
    useDeleteFilterMutation,
} = filterApi;