import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtmPJx-xQqY3DMgSkBe_M7mt4Vz4I2LE4",
  authDomain: "studentsync-7b6d9.firebaseapp.com",
  projectId: "studentsync-7b6d9",
  storageBucket: "studentsync-7b6d9.firebasestorage.app",
  messagingSenderId: "1008258304553",
  appId: "1:1008258304553:web:375e0b0a54282edf756a38",
  measurementId: "G-02SGZ8KJ0F"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Keep users logged in across browser sessions
setPersistence(auth, browserLocalPersistence);

export const db = getFirestore(app);
export default app;
