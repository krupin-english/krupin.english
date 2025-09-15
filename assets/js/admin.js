// Minimal admin (no DB): edit JSON in-memory, export as files or .zip
import { loadJSON, q, sha256Hex } from './utils.js';
import { auth } from './auth.js';

let courses = null, access = null, seo = null, site = null, admins = null;

async function ensureAdmin(){
  admins = await loadJSON('data/admins.json').catch(()=>({emails_hash:[]}));
  return new Promise((resolve)=>{
    firebase.auth().onAuthStateChanged(async (user)=>{
      if(!user){ resolve(false); return; }
      const h = await sha256Hex(user.email||"");
      const ok = (admins.emails_hash||[]).includes(h);
      resolve(ok);
    });
  });
}

function renderCoursesTable(){
  const tbody = q('#coursesTbody');
  tbody.innerHTML = '';
  (courses.list||[]).forEach((c, idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input class="form-control form-control-sm" value="${c.id}" data-k="id" data-i="${idx}"/></td>
      <td><input class="form-control form-control-sm" value="${c.title}" data-k="title" data-i="${idx}"/></td>
      <td><input class="form-control form-control-sm" value="${c.level||''}" data-k="level" data-i="${idx}"/></td>
      <td><input class="form-control form-control-sm" value="${c.price||0}" data-k="price" type="number" data-i="${idx}"/></td>
      <td><input class="form-control form-control-sm" value="${c.cover||''}" data-k="cover" data-i="${idx}"/></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger" data-act="del" data-i="${idx}">ลบ</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function wireCourseHandlers(){
  q('#coursesTbody').addEventListener('input', (e)=>{
    const el = e.target; const i = +el.dataset.i; const k = el.dataset.k;
    if(!Number.isInteger(i) || !k) return;
    courses.list[i][k] = (k==='price') ? Number(el.value||0) : el.value;
  });
  q('#coursesTbody').addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-act="del"]');
    if(!btn) return;
    const i = +btn.dataset.i;
    courses.list.splice(i,1);
    renderCoursesTable();
  });
  q('#btnAddCourse').addEventListener('click', ()=>{
    courses.list.push({id:'new-course', title:'ชื่อคอร์ส', price:0, level:'', cover:''});
    renderCoursesTable();
  });
}

function renderAccess(){
  const sel = q('#accessCourse');
  sel.innerHTML = '';
  (courses.list||[]).forEach(c=>{
    const o = document.createElement('option'); o.value = c.id; o.textContent = `${c.title} (${c.id})`; sel.appendChild(o);
  });
  sel.dispatchEvent(new Event('change'));
}

function wireAccessHandlers(){
  q('#accessCourse').addEventListener('change', ()=>{
    const id = q('#accessCourse').value;
    const hashes = access.courses?.[id]?.allow_email_hashes || [];
    const list = q('#accessList');
    list.innerHTML = '';
    hashes.forEach((h,i)=>{
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `<code class="small">${h}</code><button class="btn btn-sm btn-outline-danger" data-i="${i}">ลบ</button>`;
      list.appendChild(li);
    });
  });
  q('#accessList').addEventListener('click', (e)=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const id = q('#accessCourse').value;
    access.courses[id].allow_email_hashes.splice(+btn.dataset.i,1);
    q('#accessCourse').dispatchEvent(new Event('change'));
  });
  q('#btnAddHash').addEventListener('click', async ()=>{
    const email = q('#emailToHash').value.trim().toLowerCase();
    if(!email) return alert('กรอกอีเมลก่อน');
    const h = await sha256Hex(email);
    const id = q('#accessCourse').value;
    access.courses[id] = access.courses[id] || {allow_email_hashes:[]};
    if(!access.courses[id].allow_email_hashes.includes(h)){
      access.courses[id].allow_email_hashes.push(h);
      q('#accessCourse').dispatchEvent(new Event('change'));
      q('#emailToHash').value = '';
    }
  });
}

function exportBlob(filename, data){
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
}

async function exportZip(){
  const zip = new JSZip();
  zip.file('data/site-data.json', JSON.stringify(site, null, 2));
  zip.file('data/courses.json', JSON.stringify(courses, null, 2));
  zip.file('data/access.json', JSON.stringify(access, null, 2));
  zip.file('seo/seo.json', JSON.stringify(seo, null, 2));
  const blob = await zip.generateAsync({type:'blob'});
  saveAs(blob, 'site-export.zip');
}

async function init(){
  const ok = await ensureAdmin();
  if(!ok){
    document.body.innerHTML = `<div class="container py-5"><div class="alert alert-danger">เฉพาะผู้ดูแลระบบเท่านั้น กรุณาเข้าสู่ระบบด้วยบัญชีที่อนุญาต</div><a href="login.html" class="btn btn-dark">ไปหน้าเข้าสู่ระบบ</a></div>`;
    return;
  }
  [courses, access, seo, site] = await Promise.all([
    loadJSON('data/courses.json'),
    loadJSON('data/access.json'),
    loadJSON('seo/seo.json'),
    loadJSON('data/site-data.json')
  ]);
  renderCoursesTable(); wireCourseHandlers();
  renderAccess(); wireAccessHandlers();

  document.getElementById('btnExportCourses').addEventListener('click', ()=> exportBlob('courses.json', courses));
  document.getElementById('btnExportAccess').addEventListener('click', ()=> exportBlob('access.json', access));
  document.getElementById('btnExportSEO').addEventListener('click', ()=> exportBlob('seo.json', seo));
  document.getElementById('btnExportSite').addEventListener('click', ()=> exportBlob('site-data.json', site));
  document.getElementById('btnExportAll').addEventListener('click', exportZip);
}

window.addEventListener('DOMContentLoaded', init);
