import React, { useEffect, useState } from 'react';
import { messaging, onMessage, db } from '../firebase';
import { useGetAllNotificationsQuery, useMarkNotificationAsReadMutation } from '../redux/api/notificationsApi';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { data: allNotifications, error, isLoading } = useGetAllNotificationsQuery();
    const [markAsRead] = useMarkNotificationAsReadMutation();

    console.log("notifications",notifications)
    useEffect(() => {
        if (allNotifications) {
            setNotifications(allNotifications);
            setUnreadCount(allNotifications.filter(n => n.status === 'unread').length);
        }
    }, [allNotifications]);

    useEffect(() => {
        // Handle incoming messages
        onMessage(messaging, (payload) => {
            console.log('Message from firebase. ', payload);
            const newNotification = {
                id: payload.data.id,
                title: payload.notification.title,
                description: payload.notification.body,
                time: "Just now",
                status: 'unread',
            };
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });
    }, []);
    
useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000'); // Adjust URL as necessary

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'order') {
            const { _id, customerName, items, totalAmount } = message.data;

            const newNotification = {
                id: _id, // Unique order ID
                title: `New order from ${customerName}`, // More informative title
                description: `Order total: $${totalAmount.toFixed(2)} - Items: ${items.map(item => item.name).join(', ')}`, // Detailed description
                time: "Just now",
                status: 'unread',
            };
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1); // Increment unread count
        }
    };

    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };

    return () => {
        ws.close();
    };
}, []);

    const handleNotificationClick = async (notificationId) => {
         // Optimistically update unread count
         setUnreadCount((prev) => prev - 1); // Decrement immediately

        await markAsRead(notificationId);
        setNotifications((prev) => 
            prev.map((notification) => 
                notification.id === notificationId ? { ...notification, status: 'read' } : notification
            )
        );
    };

    const handleClearAll = () => {
        setNotifications([]); // Clear all notifications
        setUnreadCount(0);    // Reset unread count
    };

    const handleMarkAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => n.status === 'unread');
        for (const notification of unreadNotifications) {
            await markAsRead(notification._id); // Mark each unread notification as read
        }
        setNotifications((prev) => 
            prev.map((notification) => ({ ...notification, status: 'read' })) // Set all notifications to read
        );
        setUnreadCount(0); // Reset unread count to zero
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="relative font-[sans-serif] w-max mx-auto">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 flex items-center justify-center rounded-full text-white border-none outline-none bg-blue-600 hover:bg-blue-700"
            >
                <span className="relative">
                    <svg /* SVG code here */ />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
                            {unreadCount}
                        </span>
                    )}
                </span>
            </button>

            {isOpen && (
                <div className="absolute block right-0 shadow-lg bg-white py-4 z-[1000] min-w-full rounded-lg w-[410px] max-h-[500px] overflow-auto mt-2">
                    <div className="flex items-center justify-between px-4 mb-4">
                    <p className="text-xs text-blue-600 cursor-pointer" onClick={handleClearAll}>Clear all</p>
                    <p className="text-xs text-blue-600 cursor-pointer" onClick={handleMarkAllAsRead}>Mark as read</p>
                    </div>

                    <ul className="divide-y">
    {notifications.length > 0 ? (
        notifications.map((notification) => {
            console.log("single notification", notification); // Log the notification object
            return (
                <li key={notification._id} className="p-4 flex items-center hover:bg-gray-50 cursor-pointer" onClick={() => handleNotificationClick(notification._id)}>
                    <div className="ml-6">
                        <h3 className={`text-sm text-[#333] font-semibold ${notification.status === 'unread' ? 'font-bold' : ''}`}>
                            {notification.message} {/* Changed to access the message property */}
                        </h3>
                        <p className="text-xs text-gray-500 mt-2">{notification.description || 'No description available'}</p>
                        <p className="text-xs text-blue-600 leading-3 mt-2">{new Date(notification.createdAt).toLocaleString()}</p> {/* Displaying formatted date */}
                    </div>
                </li>
            );
        })
    ) : (
        <li className="p-4 text-gray-500">No notifications available.</li>
    )}
</ul>
                    <p className="text-xs px-4 mt-6 mb-4 inline-block text-blue-600 cursor-pointer">View all Notifications</p>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;