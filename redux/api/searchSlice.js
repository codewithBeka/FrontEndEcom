// src/redux/api/searchSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/",
    credentials: "include",
  }),  endpoints: (builder) => ({
    getSuggestions: builder.query({
      query: ({ userId, query }) => `search/suggestions/${userId}/${query}`,
    }),
    saveSearch: builder.mutation({
      query: (data) => ({
        url: 'search/save',
        method: 'POST',
        body: data,
      }),
    }),
    getSearchHistory: builder.query({
      query: (userId) => `search/history/${userId}`,
    }),
    removeSearch: builder.mutation({
      query: (data) => ({
        url: 'search/remove',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSuggestionsQuery,
  useSaveSearchMutation,
  useGetSearchHistoryQuery,
  useRemoveSearchMutation,
} = searchApi;