import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBNeedBwkLS_U0a048mZ233DSM-bMh789U",
  authDomain: "streamfusion-app.firebaseapp.com",
  databaseURL: "https://streamfusion-app-default-rtdb.firebaseio.com",
  projectId: "streamfusion-app",
  storageBucket: "streamfusion-app.firebasestorage.app",
  messagingSenderId: "1023470476009",
  appId: "1:1023470476009:web:f398cd8daf7cf55b782e78",
  measurementId: "G-35C7CJHLKB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics - only initialize if supported (avoids crashes in iframes/previews)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
