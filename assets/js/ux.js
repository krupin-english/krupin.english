
// Scroll progress
const bar = document.getElementById('scrollProgress');
const onScroll = () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  if(bar) bar.style.width = scrolled + '%';
};
window.addEventListener('scroll', onScroll); onScroll();

// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('revealed'); io.unobserve(e.target); }
  });
},{threshold:.12});
document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));

// Minimal press feedback (no flashy ripple)
document.addEventListener('pointerdown', (e)=>{
  const btn = e.target.closest('.btn');
  if(!btn) return;
  btn.style.transform = 'translateY(1px)';
  btn.style.filter = 'brightness(.98)';
});
document.addEventListener('pointerup', (e)=>{
  const btn = e.target.closest('.btn');
  if(!btn) return;
  btn.style.transform = '';
  btn.style.filter = '';
});

// Helper to add skeletons (used by pages optionally)
export function addSkeletonCards(container, count=3){
  if(!container) return;
  for(let i=0;i<count;i++){
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <div class="card p-2">
        <div class="skel" style="height:180px"></div>
        <div class="p-3">
          <div class="skel" style="height:12px; width:80px;"></div>
          <div class="skel mt-2" style="height:20px; width:70%"></div>
          <div class="skel mt-2" style="height:12px; width:90%"></div>
          <div class="skel mt-2" style="height:12px; width:60%"></div>
        </div>
      </div>`;
    container.appendChild(col);
  }
}

// Chips filter for courses page
export function setupCourseChips(){
  const list = document.getElementById('courseList');
  if(!list) return;
  const bar = document.getElementById('filterChips');
  if(!bar) return;
  bar.addEventListener('click', (e)=>{
    const chip = e.target.closest('.chip'); if(!chip) return;
    bar.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    const lv = chip.dataset.level || 'all';
    const cards = Array.from(list.querySelectorAll('[data-level]'));
    cards.forEach(c=>{
      const show = (lv==='all') || (c.dataset.level && c.dataset.level.includes(lv));
      c.style.display = show ? '' : 'none';
    });
  });
}

// Attach skeletons for slow networks
window.addEventListener('DOMContentLoaded', ()=>{
  const list = document.getElementById('courseList');
  if(list && !list.children.length){
    addSkeletonCards(list, 6);
    setTimeout(()=>{
      // remove skeletons after some time if real cards exist
      const real = list.querySelector('.card:not(.skel)');
      if(real) list.querySelectorAll('.skel').forEach(k=>k.closest('.col')?.remove());
    }, 2000);
  }
});
