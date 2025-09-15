

// --- Ultra Suite: Import (.zip or single .json) into memory ---
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

function parseJsonSafe(text){ try{ return JSON.parse(text); }catch(e){ return null; } }

async function handleImportFile(file){
  if(!file) return;
  const holder = document.createElement('div');
  holder.className = 'alert alert-info my-2';
  holder.textContent = 'กำลังอ่านไฟล์...';
  document.querySelector('#p-export').appendChild(holder);

  try{
    if(file.name.endsWith('.zip')){
      const zip = await JSZip.loadAsync(file);
      const get = async (path)=> zip.file(path) ? JSON.parse(await zip.file(path).async('string')) : null;
      const site = await get('data/site-data.json');
      const cs   = await get('data/courses.json');
      const ac   = await get('data/access.json');
      const se   = await get('seo/seo.json');
      if(site) window.site = site;
      if(cs) window.courses = cs;
      if(ac) window.access = ac;
      if(se) window.seo = se;
    }else if(file.name.endsWith('.json')){
      const text = await file.text();
      const obj = parseJsonSafe(text);
      if(!obj) throw new Error('JSON ไม่ถูกต้อง');
      // heuristic: detect which json it is
      if(obj.list) window.courses = obj;
      else if(obj.courses) window.access = obj;
      else if(obj.home) window.site = obj;
      else window.seo = obj;
    }
    // re-render
    if(typeof renderCoursesTable==='function') renderCoursesTable();
    if(typeof renderAccess==='function') renderAccess();
    holder.className = 'alert alert-success my-2'; holder.textContent = 'Import สำเร็จ (ยังไม่บันทึกลงไฟล์ จนกว่าจะ Export)';
  }catch(e){
    holder.className = 'alert alert-danger my-2'; holder.textContent = 'Import ไม่สำเร็จ: ' + e.message;
  }
}

document.getElementById('btnImportAll')?.addEventListener('click', ()=> document.getElementById('fileImport').click());
document.getElementById('fileImport')?.addEventListener('change', (e)=> handleImportFile(e.target.files[0]));
