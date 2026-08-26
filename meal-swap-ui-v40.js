(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s);
let busy=false,lastCard=null;
function styleButton(btn){
  btn.textContent='Remplacer cette recette';
  btn.setAttribute('aria-label','Remplacer cette recette par une autre proposition');
  btn.style.cssText='display:flex;align-items:center;justify-content:center;width:calc(100% - 20px);margin:4px 10px 12px;padding:10px 12px;border:1px solid rgba(117,30,42,.18);border-radius:12px;background:#f5e7e5;color:#751e2a;font-size:12px;font-weight:850;line-height:1.2;position:relative;z-index:4;cursor:pointer';
}
function fix(){
  if(busy)return;busy=true;
  try{
    window.R42_MEAL_SWAP?.decorate?.();
    document.querySelectorAll('#nutrition .recipe-open[data-part]').forEach(card=>{
      const btn=q('.r42-swap',card);if(!btn)return;
      styleButton(btn);
      const body=q('.meal-body',card);
      if(body&&btn.parentElement!==body)body.insertAdjacentElement('afterend',btn);
      if(!card.dataset.r42SwapTracked){
        card.dataset.r42SwapTracked='1';
        card.addEventListener('click',()=>{lastCard=card},true);
      }
    });
    const modal=q('#recipeModal.open');
    if(modal&&lastCard&&!q('.r42-modal-swap',modal)){
      const source=q('.r42-swap',lastCard);
      const pad=q('.recipe-pad',modal);
      if(source&&pad){
        const b=document.createElement('button');b.type='button';b.className='btn secondary r42-modal-swap';b.textContent='Remplacer cette recette';b.style.marginTop='18px';
        b.onclick=e=>{e.preventDefault();e.stopPropagation();modal.classList.remove('open');setTimeout(()=>source.click(),60)};
        pad.appendChild(b);
      }
    }
  }finally{busy=false}
}
let t;function schedule(){clearTimeout(t);t=setTimeout(fix,120)}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',e=>{const card=e.target.closest?.('#nutrition .recipe-open[data-part]');if(card)lastCard=card;if(e.target.closest?.('nav button[data-v="nutrition"]'))[80,250,600].forEach(ms=>setTimeout(fix,ms))},true);
document.addEventListener('r42:meal-swapped',()=>setTimeout(fix,80));
setTimeout(fix,900);
window.R42_MEAL_SWAP_UI={fix};
})();