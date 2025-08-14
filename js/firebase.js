import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDoc, doc, query, where, getDocs, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Substitua esta configuração pela sua!
const firebaseConfig = {
  apiKey: "AIzaSyB6QjT6unIVtkV3hx_qL9bg5oKW5WmJPkI",
  authDomain: "evento-fisica.firebaseapp.com",
  projectId: "evento-fisica",
  storageBucket: "evento-fisica.firebasestorage.app",
  messagingSenderId: "176515816340",
  appId: "1:176515816340:web:36b6290771605431b44d81",
  measurementId: "G-WG25RFFTS3"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta as funcionalidades
export { auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, db, collection, addDoc, getDoc, doc, query, where, getDocs, updateDoc, serverTimestamp };