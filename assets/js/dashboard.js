
import { loadJSON } from './utils.js';
import { auth } from './auth.js';

async function listAccessible(){
  const holder = document.getElementById('dashWrap');
  const user = auth.currentUser;
  if(!user){ holder.innerHTML = '<div class="alert alert-warning">กรุณาเข้าสู่ระบบก่อน</div>'; return; }

  // compute hash in the same way as gate.js exports
  const sha256Hex = async (str)=>{
    const data = new TextEncoder().encode(str.trim().toLowerCase());
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  };
  const myHash = await sha256Hex(user.email||'');

  const [courses, access] = await Promise.all([
    loadJSON('data/courses.json'),
    loadJSON('data/access.json')
  ]);
  const list = (courses.list||[]).filter(c=>{
    const allowed = access?.courses?.[c.id]?.allow_email_hashes || [];
    return allowed.includes(myHash);
  });

  if(!list.length){
    holder.innerHTML = '<div class="alert alert-info">บัญชีของคุณยังไม่มีคอร์สที่ได้รับสิทธิ์</div>';
    return;
  }

  const row = document.createElement('div'); row.className='row row-cols-1 row-cols-md-3 g-3';
  list.forEach(c=>{
    const col = document.createElement('div'); col.className='col';
    col.innerHTML = `
      <div class="card h-100 hover">
        <img src="${c.cover}" class="card-img-top" alt="${c.title}" loading="lazy">
        <div class="card-body">
          <span class="badge text-bg-light">${c.level||'ทุกระดับ'}</span>
          <h5 class="mt-2">${c.title}</h5>
          <p class="text-muted">${c.short||''}</p>
          <a class="btn btn-brand btn-sm" href="course.html?id=${c.id}">เปิดคอร์ส</a>
        </div>
      </div>`;
    row.appendChild(col);
  });
  holder.innerHTML = '';
  holder.appendChild(row);
}

window.addEventListener('DOMContentLoaded', ()=>{
  firebase.auth().onAuthStateChanged(()=> listAccessible());
});
