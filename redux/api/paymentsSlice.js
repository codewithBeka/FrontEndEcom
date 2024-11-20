import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const paymentsApi = createApi({
    reducerPath: 'paymentsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8000/api',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        createPaymentIntent: builder.mutation({
            query: (payment) => ({
                url: '/payments/stripe',
                method: 'POST',
                body: payment,
            }),
        }),
        createPaypalPayment: builder.mutation({
            query: (amount) => ({
                url: '/payments/paypal',
                method: 'POST',
                body: { amount },
            }),
        }),
        capturePaypalPayment: builder.mutation({
            query: (orderId) => ({
                url: '/payments/paypal/capture',
                method: 'POST',
                body: { orderId },
            }),
        }),
        confirmCodPayment: builder.mutation({
            query: (orderId) => ({
                url: '/payments/cod',
                method: 'POST',
                body: { orderId },
            }),
        }),
        confirmBankTransfer: builder.mutation({
            query: (orderId) => ({
                url: '/payments/bank-transfer',
                method: 'POST',
                body: { orderId },
            }),
        }),
        // New endpoint for Telebirr payment creation
        createTelebirrPayment: builder.mutation({
            query: (payment) => ({
                url: '/telebirr',
                method: 'POST',
                body: payment,
            }),
        }),
        // New endpoint for Telebirr payment confirmation
        confirmTelebirrPayment: builder.mutation({
            query: (orderId) => ({
                url: '/telebirr/confirm',
                method: 'POST',
                body: { orderId },
            }),
        }),
        fetchStripeKey: builder.query({
            query: () => '/stripe-key',
        }),
    }),
});

export const { 
    useCreatePaymentIntentMutation, 
    useCreatePaypalPaymentMutation, 
    useCapturePaypalPaymentMutation, 
    useConfirmCodPaymentMutation, 
    useConfirmBankTransferMutation,
    useCreateTelebirrPaymentMutation, // New hook for Telebirr payment
    useConfirmTelebirrPaymentMutation, // New hook for confirming Telebirr payment
    useFetchStripeKeyQuery 
} = paymentsApi;