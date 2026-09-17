import { database, requireAdmin, uuid } from './db.mjs';
import { validateDocument, LANGUAGES, similar, markdown } from './content.mjs';

const fail = (message, status=400) => { throw Object.assign(new Error(message),{status}); };
const version = (n) => { if(!Number.isInteger(n) || n<1) fail('Version invalide');return n; };
const stamp = () => new Date().toISOString();
const allowedStatuses = ['review','approved','scheduled','published','archived'];
async function monthUsage(db, since) {
  const rows=[];
  // Supabase caps each response to 1,000 rows even if a larger limit is requested.
  for(let offset=0;offset<3000;offset+=1000) {
    const batch=await db.get(`seo_usage?select=created_at,stage,status,input_tokens,output_tokens&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc,id&limit=1000&offset=${offset}`);
    rows.push(...batch);if(batch.length<1000) break;
  }
  return rows;
}

export function adminHandler(dbFactory = database) {
  return async (req,res) => {
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Robots-Tag','noindex');
    try {
      if(!['GET','POST'].includes(req.method)) fail('Méthode non autorisée',405);
      const db = dbFactory();
      const user = await requireAdmin(req,db);
      if(req.method==='GET') {
        if(req.query.id) {
          const [draft] = await db.get(`seo_drafts?id=eq.${uuid(req.query.id)}`);
          if(!draft) fail('Brouillon introuvable',404);
          if(req.query.export==='markdown') return res.status(200).json({ markdown:markdown(draft.document,`https://fableya.com/blog/${draft.document.slug}`,draft.language) });
          return res.status(200).json({draft});
        }
        const page = Math.max(0,Math.min(10000,Number(req.query.page)||0));
        const status = allowedStatuses.includes(req.query.status) ? `&status=eq.${req.query.status}` : '';
        const month = new Date();month.setUTCDate(1);month.setUTCHours(0,0,0,0);
        const since = new Date(Date.now()-31*86400_000).toISOString().slice(0,10);
        const [settings,drafts,jobs,posts,usage,metrics,events,deliveries] = await Promise.all([
          db.get('seo_settings?id=eq.true'),
          db.get(`seo_drafts?select=id,topic,language,status,version,created_at,publish_at,audit&order=created_at.desc&limit=25&offset=${page*25}${status}`),
          db.get('seo_jobs?order=created_at.desc&limit=30'),
          db.get('blog_posts?select=id,slug,language,revision,updated_at,document->>title&order=updated_at.desc&limit=100'),
          monthUsage(db,month.toISOString()),
          db.get(`seo_metrics?day=gte.${since}&order=day.desc&limit=1000`),
          db.get('seo_events?order=created_at.desc&limit=30'),
          db.get('seo_deliveries?select=id,post_id,destination,status,remote_url,error,created_at&order=created_at.desc&limit=50'),
        ]);
        return res.status(200).json({settings:settings[0],drafts,jobs,posts,usage,metrics,events,deliveries,page});
      }
      const body = typeof req.body==='string' ? JSON.parse(req.body) : req.body;
      if(!body || JSON.stringify(body).length>130000) fail('Requête invalide ou trop volumineuse');
      const action = body.action;
      if(action==='settings') {
        const s = body.settings;
        if(!s || typeof s.enabled!=='boolean' || !LANGUAGES.includes(s.language)) fail('Réglages invalides');
        for(const [key,min,max] of [['daily_articles',0,3],['daily_api_calls',1,100],['monthly_api_calls',1,3000]]) {
          if(!Number.isInteger(s[key]) || s[key]<min || s[key]>max) fail(`Limite invalide : ${key}`);
        }
        if(typeof s.seeds!=='string' || s.seeds.length<5 || s.seeds.length>4000 || typeof s.product_facts!=='string' || s.product_facts.length>10000) fail('Brief invalide');
        await db.patch('seo_settings?id=eq.true',{enabled:s.enabled,language:s.language,daily_articles:s.daily_articles,daily_api_calls:s.daily_api_calls,monthly_api_calls:s.monthly_api_calls,seeds:s.seeds,product_facts:s.product_facts,updated_at:stamp()});
      } else if(action==='enqueue') {
        if(!['generate','refresh','metrics'].includes(body.kind)) fail('Type de tâche invalide');
        const topic = String(body.topic??'').trim();
        if(topic.length>250 || (topic && topic.length<5)) fail('Sujet : 5 à 250 caractères');
        if(!LANGUAGES.includes(body.language)) fail('Langue invalide');
        const due = body.due_at ? new Date(body.due_at) : new Date();
        if(!Number.isFinite(due.getTime()) || due.getTime()>Date.now()+366*86400_000) fail('Date invalide');
        const existing = await db.get('seo_jobs?status=in.(queued,running)&select=id,topic,kind,target_id&limit=101');
        if(existing.length>=100) fail('File pleine');
        if(topic && existing.some(j=>similar(j.topic,topic))) fail('Ce sujet est déjà en file');
        let targetId = null;
        if(body.kind==='refresh') {
          targetId = uuid(body.target_id);
          const [post] = await db.get(`blog_posts?id=eq.${targetId}&select=id,language`);
          if(!post) fail('Article public introuvable');
          if(post.language!==body.language) fail('Conserver la langue de l’article lors d’une actualisation');
          if(existing.some(j=>j.target_id===targetId)) fail('Actualisation déjà en file');
        }
        await db.insert('seo_jobs',{kind:body.kind,topic,language:body.language,due_at:due.toISOString(),target_id:targetId});
      } else if(action==='distribute') {
        if(!['wordpress','dev'].includes(body.destination)) fail('Destination invalide');
        if(body.confirm_publication!==true) fail('Confirmez la publication sur votre compte');
        const [post]=await db.get(`blog_posts?id=eq.${uuid(body.post_id)}`);
        if(!post) fail('Publiez d’abord l’article sur Fableya',404);
        await db.insert('seo_deliveries?on_conflict=post_id,revision,destination',{
          post_id:post.id,revision:post.revision,destination:body.destination,snapshot:post,
        },'resolution=ignore-duplicates,return=minimal');
      } else if(action==='cancel_delivery') {
        const changed=await db.patch(`seo_deliveries?id=eq.${uuid(body.id)}&status=eq.queued`,{status:'cancelled',finished_at:stamp()});
        if(!changed.length) fail('Envoi déjà commencé ou terminé',409);
      } else if(action==='cancel') {
        const changed = await db.patch(`seo_jobs?id=eq.${uuid(body.id)}&status=eq.queued`,{status:'cancelled',finished_at:stamp()});
        if(!changed.length) fail('Seules les tâches en attente peuvent être annulées',409);
      } else if(action==='edit') {
        const [draft] = await db.get(`seo_drafts?id=eq.${uuid(body.id)}&select=language,research`);
        if(!draft) fail('Brouillon introuvable',404);
        // Preserve provenance: editing cannot turn arbitrary URLs into researched sources.
        const document = {...body.document,sources:draft.research.sources};
        const audit = validateDocument(document,draft.language);
        await db.rpc('seo_edit_draft',{p_id:body.id,p_version:version(body.version),p_document:document,p_audit:audit,p_actor:user.id});
        return res.status(200).json({ok:true,audit});
      } else if(action==='approve') {
        if(body.sources_verified!==true) fail('Confirmez la vérification des sources et des affirmations');
        await db.rpc('seo_approve_draft',{p_id:uuid(body.id),p_version:version(body.version),p_actor:user.id});
      } else if(action==='publish') {
        const slug = await db.rpc('seo_publish_draft',{p_id:uuid(body.id),p_version:version(body.version),p_actor:user.id});
        return res.status(200).json({ok:true,url:`/blog/${slug}`});
      } else if(action==='schedule') {
        const date = new Date(body.publish_at);
        if(!Number.isFinite(date.getTime()) || date.getTime()<Date.now() || date.getTime()>Date.now()+366*86400_000) fail('Date future requise');
        const changed = await db.patch(`seo_drafts?id=eq.${uuid(body.id)}&version=eq.${version(body.version)}&status=eq.approved`,{
          status:'scheduled',publish_at:date.toISOString(),updated_at:stamp(),
        });
        if(!changed.length) fail('Brouillon non approuvé ou version modifiée',409);
      } else if(action==='archive') {
        const changed = await db.patch(`seo_drafts?id=eq.${uuid(body.id)}&version=eq.${version(body.version)}&status=in.(review,approved,scheduled)`,{
          status:'archived',approved_by:null,approved_at:null,publish_at:null,updated_at:stamp(),
        });
        if(!changed.length) fail('Brouillon clos ou version modifiée',409);
      } else fail('Action inconnue');
      await db.insert('seo_events',{actor:user.id,action,target_id:body.id ?? null});
      return res.status(200).json({ok:true});
    } catch(error) {
      const status = error.status===401 || error.status===403 ? error.status : (error.status===400 || error.status===404 || error.status===405 || error.status===409 ? error.status : 500);
      return res.status(status).json({error:status===500?'Opération impossible. Vérifiez la configuration, puis rechargez : une version peut avoir changé.':error.message});
    }
  };
}
