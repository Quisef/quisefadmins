// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAB-WbFZTQ8bfHA3W44Q9ithgDGWos1jss",
  authDomain: "quietshelter-b5f54.firebaseapp.com",
  projectId: "quietshelter-b5f54",
  storageBucket: "quietshelter-b5f54.firebasestorage.app",
  messagingSenderId: "964395764892",
  appId: "1:964395764892:web:8cb55955d6f4a92f08f159"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase instance');
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase Auth and Firestore initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { auth, db };