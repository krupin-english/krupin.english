// Ultra Suite UI
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// scroll progress
const bar = document.getElementById('scrollProgress');
function onScroll(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  if(bar) bar.style.width = scrolled + '%';
}
window.addEventListener('scroll', onScroll); onScroll();

// reveal
if(!reduced){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('revealed'); io.unobserve(e.target);} });
  },{threshold:.12});
  document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
}

// theme toggle
(function(){
  const key = 'kp-theme';
  const body = document.body;
  const saved = localStorage.getItem(key);
  if(saved === 'dark') body.classList.add('theme-dark');
  if(saved === 'light') body.classList.add('theme-light');
  const btn = document.getElementById('themeToggle');
  const apply = ()=>{
    const isDark = body.classList.contains('theme-dark');
    if(btn){ btn.textContent = isDark ? '☀︎' : '◐'; btn.title = isDark ? 'โหมดสว่าง' : 'โหมดมืด'; }
  };
  apply();
  btn?.addEventListener('click', ()=>{
    const isDark = body.classList.toggle('theme-dark');
    body.classList.remove(isDark ? 'theme-light' : 'theme-dark');
    localStorage.setItem(key, isDark ? 'dark' : 'light'); apply();
  });
})();

// hero orbs parallax
(function(){
  if(reduced) return;
  const wrap = document.querySelector('.hero .orbs'); if(!wrap) return;
  const layers = Array.from(wrap.children);
  const onMove = (e)=>{
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left)/rect.width - .5;
    const y = (e.clientY - rect.top)/rect.height - .5;
    layers.forEach((el,i)=>{ const f = (i===0? 6 : 9); el.style.transform = `translate(${x*f}px, ${y*f}px)`; });
  };
  wrap.closest('.hero').addEventListener('mousemove', onMove);
  wrap.closest('.hero').addEventListener('mouseleave', ()=> layers.forEach(el=> el.style.transform=''));
})();

// magnetic brand buttons (minimal)
(function(){
  if(reduced) return;
  const mags = document.querySelectorAll('.btn-brand');
  mags.forEach(btn=>{
    const area = 80;
    const normal = ()=>{ btn.style.transform=''; };
    document.addEventListener('mousemove', (e)=>{
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width/2);
      const dy = e.clientY - (r.top + r.height/2);
      const dist = Math.hypot(dx,dy);
      if(dist < area){ const p = (area - dist)/area; btn.style.transform = `translate(${dx*0.06}px, ${dy*0.06}px)`; }
      else normal();
    });
    btn.addEventListener('mouseleave', normal);
  });
})();

// ---------- Courses: search+filter+sort ----------
export function setupCourseTools(){
  const list = document.getElementById('courseList'); if(!list) return;
  const chips = document.getElementById('filterChips');
  const search = document.getElementById('courseSearch');
  const sortBar = document.getElementById('sortBar');
  const apply = ()=>{
    const q = (search?.value || '').trim().toLowerCase();
    const activeChip = chips?.querySelector('.chip.active'); const lvl = activeChip ? activeChip.dataset.level : 'all';
    const cards = Array.from(list.querySelectorAll('[data-level]'));
    cards.forEach(c=>{
      const matchText = (c.textContent||'').toLowerCase().includes(q);
      const matchLvl = (lvl==='all') || (c.dataset.level && c.dataset.level.includes(lvl));
      c.style.display = (matchText && matchLvl) ? '' : 'none';
    });
    const mode = sortBar?.querySelector('[aria-pressed="true"]')?.dataset.sort || 'popular';
    const getPrice = (el)=>{ const elp = el.querySelector('.fw-bold'); const t = elp ? (elp.textContent||'').replace(/[^\d]/g,'') : '0'; return parseInt(t||'0',10); };
    if(mode==='price-asc' || mode==='price-desc'){
      const shown = cards.filter(el=> el.style.display !== 'none');
      shown.sort((a,b)=> (getPrice(a)-getPrice(b)) * (mode==='price-asc'?1:-1));
      shown.forEach(el=> list.appendChild(el));
    }
  };
  chips?.addEventListener('click', e=>{ const chip = e.target.closest('.chip'); if(!chip) return; chips.querySelectorAll('.chip').forEach(c=>c.classList.remove('active')); chip.classList.add('active'); apply(); });
  search?.addEventListener('input', apply);
  sortBar?.addEventListener('click', e=>{ const b = e.target.closest('button[data-sort]'); if(!b) return; sortBar.querySelectorAll('button').forEach(x=>x.removeAttribute('aria-pressed')); b.setAttribute('aria-pressed','true'); apply(); });
}

// ---------- Shop: search ----------
export function setupShopSearch(){
  const list = document.getElementById('shopList'); if(!list) return;
  const search = document.getElementById('shopSearch'); if(!search) return;
  const apply = ()=>{
    const q = (search.value||'').toLowerCase();
    list.querySelectorAll('.card').forEach(card=>{
      const show = (card.textContent||'').toLowerCase().includes(q);
      card.closest('.col').style.display = show ? '' : 'none';
    });
  };
  search.addEventListener('input', apply);
}

// ---------- Testimonials (home) ----------
export async function initTestimonials(){
  const wrap = document.getElementById('testimonials'); if(!wrap) return;
  try{
    const res = await fetch('data/testimonials.json?v=' + Date.now()); const data = await res.json();
    const cont = document.createElement('div'); cont.className = 'testi';
    (data.list || []).forEach(t=>{
      const el = document.createElement('div'); el.className='item';
      el.innerHTML = `<div class="small text-muted">${t.badge||'ผู้เรียนจริง'}</div>
        <div class="mt-1">“${t.text}”</div>
        <div class="mt-2 fw-bold">— ${t.name}</div>`;
      cont.appendChild(el);
    });
    wrap.appendChild(cont);
  }catch(e){ console.warn(e); }
}

// ---------- Course JSON-LD ----------
export async function addCourseJSONLD(courseId){
  if(!courseId) return;
  try{
    const res = await fetch('data/courses.json?v=' + Date.now()); const data = await res.json();
    const c = (data.list||[]).find(x=>x.id===courseId); if(!c) return;
    const script = document.createElement('script'); script.type='application/ld+json';
    const payload = {
      "@context":"https://schema.org","@type":"Course",
      "name": c.title, "description": c.desc || c.short || "",
      "provider": {"@type":"Organization","name":"KruPin English","sameAs": location.origin},
      "educationalLevel": c.level || "All", "offers": {"@type":"Offer","priceCurrency":"THB","price": String(c.price||0)}
    };
    script.textContent = JSON.stringify(payload); document.head.appendChild(script);
    // Breadcrumbs
    const bc = document.createElement('script'); bc.type='application/ld+json';
    bc.textContent = JSON.stringify({
      "@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"คอร์สเรียน","item": location.origin + "/courses.html"},
        {"@type":"ListItem","position":2,"name": c.title, "item": location.href}
      ]
    });
    document.head.appendChild(bc);
  }catch(e){ console.warn(e); }
}

// ---------- Article TOC ----------
export function buildArticleTOC(){
  const wrap = document.getElementById('postWrap'); const toc = document.getElementById('toc'); if(!wrap||!toc) return;
  const obs = new MutationObserver(()=>{
    const hs = wrap.querySelectorAll('h1,h2,h3');
    if(!hs.length) return;
    const ul = document.createElement('ul'); ul.className = 'list-quiet';
    hs.forEach((h,i)=>{
      if(!h.id) h.id = 'h-' + (i+1);
      const li = document.createElement('li'); li.innerHTML = `<a href="#${h.id}">${h.textContent}</a>`; ul.appendChild(li);
    });
    toc.innerHTML = '<div class="card p-3"><div class="fw-bold mb-2">หัวข้อในหน้านี้</div></div>';
    toc.querySelector('.card').appendChild(ul);
    obs.disconnect();
  });
  obs.observe(wrap, {childList:true, subtree:true});
}
