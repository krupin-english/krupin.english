// assets/js/auth.js
// Firebase Auth init (no DB)
import { q, sha256Hex } from './utils.js';

// === KruPin English — Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyA1AK6oKNi5de4ey2ccjvOrZgcnWhee2FE",
  authDomain: "krupin-english.firebaseapp.com",
  projectId: "krupin-english",
  appId: "1:889492145848:web:f4862567d2de256cf5164d",

  // (ไม่จำเป็นสำหรับระบบตอนนี้)
  // messagingSenderId: "889492145848",
  // measurementId: "G-TF82P38ZVC",
  // storageBucket: "krupin-english.appspot.com", // ใช้ Storage ค่อยเปิดบรรทัดนี้
};

if (!window.firebase) {
  console.error('Firebase SDK missing. Please include firebase-app-compat.js and firebase-auth-compat.js before this file.');
}

// ใช้ compat API ให้ตรงกับโปรเจ็กต์เดิม
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();

// --- Sign-in methods ---
export async function signInGoogle(){ 
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
}
export async function signInFacebook(){
  const provider = new firebase.auth.FacebookAuthProvider();
  return auth.signInWithPopup(provider);
}
export async function signInEmailPassword(email, password){
  return auth.signInWithEmailAndPassword(email, password);
}
export async function signUpEmailPassword(email, password){
  return auth.createUserWithEmailAndPassword(email, password);
}
export function signOut(){
  return auth.signOut();
}

// ใช้กับระบบล็อกเนื้อหาแบบแฮชอีเมล
export async function getEmailHash(user){
  const email = user?.email || "";
  return email ? sha256Hex(email) : "";
}
