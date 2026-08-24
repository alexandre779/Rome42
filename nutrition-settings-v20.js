(()=>{
  const NP=window.R42_NUTRITION_PROFILE;
  if(!NP)return;

  // Configuration belongs in Settings, not in the daily Nutrition workflow.
  const style=document.createElement('style');
  style.textContent=`
    #nutrition .card:has(#npSave){display:none!important}
    #nutrition .card:has(.tag:first-child){ }
    .nutrition-settings-section{margin-top:16px}
    .nutrition-settings-summary>p{margin-bottom:14px}
    .nutrition-settings-details{margin-top:16px;border-top:1px solid rgba(92,58,48,.14);padding-top:8px}
    .nutrition-settings-details>summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 0;font-weight:800;color:#7b2530;list-style:none}
    .nutrition-settings-details>summary::-webkit-details-marker{display:none}
    .nutrition-settings-details[open]>summary span{transform:rotate(45deg)}
    .nutrition-settings-details>summary span{font-size:24px;transition:transform .18s ease}
    .embedded-settings-card{box-shadow:none!important;border:0!important;padding:10px 0 0!important;background:transparent!important}
  `;
  document.head.appendChild(style);

  function prefText(p){
    const a=[];
    if(p?.diet&&p.diet!=='omnivore')a.push(p.diet==='vegetarian'?'Végétarien':'Pescétarien');
    if(p?.dairyFree)a.push('Sans produits laitiers');
    if(p?.glutenFree)a.push('Sans gluten');
    if(p?.allergies)a.push('Allergies renseignées');
    if(p?.exclusions)a.push('Exclusions renseignées');
    return a.join(' · ')||'Aucune exclusion';
  }

  function cleanNutrition(){
    const nutrition=document.querySelector('#nutrition');
    if(!nutrition)return;
    nutrition.querySelectorAll('#npSave').forEach(save=>save.closest('.card')?.remove());
    [...nutrition.querySelectorAll('.card')].forEach(card=>{
      const tag=(card.querySelector('.tag')?.textContent||'').trim().toUpperCase();
      if(tag==='NUTRITION PERSONNALISÉE')card.remove();
    });
  }

  function buildSettings(){
    const settings=document.querySelector('#settings');
    if(!settings||settings.querySelector('#nutritionSettingsSection'))return;
    const p=NP.read();
    if(!p)return;
    const e=NP.estimate(p);
    const wrap=document.createElement('section');
    wrap.id='nutritionSettingsSection';
    wrap.className='nutrition-settings-section';
    wrap.innerHTML=`<div class="card nutrition-settings-summary"><span class="tag">NUTRITION</span><h2>Profil nutritionnel</h2><p class="muted">Paramètres utilisés pour adapter tes portions, tes menus et les quantités du foyer.</p>${e?`<div class="grid"><div class="metric"><small>Repère quotidien</small><br><b>≈ ${e.target} kcal</b></div><div class="metric"><small>Préférences</small><br><b>${prefText(p)}</b></div></div>`:''}<details class="nutrition-settings-details"><summary>Modifier mon profil <span>+</span></summary><div class="nutrition-settings-form">${NP.setupCard()}</div></details></div>`;
    const first=settings.querySelector('.card');
    if(first)first.insertAdjacentElement('afterend',wrap);else settings.prepend(wrap);
    const nested=wrap.querySelector('.nutrition-settings-form > .card');
    if(nested){
      nested.classList.add('embedded-settings-card');
      nested.querySelector('.tag')?.remove();
      nested.querySelector('h2')?.remove();
    }
    NP.bindSetup();
  }

  function apply(){cleanNutrition();buildSettings()}
  new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('click',e=>{
    if(e.target.closest?.('nav button[data-v="nutrition"],nav button[data-v="settings"]'))setTimeout(apply,20);
  },true);
  apply();
})();