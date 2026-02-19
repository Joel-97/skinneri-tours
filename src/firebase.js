// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzQawVMLLHPBOdbWcICmJeZVCvvMscFdU",
  authDomain: "skinneri-tours.firebaseapp.com",
  projectId: "skinneri-tours",
  storageBucket: "skinneri-tours.firebasestorage.app",
  messagingSenderId: "313051443955",
  appId: "1:313051443955:web:7d85575534a3c3d7187d86",
  measurementId: "G-3XSM9E7FGL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

