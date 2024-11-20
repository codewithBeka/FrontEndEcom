import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ordersApi = createApi({
    reducerPath: 'ordersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8000/api',
        credentials: 'include',
      }),     endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (order) => ({
                url: '/orders',
                method: 'POST',
                body: order,
            }),
        }),
        updateOrderStatus: builder.mutation({
            query: ({ orderId, status, paymentInfo }) => ({
                url: `/orders/${orderId}/status`, // Use orderId here
                method: 'PUT',
                body: { orderId, status, paymentInfo }, // Include paymentInfo in the body
            }),
        }),
        getAllOrders: builder.query({
            query: () => '/orders',
        }),
        getOrderById: builder.query({
            query: (id) => `/orders/${id}`,
        }),
        getOrdersByUserId: builder.query({
            query: (userId) => `/orders/user/${userId}`,
        }),
        deleteOrder: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}`,
                method: 'DELETE',
            }),
        }),
        updateOrderHistory: builder.mutation({
            query: (history) => ({
                url: '/orders/history',
                method: 'PUT',
                body: history,
            }),
        }),
    }),
});

export const { 
    useCreateOrderMutation, 
    useUpdateOrderStatusMutation, 
    useGetAllOrdersQuery, 
    useGetOrderByIdQuery, 
    useGetOrdersByUserIdQuery, 
    useDeleteOrderMutation, 
    useUpdateOrderHistoryMutation 
} = ordersApi;