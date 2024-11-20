import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const couponApi = createApi({
  reducerPath: "couponApi",
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/coupon',
    credentials: 'include',
  }),   tagTypes: ["Coupon"],
  endpoints: (builder) => ({
    getCoupons: builder.query({
      query: () => "/",
      providesTags: ["Coupon"],
    }),
    createCoupon: builder.mutation({
      query: (couponData) => ({
        url: "/",
        method: "POST",
        body: couponData,
      }),
      invalidatesTags: ["Coupon"],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: ["Coupon"],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupon"],
    }),
    applyCoupon: builder.mutation({
      query: (data) => ({
        url: "/apply",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useApplyCouponMutation,
} = couponApi;