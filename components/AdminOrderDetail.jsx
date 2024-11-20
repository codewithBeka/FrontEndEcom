import React,{useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { useGetOrderByIdQuery, useDeleteOrderMutation } from '../redux/api/ordersSlice';
import axios from 'axios';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(id);
  console.log("orderId",id)
  console.log("order",order)
  const [deleteOrder] = useDeleteOrderMutation();
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


  if (isLoading) return <div className="text-center py-10">Loading order details...</div>;
  if (isError) return <div className="text-center py-10">Failed to load order details.</div>;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteOrder(id);
      // Optionally, redirect or show a success message
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-black shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold">Order Information</h2>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>User:</strong> {order.userId.username}</p>
          <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold">Payment Information</h2>
          <p><strong>Method:</strong> {order.paymentInfo.method}</p>
          <p><strong>Transaction ID:</strong> {order.paymentInfo.transactionId || 'N/A'}</p>
          <p><strong>Amount:</strong> ${order.paymentInfo.amount.toFixed(2)}</p>
          <p><strong>Status:</strong> {order.paymentInfo.status}</p>
          <p><strong>Payment Date:</strong> {new Date(order.paymentInfo.paymentDate).toLocaleDateString()}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold">Shipping Information</h2>
          <p><strong>Address:</strong> {order.shippingInfo.address.streetAddress}, {order.shippingInfo.address.city}, {order.shippingInfo.address.state} {order.shippingInfo.address.zipCode}, {order.shippingInfo.address.country}</p>
          <p><strong>Shipping Method:</strong> {order.shippingInfo.shippingMethod}</p>
          <p><strong>Shipping Cost:</strong> ${order.shippingInfo.shippingCost.toFixed(2)}</p>
          <p><strong>Shipped Date:</strong> {order.shippingInfo.shippedDate ? new Date(order.shippingInfo.shippedDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Expected Delivery:</strong> {order.shippingInfo.expectedDeliveryDate ? new Date(order.shippingInfo.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold">Order Items</h2>
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
      <button
        onClick={handleDelete}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Delete Order
      </button>
    </div>
  );
};

export default AdminOrderDetail;