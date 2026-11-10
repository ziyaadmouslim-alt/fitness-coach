const C='fc-v1',SHELL=['/','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png','/icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
 e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(r,{ignoreSearch:true});
  const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>null);
  return hit||(await net)||(r.mode==='navigate'?c.match('/'):Response.error())}))});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){}
 e.waitUntil(self.registration.showNotification(d.title||'My Fitness Coach',{body:d.body||'Open your fitness coach.',icon:'/icons/icon-192.png',badge:'/icons/icon-192.png',tag:'daily',data:{url:'/'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c)return c.focus()}return self.clients.openWindow('/')}))});
