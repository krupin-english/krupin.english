
const CACHE = 'kp-v1';
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll([
    'index.html','courses.html','course.html','shop.html','article.html','about.html','contact.html',
    'assets/css/base.css','assets/css/theme.css',
    'assets/js/utils.js','assets/js/auth.js','assets/js/gate.js','assets/js/seo.js','assets/js/admin.js','assets/js/main.js',
    'data/courses.json','data/site-data.json','data/access.json',
    'seo/seo.json','manifest.webmanifest'
  ])));
});
self.addEventListener('fetch', e=>{
  e.respondWith((async()=>{
    const cached = await caches.match(e.request);
    if(cached) return cached;
    try{
      const fresh = await fetch(e.request);
      const c = await caches.open(CACHE);
      c.put(e.request, fresh.clone());
      return fresh;
    }catch(err){
      return cached || new Response('offline',{status:200});
    }
  })());
});
