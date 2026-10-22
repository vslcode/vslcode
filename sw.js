const CACHE='minha-caixinha-v4';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url),root=new URL('./',self.location.href);
  if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname))return;
  if(event.request.mode==='navigate'||url.pathname.endsWith('/index.html')){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request);
        if(response.ok){const cache=await caches.open(CACHE);cache.put(event.request,response.clone())}
        return response;
      }catch(err){return await caches.match(event.request)||await caches.match('./index.html')||Response.error()}
    })());
  }else{
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
  }
});