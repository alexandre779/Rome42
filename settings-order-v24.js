(()=>{
'use strict';
const ROOT='#settings';
const GROUP_GAP='26px';

function meta(el){
  if(el.querySelector?.('#redo,#share'))return{rank:10,group:'plan'};
  if(el.id==='r42-training-profile-card')return{rank:20,group:'plan'};
  if(el.id==='nutritionSettingsSection')return{rank:30,group:'nutrition'};
  if(el.id==='r42-kitchen-settings')return{rank:40,group:'nutrition'};
  if(el.id==='r42-household-cloud')return{rank:50,group:'foyer'};
  if(el.id==='r42-account')return{rank:60,group:'foyer'};
  if(el.id==='r42-strava')return{rank:90,group:'integrations'};
  const text=(el.textContent||'').toLowerCase();
  if(text.includes('strava'))return{rank:90,group:'integrations'};
  if(text.includes('garmin connect'))return{rank:95,group:'integrations'};
  return{rank:70,group:'other'};
}

function decorate(items){
  let previousGroup='';
  items.forEach((el,i)=>{
    const {group}=meta(el);
    el.classList.remove('r42-settings-group-start');
    el.style.removeProperty('--r42-settings-group-gap');
    if(i>0&&group!==previousGroup){
      el.classList.add('r42-settings-group-start');
      el.style.setProperty('--r42-settings-group-gap',GROUP_GAP);
    }
    previousGroup=group;
  });
}

function ensureStyle(){
  if(document.querySelector('#r42-settings-order-style'))return;
  const s=document.createElement('style');
  s.id='r42-settings-order-style';
  s.textContent=`#settings>.r42-settings-group-start{margin-top:var(--r42-settings-group-gap,26px)!important}`;
  document.head.appendChild(s);
}

function reorder(){
  const root=document.querySelector(ROOT);
  if(!root||!root.children.length)return;
  ensureStyle();
  const items=[...root.children];
  const ordered=items.map((el,i)=>({el,i,...meta(el)})).sort((a,b)=>a.rank-b.rank||a.i-b.i).map(x=>x.el);
  if(!ordered.every((el,i)=>el===items[i])){
    const frag=document.createDocumentFragment();
    ordered.forEach(el=>frag.appendChild(el));
    root.appendChild(frag);
  }
  decorate(ordered);
  root.dataset.settingsOrder='v48';
}

let pending=false;
function schedule(){
  if(pending)return;
  pending=true;
  requestAnimationFrame(()=>{pending=false;reorder()});
}

const root=document.querySelector(ROOT);
if(root)new MutationObserver(schedule).observe(root,{childList:true});
document.addEventListener('click',e=>{
  if(e.target.closest?.('nav button[data-v="settings"]'))[30,140,420,900].forEach(ms=>setTimeout(reorder,ms));
},true);
window.addEventListener('pageshow',()=>setTimeout(reorder,250));
setTimeout(reorder,700);
})();