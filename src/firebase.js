// src/firebase.js
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5nB2VkRcG7Rhy_DsbPEstHKY_c6dJMvk",
  authDomain: "printingsol-9d9a5.firebaseapp.com",
  projectId: "printingsol-9d9a5",
  storageBucket: "printingsol-9d9a5.appspot.com",
  messagingSenderId: "440516264991",
  appId: "1:440516264991:web:f8e9eec3dccd8beb3c412a",
  measurementId: "G-M20ZFH5JZ4",
};

const app = firebase.apps.length
  ? firebase.app()
  : firebase.initializeApp(firebaseConfig);

export const auth = app.auth();
export const db = app.firestore();

// 🔹 export firebase namespace too
export { firebase };

export default app;
