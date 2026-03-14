import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD-F3STa1-ufqKUsfbWMufbKSBQ_sk-49U",
  authDomain: "habitify-f9177.firebaseapp.com",
  projectId: "habitify-f9177",
  storageBucket: "habitify-f9177.firebasestorage.app",
  messagingSenderId: "943883950057",
  appId: "1:943883950057:web:31cfd28a69bed66be4dd78",
  measurementId: "G-DSQQGR7BNH"
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
