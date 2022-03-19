"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const firebaseConfig = {
    apiKey: "AIzaSyCP32rY6jv_iWOuCBe17UzlGKWfyb9XqwE",
    authDomain: "web-truyen-96861.firebaseapp.com",
    projectId: "web-truyen-96861",
    storageBucket: "web-truyen-96861.appspot.com",
    messagingSenderId: "235367822778",
    appId: "1:235367822778:web:ff84d1bd15ca36d9329983",
    measurementId: "G-R719S2GDP9"
};
const app = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, firestore_1.getFirestore)(app);
exports.db = db;
