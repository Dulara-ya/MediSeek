// Guard: Vite/React apps sometimes hot-reload—avoid re-initializing.
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// === Your Firebase config ===
const firebaseConfig = {
    apiKey: "AIzaSyAq9IRrUwFPUxnHimLvI3i1tl-Ds3eUYNo",
    authDomain: "mediseek-b4b5b.firebaseapp.com",
    projectId: "mediseek-b4b5b",
    storageBucket: "mediseek-b4b5b.firebasestorage.app",
    messagingSenderId: "721922566254",
    appId: "1:721922566254:web:b2eb4b926ead5c9d5f5e7f",
    measurementId: "G-CT7W130FFV"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Optional analytics (no crash on SSR)
let analytics = null;
if (typeof window !== "undefined") {
    try {
        analyticsSupported().then((ok) => {
            if (ok) analytics = getAnalytics(app);
        });
    } catch {}
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, analytics, auth, db, storage, functions };