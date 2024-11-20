// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { apiSlice } from "./api/apiSlice"; // Assuming apiSlice is for other APIs
import { categoryApi } from "./api/categorySlice";
import authReducer from "./features/auth/authSlice";
import shopReducer from "../redux/features/shop/shopSlice";
import { productApi } from "./api/productsSlice";
import { filterApi } from "./api/filterSlice";
import { searchApi } from "./api/searchSlice";
import { mediaApi } from "./api/mediaSlice";
import { brandApi } from "./api/brandSlice";
import { commonFilterApi } from "./api/commonFilterSlice";
import addressApiSlice from "./api/addressApiSlice";
import wishlistApi from "./api/wishlistSlice"; // Correct import
import { cartApi } from "./api/cartSlice";
import { couponApi } from "./api/couponSlice";
import { ordersApi } from "./api/ordersSlice";
import { paymentsApi } from "./api/paymentsSlice";
import {notificationsApi} from "./api/notificationsApi"

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
        [filterApi.reducerPath]: filterApi.reducer,
        [searchApi.reducerPath]: searchApi.reducer,
        [mediaApi.reducerPath]: mediaApi.reducer,
        [brandApi.reducerPath]: brandApi.reducer,
        [commonFilterApi.reducerPath]: commonFilterApi.reducer,
        [addressApiSlice.reducerPath]: addressApiSlice.reducer,
        [wishlistApi.reducerPath]: wishlistApi.reducer, // Add wishlist reducer
        [cartApi.reducerPath]: cartApi.reducer, 
        [couponApi.reducerPath]: couponApi.reducer, 
        [ordersApi.reducerPath]: ordersApi.reducer,
        [paymentsApi.reducerPath]: paymentsApi.reducer,
        [notificationsApi.reducerPath]: notificationsApi.reducer,

        auth: authReducer,
        
        shop: shopReducer,
    },

 

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            apiSlice.middleware,
            categoryApi.middleware,
            productApi.middleware,
            filterApi.middleware,
            searchApi.middleware,
            mediaApi.middleware,
            brandApi.middleware,
            commonFilterApi.middleware,
            addressApiSlice.middleware,
            wishlistApi.middleware, 
            cartApi.middleware, 
            couponApi.middleware,
            ordersApi.middleware,
            paymentsApi.middleware,
            notificationsApi.middleware
        ),
    devTools: true,
});

setupListeners(store.dispatch);
export default store;