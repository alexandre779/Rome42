(()=>{
let pending=false;
function run(){
 const root=document.querySelector('#today');if(!root)return;
 const hero=root.querySelector('.smart-today')||root.querySelector('.card:not(.danger):not(.alert)');if(!hero)return;
 root.querySelectorAll('.ux-today-card').forEach(x=>{if(x!==hero)x.classList.remove('ux-today-card')});hero.classList.add('ux-today-card');
 const daily=[...root.querySelectorAll('.ux-daily')];if(daily.length){const keep=daily[0];if(!hero.contains(keep))hero.appendChild(keep);daily.slice(1).forEach(x=>x.remove())}
 root.querySelectorAll('.ux-session-btn').forEach(x=>x.remove());
 const cta=hero.querySelector('.today-cta');if(cta){const span=cta.querySelector('span');if(span)span.textContent='Comprendre la séance';else cta.textContent='Comprendre la séance →'}
 const previews=[...root.querySelectorAll('.r42-session-preview')];if(previews.length){const keep=previews[0];if(!hero.contains(keep))hero.appendChild(keep);previews.slice(1).forEach(x=>x.remove())}
}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;run()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest?.('nav button[data-v="today"]'))setTimeout(run,80)},true);
setTimeout(run,650);
window.R42_TODAY_SESSION_FIX={run};
})();