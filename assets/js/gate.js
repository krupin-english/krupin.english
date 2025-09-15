// Content gating using access.json (email hashes)
import { loadJSON } from './utils.js';
import { auth, getEmailHash } from './auth.js';

export async function userHasAccess(courseId){
  const access = await loadJSON('data/access.json');
  const isLogged = auth.currentUser;
  if(!isLogged) return false;
  const hash = await getEmailHash(isLogged);
  const allowed = access?.courses?.[courseId]?.allow_email_hashes || [];
  return allowed.includes(hash);
}

export function onAuth(callback){
  // wrapper to wait auth state
  firebase.auth().onAuthStateChanged(callback);
}
