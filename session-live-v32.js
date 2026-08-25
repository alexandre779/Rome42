(()=>{
const q=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const VOICE_KEY='r42-live-voice-v1';
let live=null,timer=null,wake=null,decorating=false;
const profile=()=>{try{return JSON.parse(localStorage.getItem('rome42-profile-v2')||'null')}catch{return null}};
const strategy=()=>{const p=profile();try{return p&&window.R42_ENGINE?.strategy?R42_ENGINE.strategy(p):null}catch{return null}};
const voiceMode=()=>localStorage.getItem(VOICE_KEY)||'normal';
const fmtClock=s=>{s=Math.max(0,Math.round(s));const m=Math.floor(s/60),r=s%60;return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`};
const seg=(label,kind,durationSec,display,cue,detail)=>({label,kind,durationSec:Number.isFinite(durationSec)?durationSec:null,display:display||'',cue:cue||label,detail:detail||''});
function parseMinutesToken(token){const s=String(token||'').trim();let m=s.match(/^(\d+)\s*h(?:\s*(\d+)\s*min)?$/i);if(m)return(+m[1]*60+(+m[2]||0))*60;m=s.match(/^(\d+)\s*min$/i);return m?+m[1]*60:null}
function easyLabel(){return strategy()?.type==='runwalk'?'Course/marche très facile':'Footing très facile'}
function parseSession(training){
 const s=String(training||'').replace(/\s+/g,' ').trim(),low=s.toLowerCase(),out=[];
 if(!s||/repos complet|repos \/ mobilité|renforcement|vtt/.test(low)||(low.includes('marche')&&!low.includes('course/marche')&&!low.includes('run/walk')))return null;
 const add=(...a)=>out.push(seg(...a));
 if(low.includes('fartlek')){
   const warm=s.match(/(\d+)\s*min[^+]*facile/i), reps=s.match(/(\d+)\s*[×x]\s*(\d+)\s*min[^/]*\/\s*(\d+)\s*min/i);
   add('Échauffement','easy',(+(warm?.[1]||15))*60,`${warm?.[1]||15} min`,`${easyLabel()}, ${warm?.[1]||15} minutes`,'Respiration confortable, conversation possible.');
   const n=+(reps?.[1]||6),fast=+(reps?.[2]||1),rec=+(reps?.[3]||2);
   for(let i=1;i<=n;i++){add(`Soutenu ${i}/${n}`,'work',fast*60,`${fast} min`,'Course soutenue','Plus rapide que le footing, mais contrôlé : pas un sprint.');add(`Récupération ${i}/${n}`,'recovery',rec*60,`${rec} min`,'Récupération très facile','Trottine très lentement ou marche selon ta stratégie.');}
   add('Retour au calme','easy',null,'jusqu’à respiration calme','Retour au calme','Ralentis franchement et termine sans accélération.');
   return out;
 }
 if(low.includes('côte')){
   const warm=s.match(/(\d+)\s*min[^+]*facile/i),reps=s.match(/(\d+)\s*[×x]\s*(\d+)\s*s/i),cool=s.match(/\+\s*(\d+)\s*min[^+]*facile\s*$/i);
   add('Échauffement','easy',(+(warm?.[1]||15))*60,`${warm?.[1]||15} min`,`${easyLabel()}, ${warm?.[1]||15} minutes`,'Reste très relâché.');
   const n=+(reps?.[1]||6),sec=+(reps?.[2]||45);
   for(let i=1;i<=n;i++){add(`Côte ${i}/${n}`,'work',sec,`${sec} s`,'Course en côte','RPE 6 environ : soutenu, propre, jamais sprint maximal.');add(`Descente ${i}/${n}`,'recovery',null,'descente complète','Récupération en descente','Marche ou trottine jusqu’au point de départ, puis lance la répétition suivante.');}
   add('Retour au calme','easy',cool?+cool[1]*60:null,cool?`${cool[1]} min`:'jusqu’à respiration calme','Retour au calme','Footing très facile.');
   return out;
 }
 if(low.includes('fractionné')){
   const warm=s.match(/(\d+)\s*[–-]\s*(\d+)\s*min[^+]*facile/i),reps=s.match(/(\d+)\s*[×x]\s*(\d+(?:[,.]\d+)?)\s*km/i),rec=s.match(/récup\s*(\d+)\s*min/i),cool=s.match(/\+\s*(\d+)\s*[–-]\s*(\d+)\s*min[^+]*facile/i);
   add('Échauffement','easy',null,warm?`${warm[1]}–${warm[2]} min`:'15–20 min','Échauffement en footing facile','Quand tu te sens chaud et relâché, passe au bloc suivant.');
   const n=+(reps?.[1]||4),km=reps?.[2]||'1',r=+(rec?.[1]||2);
   for(let i=1;i<=n;i++){add(`Fraction ${i}/${n}`,'work',null,`${km} km`,'Bloc rapide','Cours la distance prévue à l’allure indiquée dans la séance, puis touche « Bloc suivant ».');if(i<n)add(`Récupération ${i}/${n-1}`,'recovery',r*60,`${r} min`,'Récupération en trot très lent','Tu dois réellement récupérer.');}
   add('Retour au calme','easy',null,cool?`${cool[1]}–${cool[2]} min`:'10–15 min','Retour au calme','Footing très facile.');
   return out;
 }
 if(low.includes('spécifique marathon')||low.includes('allure marathon')){
   const warm=s.match(/(\d+)\s*min[^+]*facile/i), reps=s.match(/(\d+)\s*[×x]\s*(\d+)\s*[–-]\s*(\d+)\s*min[^+]*allure marathon/i)||s.match(/(\d+)\s*[×x]\s*(\d+)\s*min[^+]*marathon/i), rec=s.match(/récup\s*(\d+)\s*min/i), dist=s.match(/(\d+)\s*[×x]\s*(\d+)\s*km[^+]*allure marathon/i);
   add('Échauffement','easy',(+(warm?.[1]||15))*60,`${warm?.[1]||15} min`,`${easyLabel()}, ${warm?.[1]||15} minutes`,'Commence très confortablement.');
   if(dist){const n=+dist[1],km=+dist[2];for(let i=1;i<=n;i++){add(`Allure marathon ${i}/${n}`,'marathon',null,`${km} km`,'Allure marathon','Tiens l’effort prévu pour le marathon, sans forcer.');if(i<n)add(`Récupération ${i}/${n-1}`,'recovery',null,'1 km facile','Récupération facile','Footing nettement plus lent.')}}
   else {const n=+(reps?.[1]||3),lo=+(reps?.[2]||10),hi=+(reps?.[3]||lo),r=+(rec?.[1]||3);for(let i=1;i<=n;i++){add(`Allure marathon ${i}/${n}`,'marathon',lo===hi?lo*60:null,lo===hi?`${lo} min`:`${lo}–${hi} min`,'Allure marathon','Reste contrôlé et régulier.');if(i<n)add(`Récupération ${i}/${n-1}`,'recovery',r*60,`${r} min`,'Récupération très facile','Footing très lent ou marche active selon ta stratégie.')}}
   add('Retour au calme','easy',null,'jusqu’à respiration calme','Retour au calme','Termine très facile, sans ajouter de travail.');return out;
 }
 const long=s.match(/sortie longue\s+((?:\d+\s*h\s*)?(?:\d+\s*min)?)/i);
 if(long&&long[1].trim()){
   const dur=parseMinutesToken(long[1].trim());
   add('Sortie longue','long',dur,long[1].trim(),'Sortie longue','Endurance facile RPE 3–4. Pars plus lentement que ton envie du moment.');return out;
 }
 const exact=s.match(/(?:footing|course\/marche|run\/walk)[^\d]*(\d+)\s*min\b/i),range=s.match(/(?:footing|course\/marche|run\/walk)[^\d]*(\d+)\s*[–-]\s*(\d+)\s*min/i);
 if(range){add(low.includes('course/marche')||low.includes('run/walk')?'Course / marche':'Footing','easy',null,`${range[1]}–${range[2]} min`,easyLabel(),'RPE 3–4 sauf indication contraire. Arrête dans la fourchette prévue selon les sensations.');return out}
 if(exact){add(low.includes('course/marche')||low.includes('run/walk')?'Course / marche':'Footing','easy',+exact[1]*60,`${exact[1]} min`,easyLabel(),'RPE 3–4 sauf indication contraire.');return out}
 return null;
}
function timelineHtml(segments,active=-1){
 if(!segments?.length)return'';const timed=segments.reduce((a,x)=>a+(x.durationSec||60),0)||1;
 return `<div class="live-timeline" aria-label="Déroulé visuel de la séance">${segments.map((x,i)=>{const w=Math.max(6,Math.round((x.durationSec||60)/timed*100));return `<div class="live-seg ${esc(x.kind)} ${i===active?'is-active':''}" style="--w:${w}" title="${esc(x.label+' · '+x.display)}"><span>${esc(x.label)}</span><b>${esc(x.display)}</b></div>`}).join('')}</div>`;
}
function findModalDay(){const modal=q('#trainingDetail');if(!modal)return null;const title=modal.querySelector('h2')?.textContent?.trim(),tag=modal.querySelector('.tag')?.textContent||'',wm=tag.match(/Semaine\s+(\d+)/i);if(!title||!wm||typeof window.plan!=='function')return null;const w=window.plan().find(x=>x.week===+wm[1]);return w?.days?.find(d=>d.training===title)?{...w.days.find(d=>d.training===title),week:w.week,phase:w.phase}:null}
function currentDay(){try{return typeof window.cur==='function'?window.cur():null}catch{return null}}
function previewFor(day,root){const segments=parseSession(day?.training);if(!segments?.length||root.querySelector('.r42-session-preview'))return;const p=document.createElement('div');p.className='r42-session-preview';p.innerHTML=`<div class="session-preview-head"><small>DÉROULÉ DE LA SÉANCE</small><b>${segments.length} bloc${segments.length>1?'s':''}</b></div>${timelineHtml(segments)}<button type="button" class="btn r42-live-launch">Démarrer la séance en direct</button>`;root.appendChild(p);p.querySelector('.r42-live-launch').onclick=e=>{e.stopPropagation();start(day)} }
function decorate(){if(decorating)return;decorating=true;try{
 const d=currentDay(),today=q('#today');if(d&&today){const card=today.querySelector('.ux-today-card')||today.querySelector('.card');if(card)previewFor(d,card)}
 const modal=q('#trainingDetail');if(modal?.classList.contains('open')&&!modal.querySelector('.r42-live-modal')){const day=findModalDay(),segments=parseSession(day?.training);if(day&&segments?.length){const target=modal.querySelector('.training-meta')||modal.querySelector('h2');const box=document.createElement('div');box.className='r42-live-modal';box.innerHTML=`<div class="session-preview-head"><small>SÉANCE INTERACTIVE</small><b>Visualise chaque bloc avant de partir</b></div>${timelineHtml(segments)}<button type="button" class="btn r42-live-launch">Démarrer la séance en direct</button>`;target.insertAdjacentElement('afterend',box);box.querySelector('button').onclick=()=>start(day)}}
 }finally{decorating=false}}
function speak(text,force=false){const mode=voiceMode();if((mode==='off'&&!force)||!('speechSynthesis'in window)||!window.SpeechSynthesisUtterance)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='fr-FR';u.rate=.96;speechSynthesis.speak(u)}catch{}}
function vibrate(){try{navigator.vibrate?.([120,70,120])}catch{}}
async function requestWake(){if(!live?.running||!navigator.wakeLock?.request)return;try{wake=await navigator.wakeLock.request('screen')}catch{wake=null}}
async function releaseWake(){try{await wake?.release()}catch{}wake=null}
function elapsedSegment(){if(!live)return 0;const end=live.running?Date.now():(live.segmentPausedAt||Date.now());return Math.max(0,(end-live.segmentStartedAt-live.segmentPausedMs)/1000)}
function elapsedSession(){if(!live)return 0;const end=live.running?Date.now():(live.sessionPausedAt||Date.now());return Math.max(0,(end-live.sessionStartedAt-live.sessionPausedMs)/1000)}
function liveLayer(){let layer=q('#r42LiveLayer');if(!layer){layer=document.createElement('div');layer.id='r42LiveLayer';layer.className='r42-live-layer';document.body.appendChild(layer)}return layer}
function currentSeg(){return live?.segments?.[live.index]||null}
function next(){if(!live)return;const wasRunning=live.running;live.index++;live.warned30=false;live.segmentStartedAt=Date.now();live.segmentPausedMs=0;live.segmentPausedAt=wasRunning?null:Date.now();if(live.index>=live.segments.length){finish();return}const s=currentSeg();vibrate();speak(`${s.label}. ${s.cue}`);renderLive()}
function finish(){if(!live)return;live.running=false;clearInterval(timer);timer=null;releaseWake();vibrate();speak('Séance terminée. Bravo. Retour au calme et compte-rendu quand tu es prêt.');const elapsed=elapsedSession();const day=live.day,layer=liveLayer();layer.innerHTML=`<section class="r42-live-sheet finished"><small>ROAD TO ROME · SÉANCE TERMINÉE</small><h2>Bien joué.</h2><div class="live-finish-time">${fmtClock(elapsed)}</div><p>Le guidage est terminé. Renseigne maintenant ton ressenti pour garder une trace utile de la séance.</p><button type="button" class="btn" id="liveToReport">Ouvrir mon compte-rendu</button><button type="button" class="btn secondary" id="liveClose">Fermer</button></section>`;layer.classList.add('open');q('#liveToReport').onclick=()=>{closeLive();document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));q('#today')?.classList.add('active');window.scrollTo({top:0,behavior:'smooth'})};q('#liveClose').onclick=closeLive;live={...live,day,finished:true}}
function togglePause(){if(!live||live.finished)return;const now=Date.now();if(live.running){live.running=false;live.segmentPausedAt=now;live.sessionPausedAt=now;releaseWake();speak('Séance en pause')}else{live.running=true;live.segmentPausedMs+=now-(live.segmentPausedAt||now);live.sessionPausedMs+=now-(live.sessionPausedAt||now);live.segmentPausedAt=null;live.sessionPausedAt=null;requestWake();speak('Reprise')}renderLive()}
function closeLive(){clearInterval(timer);timer=null;releaseWake();if('speechSynthesis'in window)try{speechSynthesis.cancel()}catch{}q('#r42LiveLayer')?.classList.remove('open');document.body.classList.remove('r42-live-open');live=null}
function renderLive(){if(!live||live.finished)return;const s=currentSeg(),e=elapsedSegment(),remaining=s.durationSec?Math.max(0,s.durationSec-e):null,layer=liveLayer(),mode=voiceMode(),nextSeg=live.segments[live.index+1];layer.innerHTML=`<section class="r42-live-sheet"><div class="live-top"><div><small>ROME42 · SÉANCE EN DIRECT</small><b>${esc(live.day.training)}</b></div><button type="button" class="live-x" aria-label="Fermer">×</button></div>${timelineHtml(live.segments,live.index)}<div class="live-now ${esc(s.kind)}"><small>BLOC ${live.index+1}/${live.segments.length}</small><h2>${esc(s.label)}</h2><div class="live-clock">${remaining===null?fmtClock(e):fmtClock(remaining)}</div><strong>${esc(s.display)}</strong><p>${esc(s.detail)}</p></div><div class="live-next"><small>ENSUITE</small><b>${nextSeg?esc(nextSeg.label+' · '+nextSeg.display):'Fin de séance'}</b></div><div class="live-controls"><button type="button" class="btn secondary" id="livePause">${live.running?'Pause':'Reprendre'}</button><button type="button" class="btn" id="liveNext">${s.durationSec?'Passer le bloc':'Bloc suivant →'}</button></div><label class="live-voice">Guidage vocal<select id="liveVoice"><option value="off" ${mode==='off'?'selected':''}>Muet</option><option value="normal" ${mode==='normal'?'selected':''}>Normal · changements de blocs</option><option value="guided" ${mode==='guided'?'selected':''}>Guidé · + rappel à 30 s</option></select></label><p class="live-tech">${navigator.wakeLock?.request?'Écran maintenu éveillé pendant la séance.':'Garde l’écran actif : le verrouillage automatique peut interrompre le guidage sur cet appareil.'}</p></section>`;layer.classList.add('open');document.body.classList.add('r42-live-open');q('.live-x').onclick=()=>{if(confirm('Quitter la séance en direct ? Le compte-rendu ne sera pas marqué comme terminé.'))closeLive()};q('#livePause').onclick=togglePause;q('#liveNext').onclick=next;q('#liveVoice').onchange=e=>{localStorage.setItem(VOICE_KEY,e.target.value);if(e.target.value!=='off')speak('Guidage vocal activé',true)} }
function tick(){if(!live?.running||live.finished)return;const s=currentSeg(),e=elapsedSegment();if(s?.durationSec){const remaining=s.durationSec-e;if(voiceMode()==='guided'&&!live.warned30&&remaining<=30&&remaining>28){live.warned30=true;speak('30 secondes restantes')}if(remaining<=0){next();return}}renderLive()}
function start(day){const segments=parseSession(day?.training);if(!segments?.length)return;const now=Date.now();live={day,segments,index:0,running:true,finished:false,sessionStartedAt:now,sessionPausedMs:0,sessionPausedAt:null,segmentStartedAt:now,segmentPausedMs:0,segmentPausedAt:null,warned30:false};q('#trainingDetail')?.classList.remove('open');renderLive();speak(`${segments[0].label}. ${segments[0].cue}`);vibrate();requestWake();clearInterval(timer);timer=setInterval(tick,500)}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&live?.running)requestWake()});
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;decorate()})}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(decorate,500);window.R42_SESSION_LIVE={start,parseSession,timelineHtml};
})();