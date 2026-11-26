
import { initializeApp, getApp, getApps } from 'firebase/app';

import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCjMSY-E_Cc3jd9qJM9gkKhgwg1w1pwG_g",
  authDomain: "studymate-93ffc.firebaseapp.com",
  projectId: "studymate-93ffc",
  storageBucket: "studymate-93ffc.firebasestorage.app",
  messagingSenderId: "965081008813",
  appId: "1:965081008813:web:2cbc46ee158e8bbea9d424",
  measurementId: "G-L6F8HCZJ1Y",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(
      ReactNativeAsyncStorage
    ),
  });
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

const db = getFirestore(app);

export { auth, db };
