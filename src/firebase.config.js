// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIfRKXu5I3gURLEWqkiiJ9p-8ghG-WorA",
  authDomain: "house-marketplace-app-c4d70.firebaseapp.com",
  projectId: "house-marketplace-app-c4d70",
  storageBucket: "house-marketplace-app-c4d70.appspot.com",
  messagingSenderId: "581753489850",
  appId: "1:581753489850:web:668f2eb879ad2cf5bff583",
  measurementId: "G-0T1F05T2DM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export const db = getFirestore();
