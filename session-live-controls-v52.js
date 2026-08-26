(()=>{
'use strict';
const VOICE_KEY='r42-live-voice-v1',REMINDER_KEY='r42-live-reminder-v52';
const q=(s,r=document)=>r.querySelector(s);
const allowed=[0,5,10,15,20,30];
const defaultReminder=()=>{const stored=Number(localStorage.getItem(REMINDER_KEY));if(allowed.includes(stored))return stored;const old=localStorage.getItem(VOICE_KEY);return old==='guided'?30:15};
const reminderSec=()=>defaultReminder();
const setReminder=v=>{const n=Number(v);localStorage.setItem(REMINDER_KEY,String(allowed.includes(n)?n:15))};
const fmt=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),r=s%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`};
const parseClock=t=>{const p=String(t||'').trim().split(':').map(Number);if(p.some(x=>!Number.isFinite(x)))return null;if(p.length===2)return p[0]*60+p[1];if(p.length===3)return p[0]*3600+p[1]*60+p[2];return null};
let nativeSpeak=null,speechPatched=false;
function setupSpeech(){
 const synth=window.speechSynthesis;if(!synth?.speak||!window.SpeechSynthesisUtterance)return;
 if(!nativeSpeak)nativeSpeak=synth.speak.bind(synth);
 if(speechPatched)return;
 try{
  const original=synth.speak;
  synth.speak=function(u){
   const t=String(u?.text||'').trim();
   if(/^(?:15|30) secondes restantes\.?$/i.test(t)||/^15 secondes avant la (?:marche|course)\.?$/i.test(t))return;
   return original.call(this,u);
  };
  speechPatched=true;
 }catch{}
}
function speakReminder(text){
 if(localStorage.getItem(VOICE_KEY)==='off'||!window.SpeechSynthesisUtterance)return;
 setupSpeech();
 try{const synth=window.speechSynthesis;synth.cancel();synth.resume?.();const u=new SpeechSynthesisUtterance(text);u.lang='fr-FR';u.rate=.94;const voices=synth.getVoices?.()||[],fr=voices.find(v=>/^fr(?:-|_)/i.test(v.lang||''));if(fr)u.voice=fr;(nativeSpeak||synth.speak.bind(synth))(u)}catch{}
}
function optionsHtml(voice){
 const r=reminderSec(),on=voice!=='off';
 const labels=[[5,'5 s'],[10,'10 s'],[15,'15 s'],[20,'20 s'],[30,'30 s'],[0,'sans rappel']];
 return labels.map(([v,l])=>`<option value="normal" data-r42-reminder="${v}" ${on&&r===v?'selected':''}>Voix active · rappel ${l}</option>`).join('')+`<option value="off" data-r42-reminder="0" ${!on?'selected':''}>Sans voix</option>`;
}
function enhanceSelect(sel){
 if(!sel||sel.dataset.r42ReminderV52==='1')return;
 const voice=localStorage.getItem(VOICE_KEY)||'normal';
 sel.dataset.r42ReminderV52='1';
 sel.innerHTML=optionsHtml(voice);
 sel.addEventListener('change',()=>{
  const opt=sel.selectedOptions?.[0],off=sel.value==='off';
  if(!off)setReminder(Number(opt?.dataset.r42Reminder||15));
  localStorage.setItem(VOICE_KEY,off?'off':'normal');
 },true);
}
let session=null,reminder={sig:'',fired:false,max:null};
function activeSheet(){return q('#r42LiveLayer.open .r42-live-sheet:not(.finished)')}
function pauseButton(sheet){return q('#rwPause',sheet)||q('#livePause',sheet)}
function syncSession(sheet){
 if(!sheet){session=null;reminder={sig:'',fired:false,max:null};return}
 const title=q('.live-top b',sheet)?.textContent?.trim()||'live';
 if(!session||session.title!==title){session={title,startedAt:Date.now(),pausedMs:0,pauseAt:null,paused:false};reminder={sig:'',fired:false,max:null}}
 const paused=/reprendre/i.test(pauseButton(sheet)?.textContent||'');
 if(paused&&!session.paused){session.paused=true;session.pauseAt=Date.now()}
 else if(!paused&&session.paused){session.pausedMs+=Date.now()-(session.pauseAt||Date.now());session.pauseAt=null;session.paused=false}
}
function elapsedTotal(){if(!session)return 0;const end=session.paused?(session.pauseAt||Date.now()):Date.now();return Math.max(0,(end-session.startedAt-session.pausedMs)/1000)}
function ensureTotal(sheet){
 if(q('.r42-live-total',sheet))return;
 const now=q('.live-now',sheet);if(!now)return;
 const box=document.createElement('div');box.className='r42-live-total';box.innerHTML='<div><small>TEMPS TOTAL</small><strong id="r42LiveTotal">00:00</strong></div><span>durée cumulée de la séance</span>';
 now.insertAdjacentElement('afterend',box);
}
function currentSignature(sheet){const now=q('#rwNow',sheet)||q('.live-now',sheet);if(!now)return null;return `${q('small',now)?.textContent?.trim()||''}|${q('h2',now)?.textContent?.trim()||''}`}
function reminderMessage(sheet,sec){
 if(q('#rwNow',sheet)){const small=q('#rwNow small',sheet)?.textContent||'',h=q('#rwNow h2',sheet)?.textContent||'',isRun=/COURSE/i.test(small)||/course/i.test(h);return `${sec} secondes avant ${isRun?'la marche':'la course'}.`}
 return `${sec} secondes restantes.`;
}
function tickReminder(sheet){
 if((localStorage.getItem(VOICE_KEY)||'normal')==='off')return;
 const threshold=reminderSec();if(!threshold)return;
 const now=q('#rwNow',sheet)||q('.live-now',sheet),clock=q('.live-clock',now);if(!now||!clock)return;
 const remaining=parseClock(clock.textContent);if(remaining===null)return;
 const sig=currentSignature(sheet);if(sig!==reminder.sig){reminder={sig,fired:false,max:remaining}}
 else reminder.max=Math.max(reminder.max??remaining,remaining);
 if(!reminder.fired&&(reminder.max??0)>=threshold+2&&remaining<=threshold&&remaining>0){reminder.fired=true;speakReminder(reminderMessage(sheet,threshold))}
}
function refresh(){
 setupSpeech();
 const sheet=activeSheet();
 document.querySelectorAll('#rwVoice,#liveVoice').forEach(enhanceSelect);
 syncSession(sheet);
 if(!sheet)return;
 ensureTotal(sheet);
 const total=q('#r42LiveTotal',sheet);if(total)total.textContent=fmt(elapsedTotal());
 tickReminder(sheet);
}
new MutationObserver(()=>requestAnimationFrame(refresh)).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('change',e=>{if(e.target?.matches?.('#rwVoice,#liveVoice'))setTimeout(refresh,0)},true);
setInterval(refresh,250);
setupSpeech();
setTimeout(refresh,350);
window.R42_LIVE_CONTROLS_V52={reminderSec,setReminder};
})();