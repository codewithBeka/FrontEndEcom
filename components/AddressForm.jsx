// src/components/AddressForm.js
import React, { useEffect, useState } from 'react';
import { useCreateAddressMutation, useUpdateAddressMutation } from '../redux/api/addressApiSlice';

const AddressForm = ({ userId, address, onUpdate }) => {
  const [createAddress] = useCreateAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    streetAddress2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    countryCode: '',
    phoneNumber: '',
  });

  // Effect to populate the form with existing address data when editing
  useEffect(() => {
    if (address) {
      setFormData({
        firstName: address.firstName,
        lastName: address.lastName,
        streetAddress: address.streetAddress,
        streetAddress2: address.streetAddress2 || '',
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        countryCode: address.countryCode,
        phoneNumber: address.phoneNumber,
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (address) {
      // Update existing address
      await updateAddress({ userId, addressId: address._id, address: formData });
      if (onUpdate) onUpdate(formData); // Call onUpdate if provided
    } else {
      // Create new address
      await createAddress({ userId, address: formData });
    }
    // Reset the form after submission
    setFormData({
      firstName: '',
      lastName: '',
      streetAddress: '',
      streetAddress2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      countryCode: '',
      phoneNumber: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded shadow-md">
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded"
        required
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded"
        required
      />
      <input
        type="text"
        name="streetAddress"
        placeholder="Street Address"
        value={formData.streetAddress}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded"
        required
      />
      <input
        type="text"
        name="streetAddress2"
        placeholder="Street Address 2 (optional)"
        value={formData.streetAddress2}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded"
      />
      <input
        type="text"
        name="city"
        placeholder="City"
        value={formData.city}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded"
        required
      />
      <input
        type="text"
        name="state"
        placeholder="State/Province/Region"
        value={formData.state}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded"
        required
      />
      <input
        type="text"
        name="zipCode"
        placeholder="ZIP Code"
        value={formData.zipCode}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded"
        required
      />
      <input
        type="text"
        name="country"
        placeholder="Country"
        value={formData.country}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded"
        required
      />
      <input
        type="text"
        name="countryCode"
        placeholder="Country Code (e.g., +1)"
        value={formData.countryCode}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded"
        required
      />
      <input
        type="text"
        name="phoneNumber"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded"
        required
      />
      <button
        type="submit"
        className="col-span-1 md:col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
      >
        {address ? 'Update Address' : 'Add Address'}
      </button>
    </form>
  );
};

export default AddressForm;