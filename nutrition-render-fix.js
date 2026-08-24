(()=>{
const N=()=>window.R42_NUTRITION;
const NP=()=>window.R42_NUTRITION_PROFILE;
const BASE={A:2650,B:2650,C:2600,D:2700,F:2750,G:2850,H:2700,I:2700,J:2650,K:2750,L:2650,M:2700,N:2750};
function scale(code){try{const p=NP()?.read?.(),e=NP()?.estimate?.(p);return e?.target?Math.max(.65,Math.min(1.35,e.target/(BASE[code]||2700))):1}catch{return 1}}
function fmt(q,u){if(u==='g'&&q>=1000)return(q/1000).toFixed(1).replace('.0','').replace('.',',')+' kg';if(u==='ml'&&q>=1000)return(q/1000).toFixed(1).replace('.0','').replace('.',',')+' L';return`${Math.max(1,Math.round(q/10)*10)} ${u}`}
function summary(code,part){const rows=N()?.lib?.[code]?.[part]?.ingredients||[],f=scale(code);return rows.slice(0,4).map(([name,q,u])=>`${name}${typeof q==='number'?' '+fmt(q*f,u):''}`).join(' · ')}
function weekNumber(block){const t=block.querySelector('.nutrition-week-head b')?.textContent||'';const m=t.match(/Semaine\s+(\d+)/i);return m?+m[1]:null}
function apply(){
  const box=document.querySelector('#nutrition'); if(!box)return;
  const weeks=window.APP_DATA?.weeks||[];
  box.querySelectorAll('.nutrition-week').forEach(block=>{
    const wn=weekNumber(block),w=weeks.find(x=>x.week===wn); if(!w)return;
    block.querySelectorAll('.menu-day').forEach((dayEl,di)=>{
      const code=w.days?.[di]?.menu; if(!code||!N()?.lib?.[code])return;
      const tag=dayEl.querySelector('.menu-day-head .tag'); if(tag){tag.textContent='Repas du jour';tag.classList.add('menu-friendly-tag')}
      dayEl.querySelectorAll('.recipe-open[data-part]').forEach(card=>{
        const part=card.dataset.part,m=N().meal(code,part); if(!m)return;
        card.dataset.code=code;
        const img=card.querySelector('img'); if(img){img.src=m.photo;img.alt=m.name}
        const body=card.querySelector('.meal-body'); if(body){
          const b=body.querySelector('b'); if(b)b.textContent=m.name;
          const smalls=body.querySelectorAll('small'); if(smalls[1])smalls[1].textContent=summary(code,part);
        }
      });
    });
  });
  setTimeout(()=>window.R42_SHOPPING_V2?.render?.(),30);
}
let timer;const schedule=()=>{clearTimeout(timer);timer=setTimeout(apply,40)};
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('change',e=>{if(e.target?.closest?.('#nutrition'))setTimeout(apply,0)});
document.addEventListener('click',e=>{if(e.target?.closest?.('nav button[data-v="nutrition"]'))setTimeout(apply,80)},true);
setTimeout(apply,500);
window.R42_NUTRITION_RENDER_FIX={apply};
})();