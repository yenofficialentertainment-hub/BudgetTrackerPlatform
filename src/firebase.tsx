import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// PASTE YOUR FIREBASE CONFIG HERE (Galing sa Step 1)
const firebaseConfig = {
  apiKey: 'AIzaSyBhU5QxifStRW-MVr5nc8_XptSOlPIXAq0',
  authDomain: 'budgettrackerplatform.firebaseapp.com',
  projectId: 'budgettrackerplatform',
  storageBucket: 'budgettrackerplatform.firebasestorage.app',
  messagingSenderId: '89461482024',
  appId: '1:89461482024:web:f22dbe2bcf2272f72e4b1d',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Database
export const db = getFirestore(app);
