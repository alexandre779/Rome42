const C='rome42-v44';
const CORE=['./','index.html','manifest.webmanifest','icons/r42-192.png','icons/r42-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('rome42-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin)return;
  e.respondWith((async()=>{
    const cache=await caches.open(C);
    try{
      const fresh=await fetch(e.request,{cache:'no-store'});
      if(fresh&&fresh.ok)cache.put(e.request,fresh.clone());
      return fresh;
    }catch(err){
      const hit=await cache.match(e.request);
      if(hit)return hit;
      if(e.request.mode==='navigate')return (await cache.match('./'))||(await cache.match('index.html'));
      throw err;
    }
  })());
});