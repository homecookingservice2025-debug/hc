import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Environment variable sources
// @ts-ignore
const env = import.meta.env || {};

// Default config object populated from AI Studio provisioned values
// and overrideable by environment variables for external deployments
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBxlR7jIj5QisqruT7wRRU6o9w8vugJ-bA",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "home-cooking-login-process.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "home-cooking-login-process",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "home-cooking-login-process.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "823207960408",
  appId: env.VITE_FIREBASE_APP_ID || "1:823207960408:web:a3b5ac3d7ef46075b28f2d",
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || "ai-studio-c8ecaf03-8d30-445c-81b9-b7639c206a04"
};

let app: any;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

// Safely initialize Firestore with fallback
export const db = (() => {
    try {
        if (!app) throw new Error("No Firebase App");
        return getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    } catch (e) {
        console.error("Firestore Initialization failed with project-specific ID, falling back to (default):", e);
        try {
            return getFirestore(app);
        } catch (e2) {
            console.error("Firestore Fatal Error:", e2);
            return {} as any; // Final fallback to avoid crash
        }
    }
})();

export const auth = (() => {
    try {
        if (!app) throw new Error("No Firebase App");
        return getAuth(app);
    } catch (e) {
        console.error("Auth Initialization Error:", e);
        return {} as any;
    }
})();

export const googleProvider = new GoogleAuthProvider();

// Manual test function if needed
export async function testConnection() {
  if (!app || !db) return;
  try {
    await getDocFromServer(doc(db, 'config', 'main'));
    console.log("Firebase Connected Successfully");
  } catch (error: any) {
    if (error.code === 'permission-denied') {
        console.log("Firebase connected (reachable).");
    } else {
        console.warn("Firebase test connection info:", error.message);
    }
  }
}
