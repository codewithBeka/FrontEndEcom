import React, { useState } from 'react';
import { useUpdateUserPasswordMutation } from '../../redux/api/usersApiSlice';
import { toast } from 'react-hot-toast';

const UpdatePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateUserPassword, { isLoading }] = useUpdateUserPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateUserPassword({ currentPassword, newPassword }).unwrap();
      toast.success('Password updated successfully!');
      // Optionally, clear the input fields
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to update password.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Update Password</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="border rounded w-full p-2"
            placeholder="Enter current password"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="border rounded w-full p-2"
            placeholder="Enter new password"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`bg-blue-500 text-white p-2 rounded w-full ${isLoading ? 'opacity-50' : ''}`}
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default UpdatePassword;