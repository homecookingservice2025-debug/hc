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

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
  // Create a dummy app or handle gracefully
  app = { name: '[DEFAULT]', options: {}, automaticDataCollectionEnabled: false };
}
export const db = getFirestore(app as any, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app as any);
export const googleProvider = new GoogleAuthProvider();

// Critical: Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connected Successfully");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}
testConnection();
