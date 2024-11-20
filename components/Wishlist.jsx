// components/Wishlist.js
import React from 'react';
import { useFetchWishlistQuery, useRemoveFromWishlistMutation } from '../redux/api/wishlistSlice';
import ProductCard from './ProductCard';

const Wishlist = () => {
    const { data: wishlist, error, isLoading } = useFetchWishlistQuery();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    console.log("wishlist",wishlist)

    const handleRemoveFromWishlist = (productId) => {
        removeFromWishlist(productId);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Your Wishlist</h1>
            <ul className="mt-4 space-y-4">
                {wishlist.length === 0 ? (
                    <p>No items in your wishlist.</p>
                ) : (
                    wishlist.map(item => (
                        <li key={item.productId} className="flex justify-between">
                            <ProductCard 
                                product={item.productId} 
                                onClick={() => handleRemoveFromWishlist(item.productId)} 
                                isFavorited={true} // Assume all items in the wishlist are favorited
                            />
                            <button
                                onClick={() => handleRemoveFromWishlist(item.productId)}
                                className="text-red-500 hover:text-red-700 ml-4"
                            >
                                Remove
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default Wishlist;