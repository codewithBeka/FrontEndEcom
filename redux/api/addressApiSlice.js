// src/redux/api/addressApiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const addressApiSlice = createApi({
  reducerPath: 'addressApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/users',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    createAddress: builder.mutation({
      query: (address) => ({
        url: '/addresses',
        method: 'POST',
        body: address,
      }),
      // Optimistic update
      async onQueryStarted(address, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          addressApiSlice.util.updateQueryData('getAddresses', address.userId, (draft) => {
            draft.push(address); // Add the new address to the draft state
          })
        );
        try {
          await queryFulfilled; // Wait for the mutation to be fulfilled
        } catch {
          patchResult.undo(); // Undo the optimistic update if it fails
        }
      },
    }),
    getAddresses: builder.query({
      query: (userId) => `/addresses/${userId}`,
    }),
    updateAddress: builder.mutation({
      query: ({ userId, addressId, address }) => ({
        url: `/addresses/${userId}/${addressId}`,
        method: 'PUT',
        body: address,
      }),
      // Optimistic update
      async onQueryStarted({ userId, addressId, address }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          addressApiSlice.util.updateQueryData('getAddresses', userId, (draft) => {
            const index = draft.findIndex((addr) => addr._id === addressId);
            if (index !== -1) {
              draft[index] = { ...draft[index], ...address }; // Merge the updated address
            }
          })
        );
        try {
          await queryFulfilled; // Wait for the mutation to be fulfilled
        } catch {
          patchResult.undo(); // Undo the optimistic update if it fails
        }
      },
    }),
    deleteAddress: builder.mutation({
      query: ({ userId, addressId }) => ({
        url: `/addresses/${userId}/${addressId}`,
        method: 'DELETE',
      }),
      // Optimistic update
      async onQueryStarted({ userId, addressId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          addressApiSlice.util.updateQueryData('getAddresses', userId, (draft) => {
            const index = draft.findIndex((addr) => addr._id === addressId);
            if (index !== -1) {
              draft.splice(index, 1); // Remove the address from the draft state
            }
          })
        );
        try {
          await queryFulfilled; // Wait for the mutation to be fulfilled
        } catch {
          patchResult.undo(); // Undo the optimistic update if it fails
        }
      },
    }),
  }),
});

export const {
  useCreateAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressApiSlice;

export default addressApiSlice;