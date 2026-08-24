(()=>{
function addLegend(){const today=document.querySelector('#today');if(!today)return;const cards=[...today.querySelectorAll('.card')];const card=cards.find(c=>c.querySelector('#rpe'));if(!card||card.querySelector('.report-legend'))return;
const h=card.querySelector('h3');if(!h)return;
const box=document.createElement('div');box.className='report-legend';box.innerHTML=`<p><b>Comment noter ta séance ?</b></p><div class="report-scale"><span><b>RPE</b> = effort ressenti</span><small>0 repos · 3 facile · 5 modéré · 7 difficile · 10 maximal</small></div><div class="report-scale"><span><b>Douleur</b> = intensité ressentie par zone</span><small>0 aucune · 1–2 légère · 3 vigilance · 4+ importante</small></div><p class="report-hint">Note ton ressenti global sur la séance, pas uniquement les dernières minutes.</p>`;
h.insertAdjacentElement('afterend',box);
}
const obs=new MutationObserver(()=>requestAnimationFrame(addLegend));obs.observe(document.body,{childList:true,subtree:true});window.addEventListener('load',addLegend);setTimeout(addLegend,250);
})();