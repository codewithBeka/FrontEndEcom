// src/api/brandSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const brandApi = createApi({
  reducerPath: 'brandApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/brands',
    credentials: 'include',
  }), 
  tagTypes: ['Brand'],
  endpoints: (builder) => ({
    createBrand: builder.mutation({
      query: (newBrand) => ({
        url: '/',
        method: 'POST',
        body: newBrand,
      }),
      // Optimistically update the local cache
      async onQueryStarted(newBrand, { dispatch, queryFulfilled }) {
        const id = Date.now(); // Temporary unique ID
        const patchResult = dispatch(
          brandApi.util.updateQueryData('getBrands', undefined, (draft) => {
            draft.push({ ...newBrand, _id: id }); // Assign temporary ID
          })
        );
    
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Brand'],
    }),
    getBrands: builder.query({
      query: ({ mainCategoryId = '', childCategoryId = '', subCategoryId = '' } = {}) => ({
        url: '/',
        params: {
          mainCategoryId,
          childCategoryId,
          subCategoryId,
        },
      }),
      providesTags: ['Brand'],
    }),
    getBrandById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['Brand'],
    }),
    updateBrand: builder.mutation({
      query: ({ id, ...updatedBrand }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: updatedBrand,
      }),
      // Optimistically update the local cache
      async onQueryStarted({ id, ...updatedBrand }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          brandApi.util.updateQueryData('getBrands', undefined, (draft) => {
            const brandIndex = draft.findIndex((brand) => brand._id === id);
            if (brandIndex !== -1) {
              draft[brandIndex] = { ...draft[brandIndex], ...updatedBrand }; // Update the brand
            }
          })
        );
        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch {
          patchResult.undo(); // Roll back on error
        }
      },
      invalidatesTags: ['Brand'],
    }),
    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      // Optimistically update the local cache
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          brandApi.util.updateQueryData('getBrands', undefined, (draft) => {
            const brandIndex = draft.findIndex((brand) => brand._id === id);
            if (brandIndex !== -1) {
              draft.splice(brandIndex, 1); // Remove the brand
            }
          })
        );
        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch {
          patchResult.undo(); // Roll back on error
        }
      },
      invalidatesTags: ['Brand'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useCreateBrandMutation,
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;