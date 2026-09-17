import { createSign } from 'node:crypto';
import { jsonRequest, required } from './db.mjs';

const isoDay = (d) => d.toISOString().slice(0,10);
export async function syncMetrics(db, env = process.env, fetcher = fetch) {
  const account = JSON.parse(required('GSC_SERVICE_ACCOUNT_JSON', env));
  const site = required('GSC_SITE_URL', env);
  const now = Math.floor(Date.now()/1000);
  const b64 = (v) => Buffer.from(JSON.stringify(v)).toString('base64url');
  const unsigned = `${b64({ alg:'RS256',typ:'JWT' })}.${b64({ iss:account.client_email,
    scope:'https://www.googleapis.com/auth/webmasters.readonly', aud:'https://oauth2.googleapis.com/token', iat:now, exp:now+3600 })}`;
  const assertion = `${unsigned}.${createSign('RSA-SHA256').update(unsigned).sign(account.private_key,'base64url')}`;
  const { access_token } = await jsonRequest('https://oauth2.googleapis.com/token', {
    method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }).toString(),
  }, fetcher);
  const end = new Date(Date.now()-3*86400_000), start = new Date(end.getTime()-27*86400_000);
  const query = (body) => jsonRequest(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method:'POST', headers:{ Authorization:`Bearer ${access_token}`, 'Content-Type':'application/json' },
    body:JSON.stringify({ startDate:isoDay(start),endDate:isoDay(end),dataState:'final',type:'web',...body }),
  }, fetcher);
  // Page/day (without query dimension) avoids confusing anonymized-query omissions with page totals.
  for (let offset=0; offset<250_000; offset+=25000) {
    const data = await query({ dimensions:['date','page'],rowLimit:25000,startRow:offset,
      dimensionFilterGroups:[{ filters:[{ dimension:'page',operator:'contains',expression:'/blog/' }] }] });
    const rows = data.rows ?? [];
    for(let i=0;i<rows.length;i+=500) await db.insert('seo_metrics?on_conflict=day,page', rows.slice(i,i+500).map(r=>({
      day:r.keys[0],page:r.keys[1],clicks:r.clicks,impressions:r.impressions,ctr:r.ctr,position:r.position,synced_at:new Date().toISOString(),
    })), 'resolution=merge-duplicates,return=minimal');
    if(rows.length<25000) break;
    if(offset===225000) throw new Error('Rapport trop volumineux : fractionner la période GSC');
  }
  const queries = await query({ dimensions:['query'],rowLimit:1000 });
  if(queries.rows?.length) await db.insert('seo_queries?on_conflict=query', queries.rows.map(r=>({
    query:r.keys[0],clicks:r.clicks,impressions:r.impressions,position:r.position,synced_at:new Date().toISOString(),
  })), 'resolution=merge-duplicates,return=minimal');
  return { start:isoDay(start),end:isoDay(end) };
}
