import express from 'express';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const __dir=path.dirname(fileURLToPath(import.meta.url));
const {VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY,VAPID_SUBJECT,PORT=3000}=process.env;
const DATA=process.env.DATA_DIR||path.join(__dir,'data'),FILE=path.join(DATA,'subs.json');
if(!VAPID_PUBLIC_KEY||!VAPID_PRIVATE_KEY||!VAPID_SUBJECT){const k=webpush.generateVAPIDKeys();console.error('\nSETUP: add these 3 environment variables, then redeploy:\nVAPID_PUBLIC_KEY='+k.publicKey+'\nVAPID_PRIVATE_KEY='+k.privateKey+'\nVAPID_SUBJECT=mailto:YOUR_EMAIL (use your real email)\nKeep the private key secret.\n');process.exit(1)}
webpush.setVapidDetails(VAPID_SUBJECT,VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY);
fs.mkdirSync(DATA,{recursive:true});
let subs={};try{subs=JSON.parse(fs.readFileSync(FILE,'utf8'))}catch(_){}
const persist=()=>fs.writeFileSync(FILE,JSON.stringify(subs));
const MSG={0:'😴 Recovery Day! Take a rest and eat balanced meals.',1:'💪 Monday Workout! Today is PUSH DAY. Open your fitness coach and start your workout!',2:'🔥 Today’s workout: LEGS & CORE. Your training session is waiting!',3:'😴 Recovery Day! Take a rest and eat balanced meals.',4:'💪 BACK & POSTURE DAY! Let’s work on strength and posture.',5:'😴 Recovery Day! Take a rest and eat balanced meals.',6:'⚡ FULL BODY DAY! Let’s get moving!'};
function local(tz){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23',weekday:'short'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
 return {date:`${p.year}-${p.month}-${p.day}`,min:+p.hour*60+ +p.minute,dow:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday)}}
async function send(s,body){try{await webpush.sendNotification(s.sub,JSON.stringify({title:'My Fitness Coach',body}));return true}
 catch(e){if(e.statusCode===404||e.statusCode===410){delete subs[s.sub.endpoint];persist()}else console.error('push failed',e.statusCode||e.message);return false}}
async function tick(){for(const s of Object.values(subs)){let l;try{l=local(s.tz)}catch(_){continue}
 const [h,m]=s.time.split(':').map(Number),due=h*60+m;
 if(s.last!==l.date&&l.min>=due&&l.min<due+180){s.last=l.date;persist();await send(s,MSG[l.dow])}}}
setInterval(()=>tick().catch(console.error),30000);
const app=express();app.use(express.json({limit:'20kb'}));
app.get('/api/vapid-public-key',(_,r)=>r.json({key:VAPID_PUBLIC_KEY}));
app.post('/api/subscribe',(q,r)=>{const {subscription:sub,time,tz}=q.body||{};
 if(!sub?.endpoint||!sub?.keys||!/^\d{2}:\d{2}$/.test(time||''))return r.status(400).json({error:'Invalid subscription'});
 try{local(tz)}catch(_){return r.status(400).json({error:'Invalid timezone'})}
 const old=subs[sub.endpoint];subs[sub.endpoint]={sub,time,tz,last:old?.last||''};persist();r.json({ok:true})});
app.post('/api/unsubscribe',(q,r)=>{delete subs[q.body?.endpoint];persist();r.json({ok:true})});
app.post('/api/test',async(q,r)=>{const s=subs[q.body?.endpoint];if(!s)return r.status(404).json({error:'Not subscribed on the server'});
 (await send(s,'✅ Test notification from My Fitness Coach'))?r.json({ok:true}):r.status(502).json({error:'Push service rejected the message'})});
app.use((q,r,n)=>{if(q.path==='/sw.js')r.set('Cache-Control','no-cache');n()});
app.use(express.static(path.join(__dir,'public')));
app.listen(PORT,()=>console.log('Fitness Coach on :'+PORT));
