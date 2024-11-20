// Import the Firebase scripts
importScripts(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
  );
  importScripts(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
  );
const firebaseConfig = {
    apiKey: "AIzaSyBxC6OpT9NIf33ZwON4l0vDrYdGYRL-Ab0",
    authDomain: "zenbile-d5332.firebaseapp.com",
    projectId: "zenbile-d5332",
    storageBucket: "zenbile-d5332.appspot.com",
    messagingSenderId: "300344160242",
    appId: "1:300344160242:web:af02ced483760e83df456b",
    measurementId: "G-R92SL0ZDNH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Log service worker installation
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
});

// Log service worker activation
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated.');
});

// Listen for background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png' // Change to your icon path
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Log if importScripts fails
self.addEventListener('error', (event) => {
    console.error('Error occurred in service worker:', event);
});

// Log when the service worker is fetched
self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);
});