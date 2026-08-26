(()=>{
const q=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const VOICE_KEY='r42-live-voice-v1';
let live=null,timer=null,wake=null,wakeRetry=null;
const voiceMode=()=>localStorage.getItem(VOICE_KEY)||'normal';
const fmtClock=s=>{s=Math.max(0,Math.round(s));const m=Math.floor(s/60),r=s%60;return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`};
function speechText(text){
 return String(text||'')
  .replace(/(\d+(?:[.,]\d+)?)\s*(?:min|mn)\b/gi,(_,raw)=>{const v=parseFloat(raw.replace(',','.'));if(!Number.isFinite(v))return _;let whole=Math.floor(v),sec=Math.round((v-whole)*60);if(sec===60){whole++;sec=0}if(!whole)return `${sec} seconde${sec===1?'':'s'}`;if(!sec)return `${whole} minute${whole===1?'':'s'}`;return `${whole} minute${whole===1?'':'s'} ${sec} seconde${sec===1?'':'s'}`})
  .replace(/(\d+(?:[.,]\d+)?)\s*s\b/gi,(_,raw)=>{const v=Math.round(parseFloat(raw.replace(',','.')));return Number.isFinite(v)?`${v} seconde${v===1?'':'s'}`:_});
}
function speak(text,force=false){const mode=voiceMode();if((mode==='off'&&!force)||!('speechSynthesis'in window)||!window.SpeechSynthesisUtterance)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(speechText(text));u.lang='fr-FR';u.rate=.96;speechSynthesis.speak(u)}catch{}}
function vibrate(){try{navigator.vibrate?.([120,70,120])}catch{}}
function findDayForLaunch(btn){
 if(btn?.closest('#trainingDetail')){const modal=btn.closest('#trainingDetail'),title=modal.querySelector('h2')?.textContent?.trim(),tag=modal.querySelector('.tag')?.textContent||'',wm=tag.match(/Semaine\s+(\d+)/i);if(title&&wm&&typeof window.plan==='function'){const w=window.plan().find(x=>x.week===+wm[1]),d=w?.days?.find(x=>x.training===title);if(d)return{...d,week:w.week,phase:w.phase}}}
 try{return typeof window.cur==='function'?window.cur():null}catch{return null}
}
function currentSeg(){return live?.segments?.[live.index]||null}
function setWakeStatus(status){if(live)live.wakeStatus=status;const el=q('#r42LiveLayer .live-tech');if(!el)return;el.textContent=status==='active'?'Anti-veille actif · l’écran doit rester allumé.':status==='unsupported'?'Anti-veille non disponible sur ce navigateur : le chrono rattrapera le temps écoulé si l’écran se verrouille.':status==='denied'?'Anti-veille refusé par le téléphone (mode économie d’énergie ou réglage système possible). Le chrono rattrapera le temps écoulé au retour.':'Activation de l’anti-veille…'}
async function acquireWake(){
 if(!live?.running||live.finished||document.visibilityState!=='visible')return false;
 if(!navigator.wakeLock?.request){setWakeStatus('unsupported');return false}
 if(wake&&!wake.released){setWakeStatus('active');return true}
 try{
  const sentinel=await navigator.wakeLock.request('screen');wake=sentinel;setWakeStatus('active');
  sentinel.addEventListener('release',()=>{if(wake===sentinel)wake=null;if(live?.running&&!live.finished){setWakeStatus('released');clearTimeout(wakeRetry);wakeRetry=setTimeout(()=>acquireWake(),1200)}});
  return true;
 }catch{wake=null;setWakeStatus('denied');clearTimeout(wakeRetry);wakeRetry=setTimeout(()=>acquireWake(),5000);return false}
}
async function releaseWake(){clearTimeout(wakeRetry);wakeRetry=null;try{await wake?.release()}catch{}wake=null}
function elapsedSession(){if(!live)return 0;const end=live.running?Date.now():(live.pauseAt||Date.now());return Math.max(0,(end-live.sessionStartedAt-live.pausedMs)/1000)}
function segmentElapsed(){if(!live)return 0;const end=live.running?Date.now():(live.pauseAt||Date.now());return Math.max(0,(end-live.segmentStartedAt-live.segmentPausedMs)/1000)}
function layer(){let el=q('#r42LiveLayer');if(!el){el=document.createElement('div');el.id='r42LiveLayer';el.className='r42-live-layer';document.body.appendChild(el)}return el}
function wakeCopy(){if(live?.wakeStatus==='active')return'Anti-veille actif · l’écran doit rester allumé.';if(live?.wakeStatus==='unsupported')return'Anti-veille non disponible sur ce navigateur : le chrono rattrapera le temps écoulé si l’écran se verrouille.';if(live?.wakeStatus==='denied')return'Anti-veille refusé par le téléphone (mode économie d’énergie ou réglage système possible). Le chrono rattrapera le temps écoulé au retour.';return'Activation de l’anti-veille…'}
function render(){if(!live||live.finished)return;const s=currentSeg(),now=Date.now(),remaining=s.durationSec?Math.max(0,(live.segmentEndAt-now)/1000):null,nextSeg=live.segments[live.index+1],mode=voiceMode(),el=layer(),timeline=window.R42_SESSION_LIVE?.timelineHtml?window.R42_SESSION_LIVE.timelineHtml(live.segments,live.index):'';el.innerHTML=`<section class="r42-live-sheet"><div class="live-top"><div><small>ROME42 · SÉANCE EN DIRECT</small><b>${esc(live.day.training)}</b></div><button type="button" class="live-x" aria-label="Fermer">×</button></div>${timeline}<div class="live-now ${esc(s.kind)}"><small>BLOC ${live.index+1}/${live.segments.length}</small><h2>${esc(s.label)}</h2><div class="live-clock">${remaining===null?fmtClock(segmentElapsed()):fmtClock(remaining)}</div><strong>${esc(s.display)}</strong><p>${esc(s.detail)}</p></div><div class="live-next"><small>ENSUITE</small><b>${nextSeg?esc(nextSeg.label+' · '+nextSeg.display):'Fin de séance'}</b></div><div class="live-controls"><button type="button" class="btn secondary" id="livePause">${live.running?'Pause':'Reprendre'}</button><button type="button" class="btn" id="liveNext">${s.durationSec?'Passer le bloc':'Bloc suivant →'}</button></div><label class="live-voice">Guidage vocal<select id="liveVoice"><option value="off" ${mode==='off'?'selected':''}>Muet</option><option value="normal" ${mode==='normal'?'selected':''}>Normal · changements + rappel à 15 s</option><option value="guided" ${mode==='guided'?'selected':''}>Guidé · rappels à 30 s et 15 s</option></select></label><p class="live-tech">${wakeCopy()}</p></section>`;el.classList.add('open');document.body.classList.add('r42-live-open');q('#r42LiveLayer .live-x').onclick=()=>{if(confirm('Quitter la séance en direct ? Le compte-rendu ne sera pas marqué comme terminé.'))close()};q('#r42LiveLayer #livePause').onclick=togglePause;q('#r42LiveLayer #liveNext').onclick=()=>advance(false,0);q('#r42LiveLayer #liveVoice').onchange=e=>{localStorage.setItem(VOICE_KEY,e.target.value);if(e.target.value!=='off')speak('Guidage vocal activé',true)}}
function announceCurrent(){const s=currentSeg();if(!s)return;vibrate();speak(`${s.label}. ${s.cue}`)}
function advance(auto=false,carryMs=0){if(!live)return;live.index++;live.warned30=false;live.warned15=false;if(live.index>=live.segments.length){finish();return}const now=Date.now(),s=currentSeg();live.segmentStartedAt=now-carryMs;live.segmentPausedMs=0;live.segmentEndAt=s.durationSec?live.segmentStartedAt+s.durationSec*1000:null;if(!auto||document.visibilityState==='visible')announceCurrent();render()}
function finish(){if(!live)return;live.running=false;live.finished=true;clearInterval(timer);timer=null;releaseWake();vibrate();speak('Séance terminée. Bravo. Retour au calme et compte-rendu quand tu es prêt.');const el=layer(),elapsed=elapsedSession();el.innerHTML=`<section class="r42-live-sheet finished"><small>ROAD TO ROME · SÉANCE TERMINÉE</small><h2>Bien joué.</h2><div class="live-finish-time">${fmtClock(elapsed)}</div><p>Le guidage est terminé. Renseigne maintenant ton ressenti pour garder une trace utile de la séance.</p><button type="button" class="btn" id="liveToReport">Ouvrir mon compte-rendu</button><button type="button" class="btn secondary" id="liveClose">Fermer</button></section>`;el.classList.add('open');q('#liveToReport').onclick=()=>{close();document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));q('#today')?.classList.add('active');window.scrollTo({top:0,behavior:'smooth'})};q('#liveClose').onclick=close}
function togglePause(){if(!live||live.finished)return;const now=Date.now();if(live.running){live.running=false;live.pauseAt=now;releaseWake();speak('Séance en pause')}else{const paused=now-live.pauseAt;live.running=true;live.pausedMs+=paused;live.segmentPausedMs+=paused;if(live.segmentEndAt)live.segmentEndAt+=paused;live.pauseAt=null;acquireWake();speak('Reprise')}render()}
function close(){clearInterval(timer);timer=null;releaseWake();if('speechSynthesis'in window)try{speechSynthesis.cancel()}catch{}q('#r42LiveLayer')?.classList.remove('open');document.body.classList.remove('r42-live-open');live=null}
function tick(){
 if(!live?.running||live.finished)return;let s=currentSeg(),now=Date.now(),guard=0;
 while(s?.durationSec&&live.segmentEndAt&&now>=live.segmentEndAt&&guard++<50){const carry=now-live.segmentEndAt;advance(true,carry);if(!live||live.finished)return;s=currentSeg();now=Date.now()}
 if(!s)return;
 const remaining=s.durationSec?Math.max(0,(live.segmentEndAt-Date.now())/1000):null;
 if(s.durationSec&&remaining!==null){
  if(voiceMode()==='guided'&&!live.warned30&&remaining<=30.5&&remaining>=28.5){live.warned30=true;speak('30 secondes restantes')}
  if(voiceMode()!=='off'&&!live.warned15&&remaining<=15.5&&remaining>=13.5){live.warned15=true;speak('15 secondes restantes')}
 }
 const clock=q('#r42LiveLayer .live-clock');if(clock)clock.textContent=remaining===null?fmtClock(segmentElapsed()):fmtClock(remaining);
 if((!wake||wake.released)&&document.visibilityState==='visible')acquireWake();
}
function start(day){const parser=window.R42_SESSION_LIVE?.parseSession,segments=parser?.(day?.training);if(!segments?.length)return;close();const now=Date.now(),first=segments[0];live={day,segments,index:0,running:true,finished:false,sessionStartedAt:now,pausedMs:0,pauseAt:null,segmentStartedAt:now,segmentPausedMs:0,segmentEndAt:first.durationSec?now+first.durationSec*1000:null,warned30:false,warned15:false,wakeStatus:'pending'};q('#trainingDetail')?.classList.remove('open');render();announceCurrent();acquireWake();timer=setInterval(tick,400)}
document.addEventListener('click',e=>{const btn=e.target.closest?.('.r42-live-launch');if(!btn)return;const day=findDayForLaunch(btn);if(!day)return;e.preventDefault();e.stopImmediatePropagation();start(day)},true);
document.addEventListener('visibilitychange',()=>{if(!live?.running||live.finished)return;if(document.visibilityState==='visible'){acquireWake();tick();const s=currentSeg();if(s)speak(`Reprise du guidage. ${s.label}. ${s.cue}`)}else{wake=null}});
window.addEventListener('pageshow',()=>{if(live?.running&&!live.finished){acquireWake();tick()}});
window.addEventListener('focus',()=>{if(live?.running&&!live.finished)acquireWake()});
setInterval(()=>{if(live?.running&&!live.finished&&document.visibilityState==='visible'&&(!wake||wake.released))acquireWake()},10000);
setTimeout(()=>{if(window.R42_SESSION_LIVE)window.R42_SESSION_LIVE.start=start},0);
window.R42_SESSION_LIVE_V50={start,speechText,acquireWake};
})();