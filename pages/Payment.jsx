import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useFetchCartQuery } from '../redux/api/cartSlice';
import { useGetAddressesQuery,useCreateAddressMutation  } from '../redux/api/addressApiSlice';
import { useCreateOrderMutation } from '../redux/api/ordersSlice';
import { useCreatePaymentIntentMutation, useCreateTelebirrPaymentMutation } from '../redux/api/paymentsSlice';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from 'react-hot-toast';
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const Payment = () => {
  const userInfo = useSelector(state => state.auth.userInfo);
  const { data: cartData, isLoading: loadingCart } = useFetchCartQuery();
  const { data: addresses = [], isLoading: loadingAddresses } = useGetAddressesQuery(userInfo?._id);
  const [createOrder] = useCreateOrderMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [createTelebirrPayment] = useCreateTelebirrPaymentMutation();

  console.log("cartData",cartData)

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({}); // State for new address
  const [isAddingAddress, setIsAddingAddress] = useState(false); // Track if adding a new address
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  if (loadingCart) return <div className="text-center py-10">Loading cart...</div>;
  if (!cartData || !cartData.items) return <div className="text-center py-10">No items in cart.</div>;

  const itemTotal  = cartData.items.reduce((sum, item) =>
    sum + (parseFloat(item.productId.price) || 0) * item.quantity, 0
  ) + (parseFloat(shippingCost) || 0);

  // Define tax and shipping
  const tax = itemTotal * 0.1; // 10% tax
  const shippingFee = 5.99; // Fixed shipping fee
  const totalAmount = parseFloat((itemTotal + tax + shippingFee).toFixed(2)); // Total amount including tax and shippi
  const handleCreateOrder = async (transactionId) => {
    setLoading(true);
    if (!selectedAddress) {
      toast.error("Please select or add a shipping address.");
      setLoading(false);
      return;
    }

    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast.error("Total amount must be a valid number greater than zero.");
      setLoading(false);
      return;
    }

    const itemsWithDetails = cartData.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: parseFloat(item.productId.price) || 0,
      totalPrice: (parseFloat(item.productId.price) * item.quantity)
    }));
    console.log("itemsWithDetails", itemsWithDetails)

    const orderData = {
      userId: userInfo?._id,
      items: itemsWithDetails,
      totalAmount: totalAmount,
      paymentInfo: {
        method: paymentMethod,
        transactionId: transactionId || null,
        amount: totalAmount,
        status: paymentMethod === 'Cash on Delivery' ? 'Unpaid' : 'Paid'
      },
      shippingInfo: {
        address: selectedAddress,
        shippingMethod: "Standard",
        shippingCost: shippingCost,
      },
    };

    try {
      const orderResponse = await createOrder(orderData).unwrap();
      console.log("Order Response:", orderResponse);
      toast.success("Order created successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.data?.message || "Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded.");
      setLoading(false);
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardCvcElement = elements.getElement(CardCvcElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);

    if (!cardNumberElement || !cardCvcElement || !cardExpiryElement) {
      toast.error("Payment form is not ready.");
      setLoading(false);
      return;
    }

    try {
      const { clientSecret } = await createPaymentIntent({ amount: totalAmount, paymentMethodTypes: ['card'] }).unwrap();
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: userInfo?.name || 'Customer',
          },
        }
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      await handleCreateOrder(paymentIntent.id);
      toast.success("Payment successful!");
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTelebirrPayment = async () => {
    setLoading(true);

    try {
      const telebirrResponse = await createTelebirrPayment({ 
        title: "Order Payment", 
        amount: totalAmount, 
        userId: userInfo?._id,
        items: cartData.items,
        shippingInfo: {
          address: selectedAddress,
          shippingMethod: "Standard",
          shippingCost: shippingCost,
        },
      }).unwrap();

      toast.success("Telebirr payment initiated! Please complete the transaction.");
      console.log("Telebirr Payment Response:", telebirrResponse);
    } catch (error) {
      console.error("Telebirr Payment Error:", error);
      toast.error("Failed to initiate Telebirr payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCashOnDelivery = async () => {
    await handleCreateOrder(); // Confirm the order without payment
    toast.success("Order confirmed for Cash on Delivery.");
  };

  const handleBankTransfer = async () => {
    await handleCreateOrder(); // Confirm the order without payment
    toast.success("Order confirmed for Bank Transfer.");
  };

  const handleAddAddress = async () => {
    try {
      const response = await createAddress(newAddress).unwrap();
      setSelectedAddress(response); // Automatically select the newly created address
      toast.success("Address added successfully!");
      setNewAddress({}); // Reset the new address state
      setIsAddingAddress(false); // Close the form
    } catch (error) {
      console.error(error);
      toast.error("Failed to add address. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Cart Items</h2>
        <ul className="border-b">
          {cartData.items.map(item => (
            <li key={item.productId._id} className="flex justify-between items-center py-4 border-b">
              <div className="flex items-center">
                <img
                  src={item.productId.media?.[0]?.url || 'placeholder-image-url'}
                  alt={item.productId.name}
                  className="h-16 w-16 object-cover mr-4"
                />
                <div>
                  <h2 className="text-lg">{item.productId.name}</h2>
                  <p className="text-gray-500">${(parseFloat(item.productId.price) || 0).toFixed(2)} each</p>
                </div>
              </div>
              <span className="font-semibold text-lg">
                ${(parseFloat(item.productId.price) * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        
        <div className="flex justify-between mt-4 font-bold">
        <span>Subtotal:</span>
        <span>${itemTotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between mt-4 font-bold">
        <span>Tax (10%):</span>
        <span>${tax.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between mt-4 font-bold">
        <span>Shipping Fee:</span>
        <span>${shippingFee.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between mt-4 font-bold">
          <span>Total Amount:</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>
 {/* Shipping Address Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Shipping Address</h2>
        {addresses.length > 0 ? (
          <div>
            {addresses.map(address => (
              <div key={address._id} className="flex items-center mb-2">
                <input
                  type="radio"
                  name="address"
                  className="mr-2"
                  checked={selectedAddress?._id === address._id}
                  onChange={() => setSelectedAddress(address)}
                />
                <label>{`${address.firstName} ${address.lastName}, ${address.streetAddress}, ${address.city}`}</label>
              </div>
            ))}
            <button
              onClick={() => setIsAddingAddress(true)}
              className="text-blue-500"
            >
              Add a New Address
            </button>
          </div>
        ) : (
          <div>No addresses found. <button onClick={() => setIsAddingAddress(true)} className="text-blue-500">Add Address</button></div>
        )}
      </div>

      {/* New Address Form */}
      {isAddingAddress && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold">New Address</h3>
          <input
            type="text"
            placeholder="First Name"
            value={newAddress.firstName || ''}
            onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={newAddress.lastName || ''}
            onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Street Address"
            value={newAddress.streetAddress || ''}
            onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Street Address 2"
            value={newAddress.streetAddress2 || ''}
            onChange={(e) => setNewAddress({ ...newAddress, streetAddress2: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="City"
            value={newAddress.city || ''}
            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="State"
            value={newAddress.state || ''}
            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Zip Code"
            value={newAddress.zipCode || ''}
            onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Country"
            value={newAddress.country || ''}
            onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Country Code"
            value={newAddress.countryCode || ''}
            onChange={(e) => setNewAddress({ ...newAddress, countryCode: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={newAddress.phoneNumber || ''}
            onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <button
            onClick={handleAddAddress}
            className="mt-4 w-full p-2 rounded bg-blue-500 text-white"
          >
            Add Address
          </button>
          <button
            onClick={() => setIsAddingAddress(false)}
            className="mt-2 w-full p-2 rounded bg-gray-500 text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Payment Method Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Payment Method</h2>
        <div className="flex flex-col">
          {['Credit Card', 'PayPal', 'Cash on Delivery', 'Bank Transfer', 'Telebirr'].map(method => (
            <label key={method} className="flex items-center mb-2">
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method)}
                className="mr-2"
              />
              {method}
            </label>
          ))}
        </div>
      </div>

      {/* Payment Processing */}
      {paymentMethod === 'PayPal' ? (
        <PayPalScriptProvider options={{ "client-id": "AdCakenr7ogf9ikJ9bXEwzUbOrGHsMQoL6E-90P_2lI0SRmn2q0DBYRAWmMKCGush0XsOztTHDU01_84" }}>
          <PayPalButtons
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: totalAmount.toFixed(2),
                  },
                }],
              });
            }}
            onApprove={async (data, actions) => {
              const details = await actions.order.capture();
              await handleCreateOrder(details.id);
              toast.success("Payment successful!");
            }}
            onError={(err) => {
              console.error(err);
              toast.error("Payment failed. Please try again.");
            }}
          />
        </PayPalScriptProvider>
      ) : paymentMethod === 'Credit Card' ? (
        <form onSubmit={handleStripePayment}>
          <div className="mb-4">
            <label className="block text-gray-300">Card Number</label>
            <CardNumberElement
              className="border p-2 rounded w-full text-white bg-gray-800 border-gray-600"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Expiry Date</label>
            <CardExpiryElement
              className="border p-2 rounded w-full text-white bg-gray-800 border-gray-600"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">CVC</label>
            <CardCvcElement
              className="border p-2 rounded w-full text-white bg-gray-800 border-gray-600"
            />
          </div>
          <button
            type="submit"
            disabled={!stripe || loading}
            className={`mt-4 w-full p-2 rounded bg-blue-500 text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      ) : paymentMethod === 'Telebirr' ? (
        <button
          onClick={handleTelebirrPayment}
          disabled={loading}
          className={`w-full p-2 rounded bg-blue-500 text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Processing...' : 'Pay with Telebirr'}
        </button>
      ) : paymentMethod === 'Cash on Delivery' ? (
        <button
          onClick={handleCashOnDelivery}
          disabled={loading}
          className={`w-full p-2 rounded bg-blue-500 text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Processing...' : 'Confirm Order'}
        </button>
      ) : (
        <button
          onClick={handleBankTransfer}
          disabled={loading}
          className={`w-full p-2 rounded bg-blue-500 text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Processing...' : 'Confirm Bank Transfer'}
        </button>
      )}
    </div>
  );
};

export default Payment;