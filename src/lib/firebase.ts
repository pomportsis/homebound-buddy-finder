import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const missingRequiredFirebaseEnv = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
].filter((key) => !import.meta.env[key]);

export const firebaseEnvWarning =
  missingRequiredFirebaseEnv.length > 0
    ? `Missing Firebase env vars: ${missingRequiredFirebaseEnv.join(", ")}`
    : null;

if (firebaseEnvWarning) {
  console.error(`[Firebase Config] ${firebaseEnvWarning}. Check your hosting env settings and redeploy.`);
}

const safeFirebaseConfig =
  missingRequiredFirebaseEnv.length > 0
    ? {
        apiKey: firebaseConfig.apiKey || "missing-api-key",
        authDomain: firebaseConfig.authDomain || "missing-auth-domain",
        projectId: firebaseConfig.projectId || "missing-project-id",
        storageBucket: firebaseConfig.storageBucket || "missing-storage-bucket",
        messagingSenderId: firebaseConfig.messagingSenderId || "missing-messaging-sender-id",
        appId: firebaseConfig.appId || "missing-app-id",
        measurementId: firebaseConfig.measurementId,
      }
    : firebaseConfig;

const app = initializeApp(safeFirebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}
