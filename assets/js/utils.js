
export const LINE_LINK = "https://line.me/R/ti/p/@YOUR_LINE_ID";

export async function loadJSON(path){
  const url = `${path}?v=${Date.now()}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Load failed: ${path}`);
  return res.json();
}

export async function sha256Hex(str){
  const data = new TextEncoder().encode(str.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export function q(sel, root=document){ return root.querySelector(sel); }
export function qa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

export function fmtPrice(v){ return new Intl.NumberFormat('th-TH', {style:'currency', currency:'THB'}).format(v); }
