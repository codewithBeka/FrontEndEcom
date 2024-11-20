// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyA2CWmxcf4mpWqrpvhCwrcaWROqSry8VDo",
  authDomain: "zenbile-gebya.firebaseapp.com",
  projectId: "zenbile-gebya",
  storageBucket: "zenbile-gebya.firebasestorage.app",
  messagingSenderId: "981863023028",
  appId: "1:981863023028:web:71786b891ed77d244c32e1",
  measurementId: "G-FMKLB2EWG2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);
const db = getFirestore(app);

export { messaging, getToken, onMessage, db };