import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    getMainCategories: builder.query({
      query: () => '/categories',
    }),
    createMainCategory: builder.mutation({
      query: (newCategory) => ({
        url: '/categories',
        method: 'POST',
        body: newCategory,
      }),
      onQueryStarted: async (newCategory, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          categoryApi.util.updateQueryData('getMainCategories', undefined, (draft) => {
            draft.push(newCategory);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    updateMainCategory: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `categories/${id}`,
        method: 'PUT',
        body: patch,
      }),
      onQueryStarted: async ({ id, ...patch }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          categoryApi.util.updateQueryData('getMainCategories', undefined, (draft) => {
            const category = draft.find(cat => cat._id === id);
            if (category) {
              Object.assign(category, patch);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteMainCategory: builder.mutation({
      query: (id) => ({
        url: `categories/${id}`,
        method: 'DELETE',
      }),
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          categoryApi.util.updateQueryData('getMainCategories', undefined, (draft) => {
            return draft.filter(cat => cat._id !== id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    // Child Category Endpoints
    getChildCategories: builder.query({
      query: (mainCategoryId) => `child-categories/${mainCategoryId}`,
    }),
    createChildCategory: builder.mutation({
      query: ({ id, name, images }) => ({
          url: `child-categories/${id}/`,
          method: 'POST',
          body: { name, images }, // Include images in the body
      }),
      onQueryStarted: async ({ id, name }, { dispatch, queryFulfilled }) => {
          const patchResult = dispatch(
              categoryApi.util.updateQueryData('getChildCategories', id, (draft) => {
                  draft.push({ _id: Date.now(), name }); // Optimistically add the new child category
              })
          );
          try {
              await queryFulfilled;
          } catch {
              patchResult.undo();
          }
      },
  }),
    updateChildCategory: builder.mutation({
      query: ({ id, childId, ...patch }) => ({
        url: `child-categories/${id}/${childId}`,
        method: 'PUT',
        body: patch,
      }),
      onQueryStarted: async ({ id, childId, ...patch }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          categoryApi.util.updateQueryData('getChildCategories', id, (draft) => {
            const childCategory = draft.find(cat => cat._id === childId);
            if (childCategory) {
              Object.assign(childCategory, patch); // Update optimistically
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteChildCategory: builder.mutation({
      query: ({ id, childId }) => ({
        url: `child-categories/${id}/${childId}`,
        method: 'DELETE',
      }),
      onQueryStarted: async ({ id, childId }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          categoryApi.util.updateQueryData('getChildCategories', id, (draft) => {
            return draft.filter(cat => cat._id !== childId); // Remove optimistically
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    // Sub Category Endpoints
    getSubCategories: builder.query({
      query: ({ mainCategoryId, childCategoryId }) => `sub-categories/${childCategoryId}`,
    }),
    createSubCategory: builder.mutation({
      query: ({ id, childCategoryId, name, images }) => ({
          url: `sub-categories/${childCategoryId}/`,
          method: 'POST',
          body: { name, images }, // Include images in the body
      }),
      onQueryStarted: async ({ id, childCategoryId, name }, { dispatch, queryFulfilled }) => {
          const patchResult = dispatch(
              categoryApi.util.updateQueryData('getSubCategories', { mainCategoryId: id, childCategoryId }, (draft) => {
                  draft.push({ _id: Date.now(), name }); // Optimistically add the new sub-category
              })
          );
          try {
              await queryFulfilled;
          } catch {
              patchResult.undo();
          }
      },
  }),
    updateSubCategory: builder.mutation({
      query: ({ id, childCategoryId, subId, ...patch }) => ({
        url: `sub-categories/${id}/child/${childCategoryId}/${subId}`,
        method: 'PUT',
        body: patch,
      }),
      onQueryStarted: async ({ id, childCategoryId, subId, ...patch }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          categoryApi.util.updateQueryData('getSubCategories', { mainCategoryId: id, childCategoryId }, (draft) => {
            const subCategory = draft.find(cat => cat._id === subId);
            if (subCategory) {
              Object.assign(subCategory, patch); // Update optimistically
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteSubCategory: builder.mutation({
      query: ({ id, childCategoryId, subId }) => ({
        url: `sub-categories/${id}/child/${childCategoryId}/${subId}`,
        method: 'DELETE',
      }),
      onQueryStarted: async ({ id, childCategoryId, subId }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          categoryApi.util.updateQueryData('getSubCategories', { mainCategoryId: id, childCategoryId }, (draft) => {
            return draft.filter(cat => cat._id !== subId); // Remove optimistically
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetMainCategoriesQuery,
  useCreateMainCategoryMutation,
  useUpdateMainCategoryMutation,
  useDeleteMainCategoryMutation,
  useGetChildCategoriesQuery,
  useCreateChildCategoryMutation,
  useUpdateChildCategoryMutation,
  useDeleteChildCategoryMutation,
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
} = categoryApi;