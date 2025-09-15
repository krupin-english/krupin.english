// Ultra Minimal UI: theme toggle, parallax orbs, magnetic buttons, reveal, scroll bar & course tools

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll progress
const bar = document.getElementById('scrollProgress');
function onScroll(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  if(bar) bar.style.width = scrolled + '%';
}
window.addEventListener('scroll', onScroll); onScroll();

// Reveal
if(!prefersReduced){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  },{threshold:.12});
  document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
}

// Theme toggle
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
  if(btn){
    btn.addEventListener('click', ()=>{
      const isDark = body.classList.toggle('theme-dark');
      body.classList.remove(isDark ? 'theme-light' : 'theme-dark');
      localStorage.setItem(key, isDark ? 'dark' : 'light');
      apply();
    });
  }
})();

// Parallax orbs in hero
(function(){
  if(prefersReduced) return;
  const wrap = document.querySelector('.hero .orbs');
  if(!wrap) return;
  const layers = Array.from(wrap.children);
  const onMove = (e)=>{
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left)/rect.width - .5;
    const y = (e.clientY - rect.top)/rect.height - .5;
    layers.forEach((el,i)=>{
      const f = (i===0? 6 : 9); // parallax factor
      el.style.transform = `translate(${x*f}px, ${y*f}px)`;
    });
  };
  wrap.closest('.hero').addEventListener('mousemove', onMove);
  wrap.closest('.hero').addEventListener('mouseleave', ()=> layers.forEach(el=> el.style.transform=''));
})();

// Magnetic buttons (brand)
(function(){
  if(prefersReduced) return;
  const mags = document.querySelectorAll('.btn-brand');
  mags.forEach(btn=>{
    const area = 80; // px
    const normal = ()=>{ btn.style.transform=''; btn.style.boxShadow=''; };
    document.addEventListener('mousemove', (e)=>{
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx,dy);
      if(dist < area){
        const p = (area - dist)/area;
        btn.style.transform = `translate(${dx*0.06}px, ${dy*0.06}px)`;
      }else{
        normal();
      }
    });
    btn.addEventListener('mouseleave', normal);
  });
})();

// Courses helpers (search + sort)
export function setupCourseTools(){
  const list = document.getElementById('courseList');
  if(!list) return;
  const chips = document.getElementById('filterChips');
  const search = document.getElementById('courseSearch');
  const sortBar = document.getElementById('sortBar');

  const apply = ()=>{
    const q = (search?.value || '').trim().toLowerCase();
    const activeChip = chips?.querySelector('.chip.active');
    const lvl = activeChip ? activeChip.dataset.level : 'all';
    const cards = Array.from(list.querySelectorAll('[data-level]'));
    let arr = cards;

    arr.forEach(c=>{
      const matchText = (c.textContent||'').toLowerCase().includes(q);
      const matchLvl = (lvl==='all') || (c.dataset.level && c.dataset.level.includes(lvl));
      c.style.display = (matchText && matchLvl) ? '' : 'none';
    });

    const mode = sortBar?.querySelector('[aria-pressed="true"]')?.dataset.sort || 'popular';
    const getPrice = (el)=>{
      const priceEl = el.querySelector('.fw-bold');
      const text = priceEl ? priceEl.textContent.replace(/[^\d]/g,'') : '0';
      return parseInt(text||'0',10);
    };
    if(mode==='price-asc' || mode==='price-desc'){
      const shown = arr.filter(el=> el.style.display !== 'none');
      shown.sort((a,b)=> (getPrice(a)-getPrice(b)) * (mode==='price-asc'?1:-1));
      shown.forEach(el=> list.appendChild(el));
    }
  };

  chips?.addEventListener('click', e=>{
    const chip = e.target.closest('.chip'); if(!chip) return;
    chips.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active'); apply();
  });
  search?.addEventListener('input', apply);
  sortBar?.addEventListener('click', e=>{
    const b = e.target.closest('button[data-sort]'); if(!b) return;
    sortBar.querySelectorAll('button').forEach(x=>x.removeAttribute('aria-pressed'));
    b.setAttribute('aria-pressed','true'); apply();
  });
}
