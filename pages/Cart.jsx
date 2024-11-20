import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetchCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from '../redux/api/cartSlice';
import { useApplyCouponMutation } from '../redux/api/couponSlice';
import { toast } from 'react-hot-toast';

const Cart = () => {
    const navigate = useNavigate();
    const { data: cartData, error, isLoading, refetch } = useFetchCartQuery();
    const [updateCartItem] = useUpdateCartItemMutation();
    const [removeFromCart] = useRemoveFromCartMutation();
    const [applyCoupon] = useApplyCouponMutation();
    
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading cart.</div>;

    const handleQuantityChange = async (productId, quantity, stock) => {
        if (quantity < 1) {
            toast.error("Quantity must be at least 1.");
            return;
        }

        if (quantity > stock) {
            toast.error(`Cannot add more than ${stock} items in stock.`);
            return;
        }

        try {
            await updateCartItem({ productId, quantity }).unwrap();
            toast.success("Cart updated successfully!");
            refetch();
        } catch {
            toast.error("Failed to update cart.");
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await removeFromCart(productId).unwrap();
            toast.success("Item removed from cart!");
            refetch();
        } catch {
            toast.error("Failed to remove item.");
        }
    };

    const calculateTotals = () => {
        const itemTotal = cartData.total || 0; // Fallback to 0 if cartData.total is undefined
        const tax = itemTotal * 0.1;
        const shippingFee = 5.99;
        const total = itemTotal + tax + shippingFee;

        return { itemTotal, tax, shippingFee, total };
    };

    const { itemTotal, tax, shippingFee, total } = calculateTotals();

    const handleApplyCoupon = async () => {


        try {
            const response = await applyCoupon({ couponCode }).unwrap();
            console.log("coupon response",response)
            setDiscountAmount(response.discountApplied); // Set the discount amount from the response
            toast.success("Coupon applied successfully!");
            refetch(); // Refresh cart data to ensure UI updates correctly
            console.log("cartdata",cartData)
        } catch (error) {
            if (error.status === 404) {
                toast.error("Invalid coupon code.");
            } else if (error.status === 400) {
                toast.error("Coupon is not valid or has already been applied.");
            } else {
                toast.error("Failed to apply coupon.");
            }
        }
    };

    const finalTotal = total - discountAmount; // Calculate the final total after discount

    return (
        <div className="max-w-4xl mx-auto p-6 bg-black shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
            {cartData.items?.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <ul>
                        {cartData.items.map((item) => (
                            <li key={item.productId._id} className="flex justify-between items-center border-b py-4">
                                <div className="flex items-center">
                                    <img
                                        src={item.productId.media?.[0]?.url || 'placeholder-image-url'}
                                        alt={item.productId.name}
                                        className="h-16 w-16 object-cover mr-4"
                                    />
                                    <div>
                                        <h2 className="text-lg">{item.productId.name}</h2>
                                        <p className="text-gray-500">${item.productId.price?.toFixed(2) || 0} each</p>
                                        <p className="text-gray-500">Added on: {new Date(item.addedAt).toLocaleDateString()}</p>
                                        <div className="flex items-center">
                                            <label className="mr-2">Quantity:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.productId._id, +e.target.value, item.productId.countInStock)}
                                                className="border rounded w-16 text-center"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveItem(item.productId._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6">
                        <h2 className="text-lg font-bold">Order Summary</h2>
                        <div className="flex justify-between mt-2">
                            <span>Item Total:</span>
                            <span>${itemTotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span>Tax (10%):</span>
                            <span>${tax?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span>Shipping Fee:</span>
                            <span>${shippingFee?.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between mt-2 text-green-500">
                                <span>Discount:</span>
                                <span>-${discountAmount?.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between mt-4 font-bold">
                            <span>Total:</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter coupon code"
                            className="border rounded w-1/2 p-2"
                        />
                        <button
                            onClick={handleApplyCoupon}
                            className="ml-2 bg-blue-500 text-white p-2 rounded"
                        >
                            Apply Coupon
                        </button>
                    </div>

                    {/* Checkout Button */}
                    <div className="mt-6">
                        <Link to="/payment">
                            <button className="bg-green-500 text-white p-2 rounded">
                                Checkout
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;