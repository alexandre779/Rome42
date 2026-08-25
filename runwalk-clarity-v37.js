(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s);
function profileStrategy(){try{const p=JSON.parse(localStorage.getItem('rome42-profile-v2')||'null');return p&&window.R42_ENGINE?.strategy?window.R42_ENGINE.strategy(p):null}catch{return null}}
function ratioFrom(text){const s=String(text||'');let m=s.match(/(\d+)\s*min\s*de\s*course(?:\s+facile)?\s*\/\s*(\d+)\s*min\s*de\s*marche(?:\s+active)?/i);if(m)return{run:+m[1],walk:+m[2]};const st=profileStrategy();if(st?.type==='runwalk'&&st.runMin&&st.walkMin)return{run:+st.runMin,walk:+st.walkMin};return null}
function decorate(){
 const modal=q('#trainingDetail');
 if(!modal?.classList.contains('open'))return;
 const title=q('h2',modal)?.textContent||'';
 if(!/course\s*\/\s*marche|run\s*\/\s*walk/i.test(title))return;
 const rw=ratioFrom(title);if(!rw)return;
 const key=`${rw.run}-${rw.walk}-${title}`;
 if(modal.dataset.r42RunwalkClarity===key)return;
 modal.dataset.r42RunwalkClarity=key;
 const steps=q('.training-steps',modal);if(!steps)return;
 let alt=q('.r42-runwalk-ratio-step',steps);
 if(!alt){alt=document.createElement('div');alt.className='training-step main r42-runwalk-ratio-step';const first=q('.training-step',steps);first?.insertAdjacentElement('afterend',alt)}
 alt.innerHTML=`<small>ALTERNANCE À SUIVRE</small><b>${rw.run} min de course facile → ${rw.walk} min de marche active. Répète ce cycle dès le départ et pendant toute la séance.</b>`;
 [...steps.querySelectorAll('.training-step')].forEach(step=>{const label=q('small',step)?.textContent?.trim().toUpperCase();if(label==='COMMENT LE FAIRE'){const b=q('b',step);if(b)b.textContent=`Lance l’alternance dès la première minute : ${rw.run} min de course facile puis ${rw.walk} min de marche active. La marche est volontaire et planifiée, pas une pause prise quand tu es épuisé.`}});
 const tip=q('.ux-tip',modal);if(tip){const b=q('b',tip),p=q('p',tip);if(b)b.textContent='Repère de séance';if(p)p.textContent=`Reste facile sur les portions courues. Le bon ratio est celui que tu peux répéter proprement du premier au dernier cycle : aujourd’hui, ${rw.run}/${rw.walk}.`}
}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('click',()=>setTimeout(decorate,0),true);
setTimeout(decorate,700);
})();