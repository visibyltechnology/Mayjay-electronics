import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCmPEV5pc_UD6GWzr2ckzTONMJxUrLtGR0",
  authDomain: "may-jay.firebaseapp.com",
  projectId: "may-jay",
  storageBucket: "may-jay.firebasestorage.app",
  messagingSenderId: "68028620717",
  appId: "1:68028620717:web:6bae05d955271da5e94b24",
  measurementId: "G-R1ZGBMFMZ3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
