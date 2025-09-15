
const bar = document.getElementById('scrollProgress');
function onScroll(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  if(bar) bar.style.width = scrolled + '%';
}
window.addEventListener('scroll', onScroll); onScroll();

const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('revealed'); io.unobserve(e.target); }
  });
},{threshold:.15});
document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));

document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.btn, .btn-brand, .btn-outline-dark');
  if(!btn) return;
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  r.style.left = (e.clientX - rect.left) + 'px';
  r.style.top = (e.clientY - rect.top) + 'px';
  btn.appendChild(r);
  setTimeout(()=>r.remove(), 600);
});

document.querySelectorAll('.tilt').forEach(el=>{
  el.addEventListener('mousemove', (e)=>{
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left)/rect.width - .5;
    const y = (e.clientY - rect.top)/rect.height - .5;
    el.style.transform = `rotateX(${-y*6}deg) rotateY(${x*6}deg)`;
  });
  el.addEventListener('mouseleave', ()=> el.style.transform = '');
});
