// Cloudflare Worker scaffold. Configure only with values supplied by Garmin after approval.
const cors={'Access-Control-Allow-Origin':'*'};
const j=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json',...cors}});
export default{async fetch(req,env){const u=new URL(req.url);
if(u.pathname==='/health')return j({ok:true,garminConfigured:!!(env.GARMIN_CLIENT_ID&&env.GARMIN_AUTH_URL)});
if(u.pathname==='/api/garmin/connect'){if(!env.GARMIN_CLIENT_ID||!env.GARMIN_AUTH_URL||!env.GARMIN_REDIRECT_URI)return j({ok:false,error:'Garmin credentials not configured'},503);const x=new URL(env.GARMIN_AUTH_URL);x.searchParams.set('response_type','code');x.searchParams.set('client_id',env.GARMIN_CLIENT_ID);x.searchParams.set('redirect_uri',env.GARMIN_REDIRECT_URI);if(env.GARMIN_SCOPE)x.searchParams.set('scope',env.GARMIN_SCOPE);x.searchParams.set('state',crypto.randomUUID());return Response.redirect(x.toString(),302)}
if(u.pathname==='/api/garmin/callback')return j({ok:false,error:'Callback ready to complete after Garmin approval using the exact portal contract.'},501);return j({ok:true,service:'rome42-garmin'})}};