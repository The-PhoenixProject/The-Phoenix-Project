// src/firebase.config.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQQlJL-KMI31i8vRiEFQql6JT-_FGsFCQ",
  authDomain: "phoenix-50531.firebaseapp.com",
  projectId: "phoenix-50531",
  storageBucket: "phoenix-50531.firebasestorage.app",
  messagingSenderId: "174596177061",
  appId: "1:174596177061:web:733455170f78e87c0f614c",
  measurementId: "G-JSCJ2ZBQ8L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const db = getFirestore(app); // مهم جدًا

export default app;