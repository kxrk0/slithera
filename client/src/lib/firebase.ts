import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDfZPNruYEj6dprqxK1NHPjMfOsdVZgwVA",
  authDomain: "slitheraa.firebaseapp.com",
  projectId: "slitheraa",
  storageBucket: "slitheraa.firebasestorage.app",
  messagingSenderId: "181697760839",
  appId: "1:181697760839:web:05ccb9ccb72d8bfa8a6b62"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
