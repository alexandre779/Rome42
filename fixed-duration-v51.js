(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s);
function patchParser(){
 const api=window.R42_SESSION_LIVE;if(!api?.parseSession||api.__fixedDurationV51)return false;
 const base=api.parseSession.bind(api);
 api.parseSession=function(training){
  const out=base(training);if(!out?.length)return out;const s=String(training||'');
  if(/fractionné/i.test(s)){
   const warm=s.match(/(?:fractionné\s*:\s*)?(\d+)\s*min\s+de\s+footing\s+facile/i),cool=s.match(/\+\s*(\d+)\s*min\s+de\s+footing\s+très\s+facile/i);
   if(warm&&out[0]){out[0].durationSec=+warm[1]*60;out[0].display=`${warm[1]} min`;out[0].cue=`Échauffement en footing facile, ${warm[1]} minutes`;}
   const last=out[out.length-1];if(cool&&last){last.durationSec=+cool[1]*60;last.display=`${cool[1]} min`;last.cue=`Retour au calme, ${cool[1]} minutes`;}
  }
  return out;
 };
 api.__fixedDurationV51=true;return true;
}
function patchModal(){
 const modal=q('#trainingDetail');if(!modal?.classList.contains('open'))return;const title=q('h2',modal)?.textContent||'';if(!/fractionné/i.test(title))return;
 const warm=title.match(/(?:fractionné\s*:\s*)?(\d+)\s*min\s+de\s+footing\s+facile/i),cool=title.match(/\+\s*(\d+)\s*min\s+de\s+footing\s+très\s+facile/i);
 [...modal.querySelectorAll('.training-step')].forEach(step=>{const label=q('small',step)?.textContent?.toUpperCase()||'',b=q('b',step);if(!b)return;if(label.includes('ÉCHAUFFEMENT')&&warm)b.textContent=`${warm[1]} min de footing très facile. Il s’agit bien de course à pied, à une allure volontairement lente.`;if(label.includes('RETOUR AU CALME')&&cool)b.textContent=`${cool[1]} min de footing très facile pour faire redescendre progressivement l’effort.`});
}
function run(){patchParser();patchModal()}
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;run()})}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
setTimeout(run,400);window.R42_FIXED_DURATION_V51={run};
})();