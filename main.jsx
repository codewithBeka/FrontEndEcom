import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from './redux/store.js';
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import OtpInput  from "./pages/auth/OtpInput";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/user/Profile";
import UpdatePassword from "./pages/user/UpdatePassword";
import UserList from "./pages/Admin/UserList";
import AdminRoute from "./pages/Admin/AdminRoute";
import CategoryList from "./pages/Admin/CategoryList";
import ProductList from "./pages/Admin/ProductList";
import AllProducts from "./pages/Admin/AllProducts";
import ProductUpdate from "./pages/Admin/ProductUpdate";
import Home from './pages/Home.jsx';
import Cart from "./pages/Cart.jsx";
import PaymentAddressForm from "./pages/PaymentAddressForm.jsx";
import Payment from "./pages/Payment.jsx";
import Success from "./pages/Success.jsx";
import CouponList from "./components/CouponList.jsx";
import AdminOrders from "./components/AdminOrders.jsx";
import AdminOrderDetail from "./components/AdminOrderDetail.jsx";
// import Shop from './pages/Shop.jsx';

import Shipping from "./pages/Orders/Shipping.jsx";
import PlaceOrder from "./pages/Orders/PlaceOrder.jsx";
import Order from "./pages/Orders/Order.jsx";
import OrderList from "./pages/Admin/OrderList.jsx";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import UserOrder from './pages/user/UserOrder.jsx';
import CategoryManager from './pages/Admin/CategoryManager.jsx';
import Shope from './components/Shope.jsx';
import SingleProduct from './components/SingleProduct.jsx';
import SearchedProducts from './components/SearchedProducts.jsx';
import FilterManagement from './components/FilterManagement.jsx';
import BrandManagement from './components/BrandManagement.jsx';
import CommonFilterManagement from './components/CommonFilterManagement.jsx';
import Wishlist from './components/Wishlist.jsx';
import UserOrders from './pages/user/UserOrders.jsx';
import OrderDetails from './pages/user/OrderDetails.jsx';
import UserWallet from './pages/user/UserWallet.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
  <Route path="/" element={<App />}>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Signup />} />
    <Route path="/verify-otp" element={<OtpInput  />} />
      <Route index={true} path="/" element={<Home />} />
      {/* <Route path="/product/:id" element={<ProductDetails />} /> */}
      <Route path="/wishlist" element={<Wishlist  />} />
      <Route path="/cart" element={<Cart />} />
      {/* <Route path="/shop" element={<Shop />} />  */}
      <Route path="/search" element={<SearchedProducts />} /> {/* New route for search */}
        <Route path="/products/:mainCategoryId/:childCategoryId?/:subCategoryId?" element={<Shope />} />  
        <Route path="/productdetail/:id" element={<SingleProduct />} />

      {/* Registered users */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/password" element={<UpdatePassword />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/user-orders" element={<UserOrder />} />
        <Route path="/order/:id" element={<Order />} />
        <Route path="/address" element={<PaymentAddressForm />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
        <Route path="/catagory" element={<CategoryManager />} />
        <Route path="/brand" element={<BrandManagement />} />
        <Route path="/filter" element={<FilterManagement />} /> 
        <Route path="/coupon" element={<CouponList />} /> 
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
        <Route path="/commonFilter" element={<CommonFilterManagement />} /> 
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/wallet" element={<UserWallet  />} />

      </Route>

      <Route path="/admin" element={<AdminRoute />}>
        <Route path="userlist" element={<UserList />} />
        <Route path="categorylist" element={<CategoryList />} />
        <Route path="productlist" element={<ProductList />} />
        <Route path="allproductslist" element={<AllProducts />} />
        <Route path="productlist/:pageNumber" element={<ProductList />} />
        <Route path="product/update/:_id" element={<ProductUpdate />} />
        <Route path="orderlist" element={<OrderList />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="catagory" element={<CategoryManager />} />
      </Route>
    </Route>
  )
);
const stripePromise = loadStripe('pk_test_51QDlQuKa4vILqbafkjFTzpmHvNhLz4poYlN9FFBPCdWSRv5MstY9pKtOoARfqeH9OX2Wm1202vakqnivgHHiGoDm00KuWo4ydS'); // Replace with your actual Stripe public key

console.log("working",stripePromise)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PayPalScriptProvider>
        <Elements stripe={stripePromise}>
          <RouterProvider router={router} />
        </Elements>
      </PayPalScriptProvider>
    </Provider>
  </StrictMode>,
);