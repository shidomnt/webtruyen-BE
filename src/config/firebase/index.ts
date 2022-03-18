// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCP32rY6jv_iWOuCBe17UzlGKWfyb9XqwE",
  authDomain: "web-truyen-96861.firebaseapp.com",
  projectId: "web-truyen-96861",
  storageBucket: "web-truyen-96861.appspot.com",
  messagingSenderId: "235367822778",
  appId: "1:235367822778:web:ff84d1bd15ca36d9329983",
  measurementId: "G-R719S2GDP9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

export {
  db,
}
