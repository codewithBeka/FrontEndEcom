import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-hot-toast';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/',
    credentials: 'include',
  }),
  tagTypes: ['Cart', 'CartCount'],
  endpoints: (builder) => ({
    addToCart: builder.mutation({
      query: (cartData) => ({
        url: '/cart',
        method: 'POST',
        body: cartData,
      }),
      // Optimistic update
      async onQueryStarted(cartData, { dispatch, queryFulfilled }) {
        const patchCartResult = dispatch(
          cartApi.util.updateQueryData('fetchCart', undefined, (draft) => {
            const existingItem = draft.items.find(item => item.productId === cartData.productId);
            if (existingItem) {
              existingItem.quantity += cartData.quantity; // Update quantity if the item already exists
            } else {
              draft.items.push({ ...cartData, quantity: cartData.quantity }); // Add new item to cart
            }
          })
        );

        const patchCartCountResult = dispatch(
          cartApi.util.updateQueryData('getCartCount', undefined, (draft) => {
            draft.count += cartData.quantity;
          })
        );

        try {
          await queryFulfilled; // Wait for the mutation to be fulfilled
          toast.success("Added to cart!");
        } catch {
          patchCartResult.undo(); // Rollback the optimistic update on failure
          patchCartCountResult.undo();
          toast.error("Failed to add to cart. Please try again.");
        }
      },
      invalidatesTags: ['Cart', 'CartCount'],
    }),
    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: '/cart',
        method: 'DELETE',
        body: { productId },
      }),
      // Optimistic update
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patchCartResult = dispatch(
          cartApi.util.updateQueryData('fetchCart', undefined, (draft) => {
            const itemIndex = draft.items.findIndex((item) => item.productId === productId);
            if (itemIndex !== -1) {
              draft.items.splice(itemIndex, 1);
            }
          })
        );

        const patchCartCountResult = dispatch(
          cartApi.util.updateQueryData('getCartCount', undefined, (draft) => {
            draft.count -= 1;
          })
        );

        try {
          await queryFulfilled; // Wait for the mutation to be fulfilled
          toast.success("Item removed from cart!");
        } catch {
          patchCartResult.undo(); // Rollback the optimistic update on failure
          patchCartCountResult.undo();
          toast.error("Failed to remove item from cart. Please try again.");
        }
      },
      invalidatesTags: ['Cart', 'CartCount'],
    }),
    updateCartItem: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: '/cart',
        method: 'PATCH',
        body: { productId, quantity },
      }),
      invalidatesTags: ['Cart', 'CartCount'],
    }),
    updateCartTotal: builder.mutation({
      query: (total) => ({
        url: '/cart/update-total', // New endpoint for updating total
        method: 'PATCH',
        body: { total },
      }),
      invalidatesTags: ['Cart'],
    }),
    fetchCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    getCartCount: builder.query({
      query: () => '/cart/count',
      providesTags: ['CartCount'],
    }),
  }),
});

export const {
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
  useFetchCartQuery,
  useGetCartCountQuery,
  useUpdateCartTotalMutation
} = cartApi;