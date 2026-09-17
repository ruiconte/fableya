import { jsonRequest, required } from './db.mjs';
import { escapeHtml, safeUrl, copy } from './content.mjs';

export function distributionPayload(post) {
  const d=post.document,t=copy[post.language],url=`https://fableya.com/blog/${post.slug}`;
  // A disclosed short excerpt points back to the original rather than duplicating the entire article.
  const paragraphs=[t.disclosure,d.introduction,...d.sections[0].paragraphs.slice(0,1)];
  const mdEscape=s=>s.replace(/[\\`*_{}\[\]<>]/g,'\\$&');
  return {url,title:d.title,
    html:paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join('')+`<p><a href="${escapeHtml(url)}">${escapeHtml(d.title)} — Fableya</a></p>`,
    markdown:paragraphs.map(mdEscape).join('\n\n')+`\n\n[${mdEscape(d.title)} — Fableya](${url})`,
  };
}

export async function sendDelivery(delivery,env=process.env,fetcher=fetch) {
  const allowed=(env.SEO_DESTINATIONS??'').split(',').map(v=>v.trim());
  if(!allowed.includes(delivery.destination)) throw new Error('Destination désactivée dans SEO_DESTINATIONS');
  const payload=distributionPayload(delivery.snapshot);
  if(delivery.destination==='wordpress') {
    const base=required('SEO_WORDPRESS_URL',env).replace(/\/$/,'');
    if(!safeUrl(base)) throw new Error('URL WordPress HTTPS invalide');
    const result=await jsonRequest(`${base}/wp-json/wp/v2/posts`,{
      method:'POST',redirect:'error',
      headers:{Authorization:`Basic ${Buffer.from(`${required('SEO_WORDPRESS_USER',env)}:${required('SEO_WORDPRESS_APP_PASSWORD',env)}`).toString('base64')}`,'Content-Type':'application/json'},
      body:JSON.stringify({title:payload.title,content:payload.html,status:'publish',slug:`fableya-${delivery.post_id}-${delivery.revision}`}),
    },fetcher);
    if(!safeUrl(result?.link)) throw new Error('WordPress ne retourne pas d’URL : vérifier le compte distant');
    return result.link;
  }
  if(delivery.destination==='dev') {
    const result=await jsonRequest('https://dev.to/api/articles',{
      method:'POST',redirect:'error',headers:{'api-key':required('SEO_DEV_API_KEY',env),'Content-Type':'application/json','Accept':'application/vnd.forem.api-v1+json'},
      body:JSON.stringify({article:{title:payload.title,body_markdown:payload.markdown,canonical_url:payload.url,published:true}}),
    },fetcher);
    if(!safeUrl(result?.url)) throw new Error('DEV ne retourne pas d’URL : vérifier le compte distant');
    return result.url;
  }
  throw new Error('Destination inconnue');
}

export async function distributeDue(db,env=process.env,fetcher=fetch) {
  let ok=true;
  for(let i=0;i<3;i++) {
    const [delivery]=await db.rpc('seo_claim_delivery',{});
    if(!delivery) break;
    try {
      const url=await sendDelivery(delivery,env,fetcher);
      await db.patch(`seo_deliveries?id=eq.${delivery.id}&status=eq.running`,{status:'succeeded',remote_url:url,finished_at:new Date().toISOString()});
    } catch(error) {
      ok=false;
      // An HTTP timeout is ambiguous. Never resend automatically or claim failure means no publication.
      await db.patch(`seo_deliveries?id=eq.${delivery.id}&status=eq.running`,{status:'unknown',error:`${error.message}. Vérifier le compte distant avant une nouvelle publication.`,finished_at:new Date().toISOString()});
    }
  }
  return ok;
}
