const STRAVA_AUTH='https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN='https://www.strava.com/oauth/token';
const STRAVA_DEAUTH='https://www.strava.com/oauth/deauthorize';
const STRAVA_API='https://api-v3.strava.com';
const FIREBASE_JWKS='https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

export default {
  async fetch(request,env){
    try{
      await ensureSchema(env.DB);
      const url=new URL(request.url),origin=allowedOrigin(request,env);
      if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
      if(url.pathname==='/api/strava/callback'&&request.method==='GET')return oauthCallback(url,env);
      if(url.pathname==='/api/strava/webhook')return webhook(request,url,env);
      const auth=await verifyFirebase(request,env);
      if(url.pathname==='/api/strava/connect-url'&&request.method==='GET')return connectUrl(url,auth,env,origin);
      if(url.pathname==='/api/strava/status'&&request.method==='GET')return json({connected:!!(await tokenRow(env.DB,auth.uid))},200,origin);
      if(url.pathname==='/api/strava/activities'&&request.method==='GET')return activities(url,auth,env,origin);
      if(url.pathname==='/api/strava/disconnect'&&request.method==='POST')return disconnect(auth,env,origin);
      return json({error:'Route inconnue.'},404,origin);
    }catch(err){
      const origin=allowedOrigin(request,env);
      return json({error:publicError(err)},err.status||500,origin);
    }
  }
};

function cors(origin){return {'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Cache-Control':'no-store'}}
function json(value,status=200,origin='https://alexandre779.github.io'){return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8',...cors(origin)}})}
function publicError(err){if(err?.status===401)return'Authentification Rome42 requise.';if(err?.status===403)return'Accès refusé.';console.error(err);return err?.message||'Erreur du connecteur Strava.'}
function fail(status,message){const e=new Error(message);e.status=status;throw e}
function allowedOrigin(request,env){const allowed=(env.ALLOWED_ORIGIN||'https://alexandre779.github.io').replace(/\/$/,'');const o=request.headers.get('Origin');return o===allowed?o:allowed}
function allowedReturn(value,env){try{const u=new URL(value),allowed=new URL(env.APP_URL||'https://alexandre779.github.io/Rome42/');if(u.origin!==allowed.origin||!u.pathname.startsWith(allowed.pathname.replace(/index\.html$/,'')))return allowed.href;u.hash='';return u.href}catch{return env.APP_URL||'https://alexandre779.github.io/Rome42/'}}

async function ensureSchema(db){
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS strava_tokens (uid TEXT PRIMARY KEY, athlete_id TEXT, access_token TEXT NOT NULL, refresh_token TEXT NOT NULL, expires_at INTEGER NOT NULL, scope TEXT, updated_at INTEGER NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS oauth_states (state TEXT PRIMARY KEY, uid TEXT NOT NULL, return_url TEXT NOT NULL, expires_at INTEGER NOT NULL)`)
  ]);
}
async function tokenRow(db,uid){return db.prepare('SELECT uid, athlete_id, access_token, refresh_token, expires_at, scope FROM strava_tokens WHERE uid=?').bind(uid).first()}

function b64urlBytes(input){input=input.replace(/-/g,'+').replace(/_/g,'/');while(input.length%4)input+='=';const bin=atob(input),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}
function b64(bytes){let s='';for(const x of bytes)s+=String.fromCharCode(x);return btoa(s)}
function unb64(s){const bin=atob(s),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}
function parseJwt(token){const [h,p,s]=token.split('.');if(!h||!p||!s)fail(401,'Jeton invalide.');return{header:JSON.parse(new TextDecoder().decode(b64urlBytes(h))),payload:JSON.parse(new TextDecoder().decode(b64urlBytes(p))),signed:new TextEncoder().encode(h+'.'+p),sig:b64urlBytes(s)}}
let jwksCache={at:0,value:null};
async function jwks(){if(jwksCache.value&&Date.now()-jwksCache.at<3600000)return jwksCache.value;const r=await fetch(FIREBASE_JWKS,{cf:{cacheTtl:3600}});if(!r.ok)throw Error('Impossible de vérifier le compte Rome42.');const v=await r.json();jwksCache={at:Date.now(),value:v};return v}
async function verifyFirebase(request,env){const h=request.headers.get('Authorization')||'',token=h.startsWith('Bearer ')?h.slice(7):'';if(!token)fail(401,'Jeton Rome42 manquant.');const j=parseJwt(token),project=env.FIREBASE_PROJECT_ID;if(!project)throw Error('FIREBASE_PROJECT_ID manquant.');if(j.header.alg!=='RS256'||!j.header.kid)fail(401,'Jeton Rome42 invalide.');const keys=await jwks(),key=keys.keys?.find(x=>x.kid===j.header.kid);if(!key)fail(401,'Clé Firebase inconnue.');const cryptoKey=await crypto.subtle.importKey('jwk',key,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);const ok=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',cryptoKey,j.sig,j.signed);if(!ok)fail(401,'Signature Firebase invalide.');const now=Math.floor(Date.now()/1000),p=j.payload;if(p.aud!==project||p.iss!==`https://securetoken.google.com/${project}`||!p.sub||p.exp<=now||p.iat>now+60)fail(401,'Jeton Firebase expiré ou invalide.');return{uid:p.sub}}

async function aesKey(env){const raw=unb64(env.TOKEN_ENCRYPTION_KEY||'');if(raw.byteLength!==32)throw Error('TOKEN_ENCRYPTION_KEY doit être une clé base64 de 32 octets.');return crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt'])}
async function encrypt(value,env){const iv=crypto.getRandomValues(new Uint8Array(12)),key=await aesKey(env),data=new TextEncoder().encode(value),enc=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,data));return `${b64(iv)}.${b64(enc)}`}
async function decrypt(value,env){const [ivs,cs]=String(value||'').split('.');if(!ivs||!cs)throw Error('Jeton chiffré invalide.');const key=await aesKey(env),out=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(ivs)},key,unb64(cs));return new TextDecoder().decode(out)}
function randomState(){return Array.from(crypto.getRandomValues(new Uint8Array(24)),x=>x.toString(16).padStart(2,'0')).join('')}

async function connectUrl(url,auth,env,origin){if(!env.STRAVA_CLIENT_ID||!env.PUBLIC_BASE_URL)throw Error('Configuration Strava incomplète.');const state=randomState(),returnUrl=allowedReturn(url.searchParams.get('return')||'',env),expires=Math.floor(Date.now()/1000)+600;await env.DB.prepare('INSERT OR REPLACE INTO oauth_states(state,uid,return_url,expires_at) VALUES(?,?,?,?)').bind(state,auth.uid,returnUrl,expires).run();const redirect=`${env.PUBLIC_BASE_URL.replace(/\/$/,'')}/api/strava/callback`;const a=new URL(STRAVA_AUTH);a.searchParams.set('client_id',env.STRAVA_CLIENT_ID);a.searchParams.set('response_type','code');a.searchParams.set('redirect_uri',redirect);a.searchParams.set('approval_prompt','auto');a.searchParams.set('scope','read,activity:read_all');a.searchParams.set('state',state);return json({url:a.href},200,origin)}

async function oauthCallback(url,env){const state=url.searchParams.get('state')||'',code=url.searchParams.get('code')||'',error=url.searchParams.get('error');const row=await env.DB.prepare('SELECT state,uid,return_url,expires_at FROM oauth_states WHERE state=?').bind(state).first();if(!row)return Response.redirect((env.APP_URL||'https://alexandre779.github.io/Rome42/')+'?strava=error',302);await env.DB.prepare('DELETE FROM oauth_states WHERE state=?').bind(state).run();if(row.expires_at<Math.floor(Date.now()/1000)||error||!code)return Response.redirect(withResult(row.return_url,'error'),302);const body=new URLSearchParams({client_id:env.STRAVA_CLIENT_ID,client_secret:env.STRAVA_CLIENT_SECRET,code,grant_type:'authorization_code'});const res=await fetch(STRAVA_TOKEN,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});if(!res.ok)return Response.redirect(withResult(row.return_url,'error'),302);const t=await res.json(),access=await encrypt(t.access_token,env),refresh=await encrypt(t.refresh_token,env),athleteId=String(t.athlete?.id||'');await env.DB.prepare(`INSERT INTO strava_tokens(uid,athlete_id,access_token,refresh_token,expires_at,scope,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET athlete_id=excluded.athlete_id,access_token=excluded.access_token,refresh_token=excluded.refresh_token,expires_at=excluded.expires_at,scope=excluded.scope,updated_at=excluded.updated_at`).bind(row.uid,athleteId,access,refresh,+t.expires_at||0,String(url.searchParams.get('scope')||''),Math.floor(Date.now()/1000)).run();return Response.redirect(withResult(row.return_url,'connected'),302)}
function withResult(base,result){const u=new URL(base);u.searchParams.set('strava',result);return u.href}

async function accessToken(uid,env){let row=await tokenRow(env.DB,uid);if(!row)fail(404,'Strava non connecté.');let access=await decrypt(row.access_token,env);if(+row.expires_at>Math.floor(Date.now()/1000)+120)return access;const refresh=await decrypt(row.refresh_token,env),body=new URLSearchParams({client_id:env.STRAVA_CLIENT_ID,client_secret:env.STRAVA_CLIENT_SECRET,grant_type:'refresh_token',refresh_token:refresh});const r=await fetch(STRAVA_TOKEN,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});if(!r.ok){if(r.status===401||r.status===400)await env.DB.prepare('DELETE FROM strava_tokens WHERE uid=?').bind(uid).run();fail(401,'La connexion Strava doit être renouvelée.')}const t=await r.json();access=t.access_token;await env.DB.prepare('UPDATE strava_tokens SET access_token=?,refresh_token=?,expires_at=?,updated_at=? WHERE uid=?').bind(await encrypt(t.access_token,env),await encrypt(t.refresh_token,env),+t.expires_at||0,Math.floor(Date.now()/1000),uid).run();return access}

async function activities(url,auth,env,origin){const token=await accessToken(auth.uid,env),after=Math.max(0,+url.searchParams.get('after')||0),before=Math.max(after,+url.searchParams.get('before')||0),per=Math.min(30,Math.max(1,+url.searchParams.get('per_page')||20));const a=new URL(STRAVA_API+'/athlete/activities');if(after)a.searchParams.set('after',String(after));if(before)a.searchParams.set('before',String(before));a.searchParams.set('per_page',String(per));a.searchParams.set('page','1');const r=await fetch(a,{headers:{Authorization:`Bearer ${token}`}});if(!r.ok){if(r.status===401)fail(401,'La connexion Strava doit être renouvelée.');throw Error('Impossible de lire les activités Strava.')}const rows=await r.json();const activities=(Array.isArray(rows)?rows:[]).map(x=>({id:x.id,name:x.name||'Activité Strava',distance:x.distance||0,moving_time:x.moving_time||0,elapsed_time:x.elapsed_time||0,type:x.type||'',sport_type:x.sport_type||x.type||'',start_date:x.start_date||'',start_date_local:x.start_date_local||'',average_speed:x.average_speed||0,strava_url:`https://www.strava.com/activities/${x.id}`}));return json({activities},200,origin)}

async function disconnect(auth,env,origin){const row=await tokenRow(env.DB,auth.uid);if(row){try{const token=await accessToken(auth.uid,env);await fetch(STRAVA_DEAUTH,{method:'POST',headers:{Authorization:`Bearer ${token}`}})}catch{}await env.DB.prepare('DELETE FROM strava_tokens WHERE uid=?').bind(auth.uid).run()}return json({ok:true},200,origin)}

async function webhook(request,url,env){if(request.method==='GET'){const mode=url.searchParams.get('hub.mode'),token=url.searchParams.get('hub.verify_token'),challenge=url.searchParams.get('hub.challenge');if(mode==='subscribe'&&token&&token===env.STRAVA_WEBHOOK_VERIFY_TOKEN)return new Response(JSON.stringify({'hub.challenge':challenge}),{headers:{'Content-Type':'application/json'}});return new Response('Forbidden',{status:403})}if(request.method==='POST'){let event={};try{event=await request.json()}catch{}if(event.object_type==='athlete'&&event.aspect_type==='update'&&event.updates?.authorized===false&&event.owner_id){await env.DB.prepare('DELETE FROM strava_tokens WHERE athlete_id=?').bind(String(event.owner_id)).run()}return new Response('OK',{status:200})}return new Response('Method not allowed',{status:405})}
