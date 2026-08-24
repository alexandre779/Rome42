(()=>{
function roundNumber(v,unit){
  const u=String(unit||'').toLowerCase();
  if(u.startsWith('pièce')) return Math.max(1,Math.round(v));
  if(u==='g'||u==='ml'){
    const step=v<50?5:10;
    return Math.max(step,Math.round(v/step)*step);
  }
  if(u==='kg'||u==='l') return Math.round(v*10)/10;
  return Math.round(v*10)/10;
}
function pretty(v,unit){
  const n=roundNumber(v,unit);
  const u=String(unit||'');
  if(u.toLowerCase().startsWith('pièce')) return `${n} ${n>1?'pièces':'pièce'}`;
  return `${String(n).replace('.',',')} ${u}`;
}
function roundText(text){
  return String(text||'').replace(/(\d+(?:[.,]\d+)?)\s*(pièces?|g|ml|kg|L)\b/gi,(m,num,unit)=>{
    const v=parseFloat(num.replace(',','.'));
    return Number.isFinite(v)?pretty(v,unit):m;
  });
}
function apply(root=document){
  root.querySelectorAll?.('.recipe-pad li b,.meal-body small').forEach(el=>{
    const before=el.textContent;
    const after=roundText(before);
    if(after!==before)el.textContent=after;
  });
}
const obs=new MutationObserver(muts=>{
  for(const m of muts){
    m.addedNodes.forEach(n=>{if(n.nodeType===1)apply(n)});
  }
});
obs.observe(document.body,{childList:true,subtree:true});
window.addEventListener('load',()=>apply());
setTimeout(()=>apply(),400);
window.R42_NUTRITION_ROUNDING={roundNumber,roundText};
})();