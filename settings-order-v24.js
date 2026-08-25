(()=>{
function rank(el){
  if(el.id==='nutritionSettingsSection')return 10;
  if(el.id==='r42-household-cloud')return 20;
  if(el.id==='r42-account')return 80;
  const text=(el.textContent||'').toLowerCase();
  if(text.includes('garmin connect'))return 30;
  if(text.includes('partager rome42')||text.includes('groupe '))return 70;
  return 40;
}
function reorder(){
  const root=document.querySelector('#settings');
  if(!root||!root.children.length)return;
  const items=[...root.children];
  const ordered=items.map((el,i)=>({el,i,r:rank(el)})).sort((a,b)=>a.r-b.r||a.i-b.i).map(x=>x.el);
  if(ordered.every((el,i)=>el===items[i]))return;
  const frag=document.createDocumentFragment();ordered.forEach(el=>frag.appendChild(el));root.appendChild(frag);
}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;reorder()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest?.('nav button[data-v="settings"]'))setTimeout(reorder,50)},true);
setTimeout(reorder,900);
})();