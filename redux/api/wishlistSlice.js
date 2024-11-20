import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const wishlistApi = createApi({
    reducerPath: 'wishlistApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8000/api/users',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        fetchWishlist: builder.query({
            query: () => '/wishlist/user',
            providesTags: ['Wishlist'],
        }),
        fetchWishlistCount: builder.query({
            query: () => '/wishlist/count', // New endpoint for fetching wishlist count
            providesTags: ['WishlistCount'],
        }),
        addToWishlist: builder.mutation({
            query: (productId) => ({
                url: '/wishlist',
                method: 'POST',
                body: { productId },
            }),
            // Optimistically update the wishlist in the UI
            async onQueryStarted(productId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    wishlistApi.util.updateQueryData('fetchWishlist', undefined, (draft) => {
                        draft.push({ productId }); // Add the new product optimistically
                    })
                );

                try {
                    await queryFulfilled; // Wait for the actual query to resolve
                } catch {
                    patchResult.undo(); // If the query fails, revert the optimistic update
                }
            },
            // Invalidate the count tag to refresh the count
            invalidatesTags: ['WishlistCount'],
        }),
        removeFromWishlist: builder.mutation({
            query: (productId) => ({
                url: `/wishlist/${productId}`,
                method: 'DELETE',
            }),
            // Optimistically update the wishlist in the UI
            async onQueryStarted(productId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    wishlistApi.util.updateQueryData('fetchWishlist', undefined, (draft) => {
                        const index = draft.findIndex(item => item.productId === productId);
                        if (index !== -1) {
                            draft.splice(index, 1); // Remove the product optimistically
                        }
                    })
                );

                try {
                    await queryFulfilled; // Wait for the actual query to resolve
                } catch {
                    patchResult.undo(); // If the query fails, revert the optimistic update
                }
            },
            // Invalidate the count tag to refresh the count
            invalidatesTags: ['WishlistCount'],
        }),
    }),
});

// Export hooks for using the queries and mutations in components
export const {
    useFetchWishlistQuery,
    useFetchWishlistCountQuery, // Export the new hook for wishlist count
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} = wishlistApi;

// ** Export the api slice here **
export default wishlistApi;