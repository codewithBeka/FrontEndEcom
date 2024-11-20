import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Navigation from "./pages/Auth/Navigation";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProductManager from "./components/ProductManager";
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db } from './firebase'; // Adjust import based on your structure
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';

function App() {
  useEffect(() => {

     // Register the service worker
     if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }

    const requestNotificationPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log("Notification permission granted.");
        await handleTokenRefresh();
      } else {
        console.error("Notification permission denied.");
      }
    };

    const handleTokenRefresh = async () => {
      try {
        const token = await getToken(messaging, { vapidKey: 'BCl61Lv9M675IxSb0gExA5Nt_srnXLXfj3A8rtjcSWFWkboNX_u8m5-_CXyK4dfWTbJ4HbcSSm8LxJwbBbhSSE0' });
        console.log('FCM Token:', token);

        if (token) {
          const tokenDocRef = doc(collection(db, 'tokens'), 'user-token');
          
          // Retrieve the existing token from Firestore
          const existingTokenDoc = await getDoc(tokenDocRef);
          const existingToken = existingTokenDoc.exists() ? existingTokenDoc.data().token : null;

          if (existingToken !== token) {
            await setDoc(tokenDocRef, { token }, { merge: true });
            console.log("Token saved to Firestore.");
          } else {
            console.log("Token has not changed, no update needed.");
          }
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };

    // Request notification permission
    requestNotificationPermission();

    // Handle incoming messages
    onMessage(messaging, (payload) => {
      console.log('Message received: ', payload);
      // Handle the notification display here
    });

    // Set up a listener to refresh token periodically
    const tokenRefreshInterval = setInterval(() => {
      console.log("Refreshing token...");
      handleTokenRefresh();
    }, 3600000); // Refresh every hour (3600000 ms)

    // Cleanup function
    return () => clearInterval(tokenRefreshInterval);
  }, []);

  return (
    <>
      <Toaster />
      {/* <Navigation /> */}
      <Navbar />
      <ProductManager />
      <main className="py-3">
        <Outlet />
      </main>
    </>
  );
}

export default App;