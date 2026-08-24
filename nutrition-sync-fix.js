(()=>{
function bind(){
  const btn=document.querySelector('#npSave');
  if(!btn||btn.dataset.cloudSyncBound)return;
  btn.dataset.cloudSyncBound='1';
  btn.onclick=async()=>{
    const NP=window.R42_NUTRITION_PROFILE;
    if(!NP)return;
    const p=NP.read()||{};
    Object.assign(p,{
      age:+npAge.value||null,
      sex:npSex.value,
      heightCm:+npHeight.value||null,
      weightKg:+npWeight.value||null,
      nutritionGoal:npGoal.value,
      mealsPerDay:+npMeals.value||3,
      diet:npdiet.value,
      dairyFree:npdairy.checked,
      glutenFree:npgluten.checked,
      allergies:npallergies.value.trim(),
      exclusions:npexclude.value.trim()
    });
    NP.write(p);
    try{
      if(window.R42_CLOUD?.sync) await R42_CLOUD.sync();
      if(window.R42_HOUSEHOLD_CLOUD?.refreshHouseholdCache) await R42_HOUSEHOLD_CLOUD.refreshHouseholdCache();
    }catch(e){console.warn('Rome42 nutrition sync',e)}
    location.reload();
  };
}
new MutationObserver(bind).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(bind,500);
})();