// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { initializeAuth, inMemoryPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyActZy-a9GrubpPaypHInOs-V3zJVFkYtw",
  authDomain: "pads-tinder-e6813.firebaseapp.com",
  projectId: "pads-tinder-e6813",
  storageBucket: "pads-tinder-e6813.firebasestorage.app",
  messagingSenderId: "745857673938",
  appId: "1:745857673938:web:b88f362f5e3cc6e47f1b0b",
  measurementId: "G-Z678076TN6",
};

const app = initializeApp(firebaseConfig);

// Firestore: auto long-polling helps React Native networks
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

// Auth: use in-memory persistence (no AsyncStorage needed)
export const auth = initializeAuth(app, {
  persistence: inMemoryPersistence,
});
