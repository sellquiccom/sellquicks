
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWH9xun1AvzZFWQOH1GqM2t1VyzRz75FE",
  authDomain: "sellquic.firebaseapp.com",
  projectId: "sellquic",
  storageBucket: "sellquic.firebasestorage.app",
  messagingSenderId: "162539089525",
  appId: "1:162539089525:web:5b6566781d6e5a97c7123c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
