// Import Firebase core
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Import services you want to use
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config (as provided)
const firebaseConfig = {
  apiKey: "AIzaSyBpwtANMCtL4-4OeHDpcP1_NPQx62qwDnE",
  authDomain: "nea-assist-20545.firebaseapp.com",
  projectId: "nea-assist-20545",
  storageBucket: "nea-assist-20545.firebasestorage.app",
  messagingSenderId: "1054747002414",
  appId: "1:1054747002414:web:b854df6443f240b6da01bf",
  measurementId: "G-9KGYEFBHT5"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);       // Firestore DB
const storage = getStorage(app);    // Storage
const analytics = getAnalytics(app);  // Analytics
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Export services to use in your components
export { db, storage, analytics };
