
// Firebase Auth init (no DB)
import { q, sha256Hex } from './utils.js';
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};
if(!window.firebase){
  console.error('Firebase SDK missing.');
}
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();

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

export async function getEmailHash(user){
  const email = user?.email || "";
  return email ? sha256Hex(email) : "";
}
