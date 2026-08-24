(()=>{
  const NP=window.R42_NUTRITION_PROFILE;
  if(!NP)return;
  let busy=false;
  function prefText(p){
    const a=[];
    if(p?.diet&&p.diet!=='omnivore')a.push(p.diet==='vegetarian'?'Végétarien':'Pescétarien');
    if(p?.dairyFree)a.push('Sans produits laitiers');
    if(p?.glutenFree)a.push('Sans gluten');
    if(p?.allergies)a.push('Allergies renseignées');
    if(p?.exclusions)a.push('Exclusions renseignées');
    return a.join(' · ')||'Aucune exclusion';
  }
  function apply(){
    if(busy)return; busy=true;
    try{
      const nutrition=document.querySelector('#nutrition');
      const settings=document.querySelector('#settings');
      if(!nutrition||!settings)return;

      // Nutrition is a consumption screen: menus first, configuration elsewhere.
      [...nutrition.querySelectorAll('.card')].forEach(card=>{
        const h=(card.querySelector('h2,h3')?.textContent||'').trim().toLowerCase();
        if(h==='mon profil nutritionnel'||card.querySelector('#npSave')) card.remove();
        else if(card.querySelector('.tag')?.textContent?.trim()==='NUTRITION PERSONNALISÉE') card.remove();
      });

      if(!settings.querySelector('#nutritionSettingsSection')){
        const p=NP.read();
        if(p){
          const e=NP.estimate(p);
          const wrap=document.createElement('section');
          wrap.id='nutritionSettingsSection';
          wrap.className='nutrition-settings-section';
          wrap.innerHTML=`<div class="card nutrition-settings-summary"><span class="tag">NUTRITION</span><h2>Profil nutritionnel</h2><p class="muted">Tes besoins, préférences alimentaires et exclusions sont configurés ici. La page Nutrition reste dédiée aux menus et aux courses.</p>${e?`<div class="grid"><div class="metric"><small>Repère quotidien</small><br><b>≈ ${e.target} kcal</b></div><div class="metric"><small>Préférences</small><br><b>${prefText(p)}</b></div></div>`:''}<details class="nutrition-settings-details"><summary>Modifier mon profil <span>+</span></summary><div class="nutrition-settings-form">${NP.setupCard()}</div></details></div>`;
          const first=settings.querySelector('.card');
          if(first) first.insertAdjacentElement('afterend',wrap); else settings.prepend(wrap);
          const nested=wrap.querySelector('.nutrition-settings-form > .card');
          if(nested){nested.classList.add('embedded-settings-card');nested.querySelector('.tag')?.remove();nested.querySelector('h2')?.remove();}
          NP.bindSetup();
        }
      }
    } finally {busy=false;}
  }
  const mo=new MutationObserver(()=>requestAnimationFrame(apply));
  mo.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('click',e=>{
    if(e.target.closest?.('nav button[data-v="nutrition"],nav button[data-v="settings"]')) setTimeout(apply,40);
  },true);
  setTimeout(apply,100);
})();