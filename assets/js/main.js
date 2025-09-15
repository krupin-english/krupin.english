
import { loadJSON, LINE_LINK, fmtPrice, q } from './utils.js';

(async function(){
  try{
    const site = await loadJSON('data/site-data.json');
    const courses = await loadJSON('data/courses.json');
    // hero
    const heroTitle = site?.home?.heroTitle || "พูดอังกฤษอย่างมั่นใจ เริ่มที่นี่";
    const heroDesc = site?.home?.heroDesc || "คอร์สที่เข้าใจง่าย ใช้ได้จริง พร้อมโค้ชคอยดูแล";
    document.querySelector('#heroTitle').textContent = heroTitle;
    document.querySelector('#heroDesc').textContent = heroDesc;

    // highlight courses (top 3)
    const wrap = document.querySelector('#highlightCourses');
    (courses.list || []).slice(0,3).forEach(c=>{
      const el = document.createElement('div');
      el.className = 'col';
      el.innerHTML = `
        <div class="card h-100 fade-in">
          <img src="${c.cover}" class="card-img-top" alt="${c.title}">
          <div class="card-body">
            <span class="badge-cream small">${c.level || 'ทุกระดับ'}</span>
            <h5 class="mt-2">${c.title}</h5>
            <p class="text-muted">${c.short || ''}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold">${fmtPrice(c.price || 0)}</span>
              <div class="d-flex gap-2">
                <a class="btn btn-sm btn-outline-dark" href="course.html?id=${c.id}">ดูรายละเอียด</a>
                <a class="btn btn-sm btn-brand" href="${LINE_LINK}" target="_blank" rel="noopener">ทัก LINE</a>
              </div>
            </div>
          </div>
        </div>`;
      wrap.appendChild(el);
    });
  }catch(e){ console.warn(e); }
})();
