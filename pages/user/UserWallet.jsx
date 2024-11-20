import React from 'react';
import { useSelector } from 'react-redux';
import { useGetUserWalletQuery } from '../../redux/api/usersApiSlice';
import { FaMoneyBillWave, FaClipboardCheck, FaRegClock, FaTrashAlt } from 'react-icons/fa';

const UserWallet = () => {
  const userInfo = useSelector(state => state.auth.userInfo);
  
  const { data: wallet, isLoading, isError, error } = useGetUserWalletQuery(userInfo?._id);

  if (isLoading) return <div className="text-center py-10 text-white">Loading wallet...</div>;
  if (isError) return <div className="text-center py-10 text-red-500">{error.message}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-800 shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-white">Your Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg flex items-center">
          <FaClipboardCheck className="text-green-400 mr-3" size={24} />
          <div>
            <h2 className="text-lg font-semibold text-gray-300">Total Orders</h2>
            <p className="text-xl font-bold text-white">{wallet.totalOrders || 0}</p>
          </div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg flex items-center">
          <FaMoneyBillWave className="text-yellow-400 mr-3" size={24} />
          <div>
            <h2 className="text-lg font-semibold text-gray-300">Total Spent</h2>
            <p className="text-xl font-bold text-white">${(wallet.totalSpent || 0).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg flex items-center">
          <FaRegClock className="text-blue-400 mr-3" size={24} />
          <div>
            <h2 className="text-lg font-semibold text-gray-300">Pending Orders</h2>
            <p className="text-xl font-bold text-white">{wallet.pendingOrders || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg flex items-center">
          <FaClipboardCheck className="text-blue-400 mr-3" size={24} />
          <div>
            <h2 className="text-lg font-semibold text-gray-300">Delivered Orders</h2>
            <p className="text-xl font-bold text-white">{wallet.deliveredOrders || 0}</p>
          </div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg flex items-center">
          <FaClipboardCheck className="text-red-400 mr-3" size={24} />
          <div>
            <h2 className="text-lg font-semibold text-gray-300">Canceled Orders</h2>
            <p className="text-xl font-bold text-white">{wallet.canceledOrders || 0}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-300 mb-4">Order History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallet.orderHistory.map(order => (
          <div key={order.orderId.toString()} className="bg-gray-700 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-200">Order ID: {order.orderId.toString()}</h3>
            <p className="text-gray-400">Status: {order.status}</p>
            <p className="text-gray-400">Amount: ${order.amount.toFixed(2)}</p>
            <p className="text-gray-400">Date: {new Date(order.date).toLocaleDateString()}</p>
            <button className="mt-2 text-red-500 hover:text-red-400">
              <FaTrashAlt className="inline mr-1" /> Cancel Order
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserWallet;