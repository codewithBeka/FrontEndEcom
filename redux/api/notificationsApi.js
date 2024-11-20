import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the API slice
export const notificationsApi = createApi({
    reducerPath: 'notificationsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8000/api',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        // Fetch notifications for a user
        getNotifications: builder.query({
            query: (userId) => `notifications/${userId}`, // Adjust endpoint as necessary
        }),
        // Mark a notification as read
        markNotificationAsRead: builder.mutation({
            query: (notificationId) => ({
                url: `notifications/${notificationId}`, // Adjust endpoint as necessary
                method: 'PATCH',
            }),
            // Optimistic update
            async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    notificationsApi.util.updateQueryData('getAllNotifications', undefined, (draft) => {
                        const notification = draft.find((n) => n._id === notificationId);
                        if (notification) {
                            notification.status = 'read'; // Update the notification status optimistically
                        }
                    })
                );

                try {
                    await queryFulfilled; // Wait for the mutation to complete
                } catch {
                    patchResult.undo(); // If it fails, undo the optimistic update
                }
            },
        }),
        // Create a notification
        createNotification: builder.mutation({
            query: ({ userId, message, type }) => ({
                url: 'notifications', // Adjust endpoint for creating notifications
                method: 'POST',
                body: { userId, message, type },
            }),
        }),
        // Fetch all notifications for admin
        getAllNotifications: builder.query({
            query: () => `notifications`, // Adjust the endpoint as necessary
        }),
    }),
});

// Export the auto-generated hooks
export const {
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useCreateNotificationMutation,
    useGetAllNotificationsQuery,
} = notificationsApi;