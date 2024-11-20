// src/components/AddressList.js
import React from 'react';
import { useGetAddressesQuery, useDeleteAddressMutation, useUpdateAddressMutation } from '../redux/api/addressApiSlice';
import AddressForm from './AddressForm';

const AddressList = ({ userId }) => {
  const { data: addresses, error, isLoading } = useGetAddressesQuery(userId);
  const [deleteAddress] = useDeleteAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [editingAddress, setEditingAddress] = React.useState(null);

  const handleDelete = async (addressId) => {
    await deleteAddress({ userId, addressId });
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
  };

  const handleUpdate = async (updatedAddress) => {
    await updateAddress({ userId, addressId: updatedAddress._id, address: updatedAddress }).unwrap();
    setEditingAddress(null); // Close the editing form after updating
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading addresses: {error.message}</p>;

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold mb-4">Your Addresses</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Street Address</th>
              <th className="py-2 px-4 border-b">City</th>
              <th className="py-2 px-4 border-b">State</th>
              <th className="py-2 px-4 border-b">ZIP Code</th>
              <th className="py-2 px-4 border-b">Country</th>
              <th className="py-2 px-4 border-b">Country Code</th>
              <th className="py-2 px-4 border-b">Phone Number</th>
              <th className="py-2 px-4 border-b">Primary</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address) => (
              <tr key={address._id} className="hover:bg-gray-100 text-gray-700">
                <td className="py-2 px-4 border-b">{`${address.firstName} ${address.lastName}`}</td>
                <td className="py-2 px-4 border-b">{address.streetAddress}</td>
                <td className="py-2 px-4 border-b">{address.city}</td>
                <td className="py-2 px-4 border-b">{address.state}</td>
                <td className="py-2 px-4 border-b">{address.zipCode}</td>
                <td className="py-2 px-4 border-b">{address.country}</td>
                <td className="py-2 px-4 border-b">{address.countryCode}</td>
                <td className="py-2 px-4 border-b">{address.phoneNumber}</td>
                <td className="py-2 px-4 border-b">{address.isPrimary ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Address Form for Updating */}
      {editingAddress && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Update Address</h3>
          <AddressForm userId={userId} address={editingAddress} onUpdate={handleUpdate} />
        </div>
      )}
    </div>
  );
};

export default AddressList;