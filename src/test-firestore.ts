import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
const db = getFirestore(app);

async function test() {
  try {
    await setDoc(doc(db, 'students', 'STU2024001'), { test: true }, { merge: true });
    console.log("SUCCESS students");
  } catch(e) {
    console.error("FAIL students", e);
  }
}
test();
