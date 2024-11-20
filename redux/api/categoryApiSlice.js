import { apiSlice } from "./apiSlice";
import { CATEGORY_URL } from "../constants";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (newCategory) => ({
        url: `${CATEGORY_URL}`,
        method: "POST",
        body: newCategory,
      }),
      // Add the optimistic update
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            categoryApiSlice.util.updateQueryData("fetchCategories", undefined, (draft) => {
              draft.push(data);
            })
          );
        } catch {}
      },
    }),

    updateCategory: builder.mutation({
      query: ({ categoryId, updatedCategory }) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "PUT",
        body: updatedCategory,
      }),
      // Add the optimistic update
      async onQueryStarted({ categoryId, updatedCategory }, { dispatch, queryFulfilled }) {
        // Pessimistically update the cache to show the update
        dispatch(
          categoryApiSlice.util.updateQueryData("fetchCategories", undefined, (draft) => {
            const index = draft.findIndex((category) => category._id === categoryId);
            if (index !== -1) {
              draft[index] = { ...draft[index], ...updatedCategory };
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // If the mutation fails, undo the pessimistic update
          dispatch(
            categoryApiSlice.util.updateQueryData("fetchCategories", undefined, (draft) => {
              const index = draft.findIndex((category) => category._id === categoryId);
              if (index !== -1) {
                draft[index] = { ...draft[index], ...updatedCategory };
              }
            })
          );
        }
      },
    }),

    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "DELETE",
      }),
      // Add the optimistic update
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Pessimistically update the cache to remove the deleted category
        dispatch(
          categoryApiSlice.util.updateQueryData("fetchCategories", undefined, (draft) => {
            return draft.filter((category) => category._id !== arg);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // If the mutation fails, undo the pessimistic update
          dispatch(
            categoryApiSlice.util.updateQueryData("fetchCategories", undefined, (draft) => {
              const index = draft.findIndex((category) => category._id === arg);
              if (index !== -1) {
                draft.splice(index, 1, arg);
              }
            })
          );
        }
      },
    }),

    fetchCategories: builder.query({
      query: () => `${CATEGORY_URL}/categories`,
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} = categoryApiSlice;