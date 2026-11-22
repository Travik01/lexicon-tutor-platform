import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
const BASE='http://127.0.0.1:8787'; const bundle=readFileSync('/tmp/app.js','utf8'); const errors=[];
const vc=new VirtualConsole();vc.on('error',(...x)=>errors.push(String(x[0])));vc.on('jsdomError',e=>errors.push(e.message));
const wait=ms=>new Promise(r=>setTimeout(r,ms)); const txt=e=>(e.textContent||'').replace(/\s+/g,' ').trim();
async function api(path,method='GET',body=null,token=''){const r=await fetch(BASE+'/api'+path,{method,headers:{...(body?{'content-type':'application/json'}:{}),...(token?{authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});let d;try{d=await r.json()}catch{d={}};if(!r.ok)throw Error(`${method} ${path} ${r.status}: ${d.error}`);return d;}
async function login(role,name){return (await api('/auth/login','POST',role==='admin'?{role,password:'english2026'}:{role,name})).token;}
function dom(token,role,profile){const d=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:BASE+'/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});const w=d.window;w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}takeRecords(){return[]}};w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.speechSynthesis={speak(){},cancel(){},getVoices:()=>[]};w.SpeechSynthesisUtterance=class{};w.confirm=()=>true;w.fetch=(i,init)=>fetch(typeof i==='string'&&i.startsWith('/')?BASE+i:i,init);w.localStorage.setItem('ch2-token',token);w.localStorage.setItem('ch2-demo-session',role);if(profile)w.localStorage.setItem('ch2-guest-profile',JSON.stringify(profile));w.eval(bundle);return d;}
const click=async(w,e,ms=650)=>{if(!e)throw Error('button missing');e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await wait(ms);};
let report=[];let admin;let backup;
try{
 admin=await login('admin');backup=await api('/backup','GET',null,admin);
 const d=dom(admin,'admin');const w=d.window;await wait(1000);
 let nav=[...w.document.querySelectorAll('button,a,[role=button]')].filter(e=>txt(e)==='Программа');await click(w,nav.at(-1),900);
 let delMod=w.document.querySelector('button[aria-label^="Удалить модуль"]');report.push('модуль: кнопка ясная='+!!delMod+';');await click(w,delMod,200);
 const confirmMod=[...w.document.querySelectorAll('button')].find(e=>txt(e)==='Удалить');await click(w,confirmMod,900);
 report.push('подтверждение удаления модуля: модуль удалён, кабинет остался='+/Управление программой/.test(w.document.body.textContent)+';');
 const delLesson=w.document.querySelector('button[aria-label^="Удалить тему"]');report.push('тема: отдельная кнопка='+!!delLesson+';');if(delLesson){await click(w,delLesson,200);report.push('не открыл урок при нажатии удалить='+!/Задание \d+/.test(w.document.body.textContent)+';');const cancel=w.document.querySelector('button[aria-label="Отменить удаление темы"]');await click(w,cancel,300);}
 w.close();
 const sentences=['I ___ a photo on holiday.','We ___ the bus at eight.','Let us ___ a break.'];
 const trio=await api('/tasks','POST',{type:'trio',title:'audit trio',prompt:'Впишите один и тот же глагол во все три предложения.',trioSentences:sentences,answers:['take'],options:[],passage:'',audioUrl:'',explanation:'Take подходит во всех случаях.',points:1},admin);
 const variant=await api('/tests','POST',{title:'Audit Trio',topic:'Grammar',level:'B1',code:'AUDIT-TRIO',taskIds:[trio.id]},admin);
 const fetched=await api('/tests/code/AUDIT-TRIO');report.push('Trio backend roundtrip='+ (fetched.tasks[0].type==='trio'&&fetched.tasks[0].trioSentences.length===3?'ok':'FAIL')+';');
 const invalid=await fetch(BASE+'/api/tasks',{method:'POST',headers:{authorization:`Bearer ${admin}`,'content-type':'application/json'},body:JSON.stringify({type:'trio',title:'bad',prompt:'x',trioSentences:['one','two','three'],answers:['take']})});report.push('Trio без ___ отклонён='+(invalid.status===400)+';');
 const student=await login('student','Аудит Трио');
 const d2=dom(student,'student',{name:'Аудит Трио',goal:'general',level:'B1'});const w2=d2.window;await wait(1000);
 nav=[...w2.document.querySelectorAll('button,a,[role=button]')].filter(e=>txt(e)==='Библиотека');await click(w2,nav.at(-1),850);
 const start=[...w2.document.querySelectorAll('button')].find(e=>txt(e)==='Начать'&&e.closest('article,section,div')?.textContent.includes('Audit Trio')) || [...w2.document.querySelectorAll('button')].find(e=>txt(e)==='Начать');
 await click(w2,start,800);report.push('открылось трио: '+/один и тот же глагол|Общий глагол/.test(w2.document.body.textContent)+';');
 const input=w2.document.querySelector('input[placeholder*="Общий глагол"]');if(input){const setter=Object.getOwnPropertyDescriptor(w2.HTMLInputElement.prototype,'value').set;setter.call(input,'take');input.dispatchEvent(new w2.Event('input',{bubbles:true}));await wait(150);const check=[...w2.document.querySelectorAll('button')].find(e=>txt(e).startsWith('Проверить'));await click(w2,check,400);report.push('ответ trio check UI='+/Верно/.test(w2.document.body.textContent)+';');}
 w2.close();
 // Total timer expires and marks remaining questions, then submits.
 const timerTest=await api('/tests','POST',{title:'Audit Timer',topic:'Grammar',level:'B1',code:'AUDIT-TIMER',taskIds:[trio.id],timeLimitSeconds:2},admin);
 const stu2=await login('student','Аудит Таймер');const d3=dom(stu2,'student',{name:'Аудит Таймер',goal:'general',level:'B1'});const w3=d3.window;await wait(900);
 nav=[...w3.document.querySelectorAll('button,a,[role=button]')].filter(e=>txt(e)==='Библиотека');await click(w3,nav.at(-1),800);
 const start2=[...w3.document.querySelectorAll('button')].find(e=>txt(e)==='Начать'&&e.closest('article,section,div')?.textContent.includes('Audit Timer'))||[...w3.document.querySelectorAll('button')].find(e=>txt(e)==='Начать');
 await click(w3,start2,3000);report.push('общий таймер завершил вариант='+/Задание завершено/.test(w3.document.body.textContent)+';');
 w3.close();
 const timedTask=await api('/tasks','POST',{type:'trio',title:'Audit Task Timer',prompt:'Один и тот же глагол во все фразы.',trioSentences:['I ___ a photo.','We ___ the bus.','Let us ___ a break.'],answers:['take'],options:[],passage:'',audioUrl:'',explanation:'',points:1,timeLimitSeconds:2},admin);
 await api('/tests','POST',{title:'Audit One Task Timer',topic:'Grammar',level:'B1',code:'AUDIT-ONETIMER',taskIds:[timedTask.id]},admin);
 const stu3=await login('student','Аудит Таймер Задания');const d4=dom(stu3,'student',{name:'Аудит Таймер Задания',goal:'general',level:'B1'});const w4=d4.window;await wait(900);
 nav=[...w4.document.querySelectorAll('button,a,[role=button]')].filter(e=>txt(e)==='Библиотека');await click(w4,nav.at(-1),800);
 const start3=[...w4.document.querySelectorAll('button')].find(e=>txt(e)==='Начать'&&e.closest('article,section,div')?.textContent.includes('Audit One Task Timer'))||[...w4.document.querySelectorAll('button')].find(e=>txt(e)==='Начать');
 await click(w4,start3,2800);report.push('лимит отдельного задания сработал='+/Время на это задание вышло/.test(w4.document.body.textContent)+';');
 w4.close();
}catch(e){report.push('TEST ERROR '+e.stack)}finally{if(backup&&admin){try{await api('/restore','POST',backup,admin)}catch(e){report.push('RESTORE ERROR '+e.message)}}}
console.log(report.join('\n'));console.log('console errors='+errors.length);if(errors.length)console.log(errors.slice(0,6).join('\n'));
