(()=>{
const C=window.ROME42_FIREBASE_CONFIG;
if(!C||!window.firebase)return;
const app=firebase.apps.length?firebase.app():firebase.initializeApp(C);
const auth=firebase.auth();
const db=firebase.firestore();
const KEYS=['rome42-v1','rome42-settings-v1','rome42-profile-v2','rome42-nutrition-profile-v1','rome42-household-v2'];
let user=null,hydrating=false,syncTimer=null;
const parse=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const payload=()=>({
  profile:parse('rome42-profile-v2'),
  state:parse('rome42-v1'),
  settings:parse('rome42-settings-v1'),
  nutritionProfile:parse('rome42-nutrition-profile-v1'),
  household:parse('rome42-household-v2'),
  updatedAt:firebase.firestore.FieldValue.serverTimestamp()
});
const doc=()=>user?db.collection('users').doc(user.uid):null;
async function push(){if(!user||hydrating)return;try{await doc().set(payload(),{merge:true})}catch(e){console.warn('Rome42 sync:',e.code||e.message)}}
function schedule(){clearTimeout(syncTimer);syncTimer=setTimeout(push,500)}
const nativeSet=Storage.prototype.setItem;
Storage.prototype.setItem=function(k,v){nativeSet.call(this,k,v);if(this===localStorage&&KEYS.includes(k))schedule()};
function hasLocalProfile(){return !!parse('rome42-profile-v2')}
async function hydrate(){if(!user)return;hydrating=true;try{
  const snap=await doc().get();
  if(snap.exists){const d=snap.data();
    const map={'rome42-profile-v2':d.profile,'rome42-v1':d.state,'rome42-settings-v1':d.settings,'rome42-nutrition-profile-v1':d.nutritionProfile,'rome42-household-v2':d.household};
    const cloudHasProfile=!!d.profile;
    if(cloudHasProfile){Object.entries(map).forEach(([k,v])=>{if(v!==undefined&&v!==null)nativeSet.call(localStorage,k,JSON.stringify(v))});}
    else if(hasLocalProfile()) await doc().set(payload(),{merge:true});
  }else{await doc().set({...payload(),email:user.email,createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});}
 }finally{hydrating=false}
}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function authUI(){let el=document.getElementById('r42-auth');if(el)return el;el=document.createElement('div');el.id='r42-auth';el.innerHTML=`<div class="auth-shell"><div class="auth-logo">ROME<span>42</span></div><p class="auth-kicker">ROAD TO ROME · MMXXVII</p><h2 id="auth-title">Se connecter</h2><p class="auth-copy">Ton plan et tes données restent associés à ton compte, même si tu changes de téléphone.</p><form id="auth-form"><label>Adresse e-mail</label><input id="auth-email" type="email" autocomplete="email" required><label>Mot de passe</label><input id="auth-password" type="password" autocomplete="current-password" minlength="6" required><button class="btn" type="submit">Se connecter</button></form><button class="auth-switch" id="auth-switch">Créer un compte Rome42</button><p id="auth-error" class="auth-error"></p></div>`;document.body.appendChild(el);let signup=false;const title=el.querySelector('#auth-title'),form=el.querySelector('#auth-form'),sw=el.querySelector('#auth-switch'),err=el.querySelector('#auth-error'),pass=el.querySelector('#auth-password');sw.onclick=()=>{signup=!signup;title.textContent=signup?'Créer mon compte':'Se connecter';form.querySelector('button').textContent=signup?'Créer mon compte':'Se connecter';sw.textContent=signup?'J’ai déjà un compte':'Créer un compte Rome42';pass.autocomplete=signup?'new-password':'current-password';err.textContent=''};form.onsubmit=async e=>{e.preventDefault();err.textContent='';const email=el.querySelector('#auth-email').value.trim(),password=pass.value;try{if(signup)await auth.createUserWithEmailAndPassword(email,password);else await auth.signInWithEmailAndPassword(email,password)}catch(x){const msgs={'auth/email-already-in-use':'Cette adresse possède déjà un compte.','auth/invalid-credential':'E-mail ou mot de passe incorrect.','auth/weak-password':'Choisis un mot de passe d’au moins 6 caractères.','auth/invalid-email':'Adresse e-mail invalide.'};err.textContent=msgs[x.code]||'Connexion impossible. Réessaie.'}};return el}
function injectAccount(){const settings=document.querySelector('#settings');if(!settings||!user)return;if(settings.querySelector('#r42-account'))return;const card=document.createElement('div');card.className='card';card.id='r42-account';card.innerHTML=`<span class="tag">COMPTE ROME42</span><h2>Synchronisation active</h2><p class="muted">${esc(user.email)}</p><p class="muted small">Ton profil et tes données personnelles sont synchronisés avec ton compte.</p><button class="btn secondary" id="r42-sync-now">Synchroniser maintenant</button><button class="btn secondary" id="r42-logout">Se déconnecter</button>`;settings.prepend(card);card.querySelector('#r42-sync-now').onclick=async()=>{await push();alert('Synchronisation terminée.')};card.querySelector('#r42-logout').onclick=()=>auth.signOut()}
new MutationObserver(injectAccount).observe(document.documentElement,{subtree:true,childList:true});
auth.onAuthStateChanged(async u=>{user=u;if(!u){authUI();return}const overlay=document.getElementById('r42-auth');if(overlay)overlay.remove();await hydrate();injectAccount();if(!sessionStorage.getItem('r42-cloud-ready')){sessionStorage.setItem('r42-cloud-ready','1');location.reload()}else{push()}});
window.R42_CLOUD={auth,db,sync:push,currentUser:()=>user};
})();