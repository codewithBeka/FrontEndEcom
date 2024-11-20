// src/api/mediaSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/upload",
    credentials: "include",
  }),  endpoints: (builder) => ({
    uploadMedia: builder.mutation({
      query: (formData) => ({
        url: '/', // Update this to your upload endpoint
        method: 'POST',
        body: formData,
      }),
    }),
    deleteMedia: builder.mutation({
      query: ({ public_id, resource_type }) => ({ // Change publicId to public_id to match
        url: `/delete/${public_id}`, // Use public_id here
        method: 'DELETE',
        params: { resource_type },
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const { useUploadMediaMutation, useDeleteMediaMutation } = mediaApi;