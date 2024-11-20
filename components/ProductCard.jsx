import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useFetchWishlistQuery } from '../redux/api/wishlistSlice';
import { useAddToCartMutation, useFetchCartQuery } from '../redux/api/cartSlice'; // Import the cart API
import { toast } from 'react-hot-toast';

const ProductCard = ({ product, onClick }) => {
  const slidesCount = product.media ? product.media.length : 0;
  const enableLoop = slidesCount > 1;

  const { data: wishlist } = useFetchWishlistQuery();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation(); // Add to Cart mutation
  const [favoriteState, setFavoriteState] = useState(false);

  useEffect(() => {
    if (wishlist) {
      console.log('Fetched Wishlist:', wishlist);
      const isFavorited = wishlist.some(item => {
        console.log('Comparing:', item.productId._id, product._id); // Ensure you access _id from productId
        return item.productId._id === product._id; // Compare the correct IDs
      });
      console.log('Is Favorited:', isFavorited);
      setFavoriteState(isFavorited);
    }
  }, [wishlist, product._id]);

  const handleFavoriteToggle = async (event) => {
    event.stopPropagation();
    try {
      if (favoriteState) {
        await removeFromWishlist(product._id).unwrap();
        toast.success("Removed from wishlist!");
      } else {
        await addToWishlist(product._id).unwrap();
        toast.success("Added to wishlist!");
      }
      setFavoriteState(!favoriteState);
    } catch (error) {
      toast.error("Action failed. Please try again.");
    }
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      toast.error("This product is out of stock.");
      return;
    }

    const quantityToAdd = 1; // You can modify this to allow quantity selection
    if (quantityToAdd > product.stock) {
      toast.error(`Only ${product.stock} items available in stock.`);
      return;
    }

    try {
      await addToCart({ productId: product._id, quantity: quantityToAdd }).unwrap();
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const activeDiscount = product.discounts.find(
    (discount) =>
      new Date(discount.startTime) <= new Date() &&
      new Date(discount.endTime) >= new Date() &&
      discount.isActive
  );

  const formatDiscountPeriod = (startTime, endTime) => {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const diffInSeconds = (endDate - startDate) / 1000;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMonths > 0) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`;
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    } else {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="group cursor-pointer" onClick={() => onClick(product._id)}>
      <div className="relative aspect-h-1 aspect-w-1 w-full rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
        <button
          onClick={handleFavoriteToggle}
          className={`absolute cursor-pointer z-20 top-2 right-2 p-2 rounded-full ${favoriteState ? 'bg-red-500' : 'bg-white'} transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${favoriteState ? 'text-white' : 'text-gray-500'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>
        <Swiper
          modules={[Navigation, Pagination, Autoplay, A11y]}
          spaceBetween={10}
          pagination={{ clickable: true }}
          navigation
          loop={enableLoop}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
        >
          {product.media && product.media.length > 0 ? (
            product.media.map((mediaItem) => (
              <SwiperSlide key={mediaItem._id}>
                {mediaItem.type === 'image' ? (
                  <img
                    src={mediaItem.url}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : mediaItem.type === 'video' ? (
                  <video
                    controls
                    className="h-full w-full object-cover object-center"
                  >
                    <source src={mediaItem.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </SwiperSlide>
            ))
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-500">
              No media available
            </div>
          )}
        </Swiper>
      </div>
      <div className="mt-4">
        <h3 className="text-sm text-gray-700">{product.name}</h3>
        {activeDiscount ? (
          <div className="flex items-center">
            <p className="mt-1 text-lg font-medium text-gray-900">
              ${(product.price * (1 - activeDiscount.value / 100)).toFixed(2)}
            </p>
            <span className="ml-2 text-sm text-gray-500 line-through">
              ${product.price.toFixed(2)}
            </span>
            <span className="ml-2 text-sm text-green-500">
              {activeDiscount.type === 'percentage'
                ? `${activeDiscount.value}% off`
                : `$${activeDiscount.value} off`}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              ({formatDiscountPeriod(activeDiscount.startTime, activeDiscount.endTime)})
            </span>
          </div>
        ) : (
          <p className="mt-1 text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
        )}
        <button 
          onClick={handleAddToCart}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;