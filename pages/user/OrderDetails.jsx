import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../../redux/api/ordersSlice';
import { useSelector } from 'react-redux';
import axios from 'axios';

const OrderDetails = () => {
  const { id } = useParams();
  const userInfo = useSelector((state) => state.auth.userInfo);
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(id);

  const [products, setProducts] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorFetchingProducts, setErrorFetchingProducts] = useState(null);

  useEffect(() => {
    if (order && order.items.length) {
      const productIds = order.items.map(item => item.productId);
      fetchProducts(productIds);
    }
  }, [order]);

  const fetchProducts = async (productIds) => {
    setLoadingProducts(true);
    setErrorFetchingProducts(null);

    try {
      const responses = await Promise.all(
        productIds.map(productId => 
          axios.get(`/api/products/${productId}`)
        )
      );

      const newProducts = {};
      responses.forEach(response => {
        const productsData = response.data.products;
        if (Array.isArray(productsData)) {
          productsData.forEach(product => {
            if (product && product._id) {
              newProducts[product._id] = product;
            } else {
              console.error('Unexpected product data structure:', product);
            }
          });
        } else {
          console.error('Expected products to be an array:', productsData);
        }
      });

      setProducts(newProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrorFetchingProducts('Failed to load products.');
    } finally {
      setLoadingProducts(false);
    }
  };

  if (isLoading || loadingProducts) return <div className="text-center py-10">Loading order details...</div>;
  if (isError || errorFetchingProducts) return <div className="text-center py-10">Failed to load order details.</div>;
  if (!order) return <div className="text-center py-10">Order not found.</div>;

  const getPaymentStatusColor = (status) => {
    return status === 'Paid' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="max-w-screen-xl mx-auto my-10">
      <div className="bg-black shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Order Details</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Order Information</h2>
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
            <p className={getPaymentStatusColor(order.paymentInfo.status)}>
              <strong>Payment Status:</strong> {order.paymentInfo.status}
            </p>
            <p><strong>Payment Method:</strong> {order.paymentInfo.method}</p>
            <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Shipping Information</h2>
            <p><strong>Name:</strong> {order.shippingInfo.address.firstName} {order.shippingInfo.address.lastName}</p>
            <p><strong>Address:</strong> {order.shippingInfo.address.streetAddress}, {order.shippingInfo.address.city}</p>
            <p><strong>Shipping Method:</strong> {order.shippingInfo.shippingMethod}</p>
            <p><strong>Shipping Cost:</strong> ${order.shippingInfo.shippingCost.toFixed(2)}</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {order.items.map((item) => {
            const product = products[item.productId];
            return (
              <div key={item.productId} className="bg-black p-4 rounded-lg">
                {product && (
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex items-start">
                      {product.media[0]?.url && (
                        <img src={product.media[0].url} alt={product.name} className="w-24 h-24 object-contain mr-4" />
                      )}
                      <div>
                        <p><strong>Brand:</strong> {product.brand.values[0] || 'N/A'}</p>
                        <p><strong>Category:</strong> {product.mainCategory?.name || 'N/A'}</p>
                        <p><strong>Condition:</strong> {product.condition || 'N/A'}</p>
                        {product.discounts.length > 0 && (
                          <p><strong>Discount:</strong> {product.discounts[0].discount}%</p>
                        )}
                        <p><strong>In Stock:</strong> {product.countInStock}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;