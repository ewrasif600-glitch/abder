// dashboard/firebase-config.js

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCgJA67XUBtysxdEl_6tKl0Tebpr2zkbuw",
  authDomain: "abder-b11b9.firebaseapp.com",
  projectId: "abder-b11b9",
  storageBucket: "abder-b11b9.firebasestorage.app",
  messagingSenderId: "163440280492",
  appId: "1:163440280492:web:203a19b2dc0b79ab313009",
  measurementId: "G-SG3T0841FJ"
};


const app =
  initializeApp(firebaseConfig);


export const auth =
  getAuth(app);


export const googleProvider =
  new GoogleAuthProvider();


googleProvider.setCustomParameters({
  prompt: "select_account"
});


export {
  signInWithPopup,
  signOut,
  onAuthStateChanged
};