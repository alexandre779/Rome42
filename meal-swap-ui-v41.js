(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s);
let lastCard=null,timer=null,busy=false;
function ensureStyle(){
 if(q('#r42SwapStableStyle'))return;
 const s=document.createElement('style');s.id='r42SwapStableStyle';s.textContent=`#nutrition .r42-swap{display:none!important}.r42-day-swap-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 2px}.r42-day-swap-actions button{min-height:42px;border:1px solid rgba(117,30,42,.18);border-radius:12px;background:#f5e7e5;color:#751e2a;font-size:12px;font-weight:850;padding:9px 8px}.r42-day-swap-actions button:active{transform:scale(.98)}@media(max-width:390px){.r42-day-swap-actions{grid-template-columns:1fr}.r42-day-swap-actions button{min-height:40px}}`;
 document.head.appendChild(s)
}
function sourceFor(card){
 window.R42_MEAL_SWAP?.decorate?.();
 return q('.r42-swap',card)
}
function launch(card){
 if(!card)return;lastCard=card;const src=sourceFor(card);if(src){src.click();return}
 setTimeout(()=>{const retry=sourceFor(card);if(retry)retry.click()},80)
}
function addDayActions(day){
 const grid=q('.meal-grid',day);if(!grid||q('.r42-day-swap-actions',day))return;
 const lunch=q('.recipe-open[data-part="lunch"]',day),dinner=q('.recipe-open[data-part="dinner"]',day);if(!lunch&&!dinner)return;
 const bar=document.createElement('div');bar.className='r42-day-swap-actions';
 if(lunch){const b=document.createElement('button');b.type='button';b.textContent='Changer le déjeuner';b.dataset.part='lunch';b.onclick=e=>{e.preventDefault();e.stopPropagation();launch(lunch)};bar.appendChild(b)}
 if(dinner){const b=document.createElement('button');b.type='button';b.textContent='Changer le dîner';b.dataset.part='dinner';b.onclick=e=>{e.preventDefault();e.stopPropagation();launch(dinner)};bar.appendChild(b)}
 grid.insertAdjacentElement('afterend',bar)
}
function addModalAction(){
 const modal=q('#recipeModal.open');if(!modal||!lastCard||q('.r42-modal-swap',modal))return;
 const pad=q('.recipe-pad',modal);if(!pad)return;
 const b=document.createElement('button');b.type='button';b.className='btn secondary r42-modal-swap';b.textContent='Remplacer cette recette';b.style.marginTop='18px';
 b.onclick=e=>{e.preventDefault();e.stopPropagation();modal.classList.remove('open');setTimeout(()=>launch(lastCard),60)};pad.appendChild(b)
}
function reconcile(){
 if(busy)return;busy=true;try{ensureStyle();window.R42_MEAL_SWAP?.decorate?.();document.querySelectorAll('#nutrition .menu-day').forEach(addDayActions);addModalAction()}finally{busy=false}
}
function schedule(delay=90){clearTimeout(timer);timer=setTimeout(reconcile,delay)}
new MutationObserver(()=>schedule()).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',e=>{const card=e.target.closest?.('#nutrition .recipe-open[data-part]');if(card)lastCard=card;if(e.target.closest?.('nav button[data-v="nutrition"]')){[60,180,450,900].forEach(ms=>setTimeout(reconcile,ms))}},true);
document.addEventListener('r42:meal-swapped',()=>setTimeout(reconcile,80));
window.addEventListener('pageshow',()=>setTimeout(reconcile,250));
setTimeout(reconcile,700);
window.R42_MEAL_SWAP_UI={fix:reconcile,reconcile};
})();