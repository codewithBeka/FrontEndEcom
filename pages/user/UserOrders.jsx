import React from 'react';
import { useSelector } from 'react-redux';
import { useGetOrdersByUserIdQuery } from '../../redux/api/ordersSlice';
import { Link } from 'react-router-dom';

const UserOrders = () => {
  const userInfo = useSelector(state => state.auth.userInfo);
  const { data: orders, isLoading, isError } = useGetOrdersByUserIdQuery(userInfo?._id);

  if (isLoading) return <div className="text-center py-10">Loading orders...</div>;
  if (isError) return <div className="text-center py-10">Failed to load orders.</div>;

  // Sort orders by createdAt date (most recent first)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

  const getOrderStatusClass = (status) => {
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-black border">
          <thead>
            <tr>
              <th className="py-2 border-b text-left">Order ID</th>
              <th className="py-2 border-b text-left">Total Amount</th>
              <th className="py-2 border-b text-left">Payment Method</th>
              <th className="py-2 border-b text-left">Transaction ID</th>
              <th className="py-2 border-b text-left">Payment Status</th>
              <th className="py-2 border-b text-left">Order Status</th>
              <th className="py-2 border-b text-left">Date</th>
              <th className="py-2 border-b text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map(order => (
              <tr key={order._id} className="hover:bg-gray-800">
                <td className="py-2 border-b">{order._id}</td>
                <td className="py-2 border-b">${order.totalAmount.toFixed(2)}</td>
                <td className="py-2 border-b">{order.paymentInfo.method}</td>
                <td className="py-2 border-b">
                  {order.paymentInfo.status === 'Paid' ? order.paymentInfo.transactionId : 'N/A'}
                </td>
                <td className={`py-2 border-b ${getPaymentStatusClass(order.paymentInfo.status)}`}>
                  {order.paymentInfo.status}
                </td>
                <td className={`py-2 border-b ${getOrderStatusClass(order.status)}`}>
                  {order.status}
                </td>
                <td className="py-2 border-b">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="py-2 border-b">
                  <Link to={`/orders/${order._id}`} className="text-blue-500 hover:underline">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserOrders;