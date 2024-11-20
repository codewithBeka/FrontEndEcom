import React, { useEffect } from 'react';
import { useGetAllOrdersQuery, useDeleteOrderMutation, useUpdateOrderStatusMutation } from '../redux/api/ordersSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import NotificationDropdown  from "./NotificationDropdown"

const AdminOrders = () => {
  const { data: orders,refetch, isLoading, isError } = useGetAllOrdersQuery();
  const [deleteOrder] = useDeleteOrderMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000'); // Adjust the URL as necessary

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'order') {
        toast.success(`New order created: ${message.data._id}`);
        refetch(); // Refetch orders to get the latest data
      }
    };

    return () => {
      ws.close();
    };
  }, [refetch]);

  if (isLoading) return <div className="text-center py-10">Loading orders...</div>;
  if (isError) return <div className="text-center py-10">Failed to load orders.</div>;

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteOrder(id);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    // Optimistically update the order status in the local state
    const updatedOrders = orders.map(order => 
      order._id === orderId ? { ...order, status: newStatus } : order
    );

    // Update the local state immediately
    // This may vary based on how you're managing state in your application
    // If using a state management library, you may want to trigger an update there

    try {
      await updateOrderStatus({ orderId, status: newStatus });
      toast.success(`Order Status changed to ${newStatus} successfully!`);
    } catch {
      // Optionally revert the optimistic update if the mutation fails
      toast.error("Failed to update order status.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-500';
      case 'Shipped':
        return 'text-blue-500';
      case 'Delivered':
        return 'text-green-500';
      case 'Cancelled':
        return 'text-red-500';
      case 'Returned':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'text-green-500';
      case 'Unpaid':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Sort orders by createdAt date, displaying recent orders first
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="max-w-12xl mx-auto p-6 bg-black shadow-md rounded-lg mt-10">
      <NotificationDropdown/>
      <h1 className="text-2xl font-bold mb-6">Admin Orders</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-black border">
          <thead>
            <tr>
              <th className="py-2 border-b text-left">Order ID</th>
              <th className="py-2 border-b text-left">User</th>
              <th className="py-2 border-b text-left">Total Amount</th>
              <th className="py-2 border-b text-left">Payment Amount</th>
              <th className="py-2 border-b text-left">Payment Date</th>
              <th className="py-2 border-b text-left">Transaction ID</th>
              <th className="py-2 border-b text-left">Payment Status</th>
              <th className="py-2 border-b text-left">Order Status</th>
              <th className="py-2 border-b text-left">Date</th>
              <th className="py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map(order => (
              <tr key={order._id} className="hover:bg-gray-800">
                <td className="py-2 border-b">{order._id}</td>
                <td className="py-2 border-b">{order.userId.username}</td>
                <td className="py-2 border-b">${order.totalAmount.toFixed(2)}</td>
                <td className="py-2 border-b">${order.paymentInfo.amount.toFixed(2)}</td>
                <td className="py-2 border-b">
                  {new Date(order.paymentInfo.paymentDate).toLocaleDateString()}
                </td>
                <td className="py-2 border-b">{order.paymentInfo.transactionId || 'N/A'}</td>
                <td className={`py-2 border-b ${getPaymentStatusClass(order.paymentInfo.status)}`}>
                  {order.paymentInfo.status}
                </td>
                <td className="py-2 border-b">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                    className={`border rounded p-1 ${getStatusClass(order.status)}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>
                </td>
                <td className="py-2 border-b">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="py-2 border-b">
                  <Link to={`/admin/orders/${order._id}`} className="text-blue-500 hover:underline">View</Link>
                  <button
                    className="ml-4 text-red-500 hover:underline"
                    onClick={() => handleDelete(order._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;