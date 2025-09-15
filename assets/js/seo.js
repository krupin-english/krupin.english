// Simple SEO loader per page based on seo/seo.json
import { loadJSON } from './utils.js';

(async function(){
  try{
    const seo = await loadJSON('seo/seo.json');
    const path = location.pathname.split('/').pop() || 'index.html';
    const cfg = seo[path] || seo['default'] || {};
    const set = (name, content)=>{
      let el = document.querySelector(`meta[name="${name}"]`);
      if(!el){ el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content || '');
    };
    document.title = cfg.title || document.title;
    set('description', cfg.description || '');

    // Open Graph basic
    const og = (property, content)=>{
      let el = document.querySelector(`meta[property="${property}"]`);
      if(!el){ el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.setAttribute('content', content || '');
    };
    og('og:title', cfg.title || document.title);
    og('og:description', cfg.description || '');
    og('og:type', cfg.ogType || 'website');
    og('og:url', cfg.url || location.href);
    og('og:image', cfg.image || 'assets/img/cover.png');

    // JSON-LD organization (minimal)
    const org = {
      "@context":"https://schema.org",
      "@type":"Organization",
      "name":"KruPin English",
      "url": cfg.url || location.origin,
      "logo":"assets/img/icon-192.png"
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(org);
    document.head.appendChild(script);
  }catch(e){ console.warn('SEO load failed', e); }
})();
