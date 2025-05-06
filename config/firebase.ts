// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { initializeAuth } from "firebase/auth";
// @ts-ignore
import { getReactNativePersistence } from "@firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9F9y0k5DNUjPzHdfKBZ4CCT5c5T3bTCo",
  authDomain: "bankmuscatanalyst.firebaseapp.com",
  projectId: "bankmuscatanalyst",
  storageBucket: "bankmuscatanalyst.firebasestorage.app",
  messagingSenderId: "5631140291",
  appId: "1:5631140291:web:eab1f00ebf85e16e53dd76",
  measurementId: "G-MTEWVSDZY6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const firestore = getFirestore(app);