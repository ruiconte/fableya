import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

type Source = { id:number; title:string; url:string; checked_at:string }
type Document = { title:string; slug:string; description:string; introduction:string; sections:{ heading:string; paragraphs:string[]; source_ids:number[] }[]; faq:{ question:string; answer:string }[]; related_paths:string[]; sources:Source[] }
type Draft = { id:string; topic:string; language:string; status:string; version:number; created_at:string; publish_at:string|null; audit:{errors:string[];warnings:string[]}; document:Document; research:{brief:string}; review:{issues:string[];unsupported_claims:string[];useful_to_reader:boolean} }
type Job = { id:string; topic:string; kind:string; status:string; due_at:string; error:string|null }
type Settings = { enabled:boolean; daily_articles:number; daily_api_calls:number; monthly_api_calls:number; language:string; seeds:string; product_facts:string }
type Dashboard = { settings:Settings; drafts:Draft[]; jobs:Job[]; posts:{id:string;slug:string;title:string;language:string;updated_at:string;revision:number}[]; usage:{created_at:string;stage:string;input_tokens:number|null;output_tokens:number|null;status:string}[]; metrics:{day:string;page:string;clicks:number;impressions:number;position:number;synced_at:string}[]; events:{id:number;action:string;created_at:string}[]; deliveries:{id:string;post_id:string;destination:string;status:string;remote_url:string|null;error:string|null}[] }
const statuses:Record<string,string> = {review:'À relire',approved:'Approuvé',scheduled:'Planifié',published:'Publié',archived:'Archivé',queued:'En attente',running:'En cours',completed:'Terminé',failed:'Échec',cancelled:'Annulé'}
const inputClass='w-full border border-gray-300 rounded-lg p-2 bg-white text-sm'
const dateLabel = (s:string) => new Date(s).toLocaleString('fr-FR')

export function AdminSEO() {
  const {session}=useAuth()
  const [data,setData]=useState<Dashboard|null>(null)
  const [draft,setDraft]=useState<Draft|null>(null)
  const [document,setDocument]=useState<Document|null>(null)
  const [settings,setSettings]=useState<Settings|null>(null)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [topic,setTopic]=useState('')
  const [language,setLanguage]=useState('fr')
  const [due,setDue]=useState('')
  const [publishAt,setPublishAt]=useState('')
  const [verified,setVerified]=useState(false)
  const [page,setPage]=useState(0)
  const [filter,setFilter]=useState('')
  const [tab,setTab]=useState('editorial')
  const [distributionPost,setDistributionPost]=useState('')
  const [destination,setDestination]=useState('wordpress')
  const [confirmDistribution,setConfirmDistribution]=useState(false)
  const api=useCallback(async (body?:unknown,query='') => {
    if(!session) throw new Error('Session expirée')
    const res=await fetch(`/api/seo-admin${query}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined})
    if(!res.headers.get('content-type')?.includes('application/json')) throw new Error('API éditoriale indisponible : vérifier le déploiement Vercel et la migration SQL.')
    const result=await res.json()
    if(!res.ok) throw new Error(result.error??'Opération impossible')
    return result
  },[session])
  const reload=useCallback(async()=>{
    const result:Dashboard=await api(undefined,`?page=${page}&status=${filter}`)
    setData(result)
    setSettings(s=>s??result.settings)
  },[api,page,filter])
  useEffect(()=>{reload().catch(e=>setError(e.message))},[reload])
  const open=async(id:string)=>{
    const result=await api(undefined,`?id=${id}`)
    setDraft(result.draft);setDocument(result.draft.document);setVerified(false);setPublishAt('')
  }
  const run=async(task:()=>Promise<void>)=>{
    setBusy(true);setError('');setMessage('')
    try{await task();await reload()}catch(e){setError(e instanceof Error?e.message:'Erreur inconnue')}finally{setBusy(false)}
  }
  const mutate=async(action:string,extra:Record<string,unknown>={})=>{
    if(!draft)return
    await api({action,id:draft.id,version:draft.version,...extra});await open(draft.id);setMessage('Modification enregistrée.')
  }
  const dirty=!!draft&&JSON.stringify(document)!==JSON.stringify(draft.document)
  const totalClicks=data?.metrics.reduce((s,r)=>s+r.clicks,0)??0
  const totalImpressions=data?.metrics.reduce((s,r)=>s+r.impressions,0)??0
  const weightedPosition=totalImpressions?(data?.metrics.reduce((s,r)=>s+r.position*r.impressions,0)??0)/totalImpressions:0
  const exportMarkdown=async()=>{
    if(!draft)return
    const result=await api(undefined,`?id=${draft.id}&export=markdown`)
    const url=URL.createObjectURL(new Blob([result.markdown],{type:'text/markdown;charset=utf-8'}))
    const a=window.document.createElement('a');a.href=url;a.download=`${draft.document.slug}.md`;a.click();URL.revokeObjectURL(url)
  }
  return <div className="max-w-6xl mx-auto space-y-6">
    <div className="flex justify-between gap-3 items-start"><div><h1 className="text-3xl font-bold">Journal & visibilité</h1><p className="text-gray-500 mt-2">Rechercher, préparer, relire et publier les articles Fableya.</p></div><a href="/blog" target="_blank" rel="noreferrer" className="text-rose-700 underline">Voir le journal ↗</a></div>
    {error&&<div role="alert" className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-800">{error}</div>}
    {message&&<div role="status" className="bg-green-50 p-3 rounded-lg text-green-800">{message}</div>}
    <nav className="flex flex-wrap gap-2">{[['editorial','Rédaction'],['results','Résultats'],['settings','Réglages']].map(([key,label])=><button key={key} onClick={()=>setTab(key)} className={`px-4 py-2 rounded-lg ${tab===key?'bg-gray-900 text-white':'bg-white border'}`}>{label}</button>)}<button disabled={busy} onClick={()=>run(reload)} className="px-3 py-2 border rounded-lg">Actualiser</button></nav>
    {!data&&!error&&<p>Chargement…</p>}
    {data&&tab==='editorial'&&<>
      <form onSubmit={e=>{e.preventDefault();run(async()=>{await api({action:'enqueue',kind:'generate',topic,language,due_at:due?new Date(due).toISOString():undefined});setTopic('');setMessage('Sujet en file. Le prochain passage du worker le prendra en charge.')} )}} className="bg-white border rounded-xl p-5 space-y-3">
        <h2 className="font-bold text-lg">Préparer un article</h2><label className="block text-sm">Sujet (vide : proposition à partir des thèmes et des données Google)<input className={inputClass} value={topic} maxLength={250} onChange={e=>setTopic(e.target.value)} placeholder="Ex. Comment préparer une histoire pour deux enfants d’âges différents ?" /></label>
        <div className="flex gap-4 flex-wrap"><label className="text-sm">Langue<select className={inputClass} value={language} onChange={e=>setLanguage(e.target.value)}><option value="fr">Français</option><option value="en">English</option><option value="ja">日本語</option></select></label><label className="text-sm">Début de rédaction (heure locale, facultatif)<input type="datetime-local" className={inputClass} value={due} onChange={e=>setDue(e.target.value)}/></label><button disabled={busy} className="bg-gray-900 text-white rounded-lg px-4 self-end py-2 disabled:opacity-50">Ajouter à la file</button></div>
      </form>
      <div className="grid xl:grid-cols-[320px_1fr] gap-5 items-start">
        <section className="bg-white border rounded-xl p-4 space-y-3"><h2 className="font-bold">Brouillons & calendrier</h2><select aria-label="Filtrer les brouillons" className={inputClass} value={filter} onChange={e=>{setFilter(e.target.value);setPage(0)}}><option value="">Tous les états</option>{['review','approved','scheduled','published','archived'].map(s=><option key={s} value={s}>{statuses[s]}</option>)}</select>
          {data.drafts.length===0&&<p className="text-gray-500 text-sm">Aucun article pour ce filtre.</p>}
          {data.drafts.map(d=><button key={d.id} disabled={busy} onClick={()=>run(()=>open(d.id))} className={`text-left block w-full rounded-lg p-3 border ${draft?.id===d.id?'border-rose-600 bg-rose-50':'border-gray-100'}`}><span className="block font-semibold text-sm">{d.topic}</span><span className="text-xs text-gray-500">{d.language.toUpperCase()} · {statuses[d.status]}{d.publish_at?` · ${dateLabel(d.publish_at)}`:''}</span>{d.audit.errors.length>0&&<span className="block text-xs text-red-700">{d.audit.errors.length} correction(s) nécessaire(s)</span>}</button>)}
          <div className="flex justify-between"><button disabled={page===0||busy} onClick={()=>setPage(p=>p-1)}>←</button><span className="text-sm">Page {page+1}</span><button disabled={data.drafts.length<25||busy} onClick={()=>setPage(p=>p+1)}>→</button></div>
        </section>
        <section className="bg-white border rounded-xl p-5 space-y-4">
          {!draft||!document?<p className="text-gray-500">Choisis un brouillon pour lire ses sources, corriger le texte et le publier.</p>:<>
            <div className="flex justify-between"><h2 className="font-bold">{statuses[draft.status]} · version {draft.version}</h2><button disabled={busy||dirty} onClick={()=>run(exportMarkdown)} className="text-sm underline">Exporter en Markdown</button></div>
            <fieldset disabled={busy||['published','archived'].includes(draft.status)} className="space-y-3">
              <label className="block text-sm">Titre<input className={inputClass} value={document.title} onChange={e=>setDocument({...document,title:e.target.value})}/></label>
              <label className="block text-sm">Adresse /blog/<input className={inputClass} value={document.slug} onChange={e=>setDocument({...document,slug:e.target.value})}/></label>
              <label className="block text-sm">Description<textarea className={inputClass} rows={2} value={document.description} onChange={e=>setDocument({...document,description:e.target.value})}/></label>
              <label className="block text-sm">Introduction<textarea className={inputClass} rows={4} value={document.introduction} onChange={e=>setDocument({...document,introduction:e.target.value})}/></label>
              {document.sections.map((section,i)=><div key={i} className="border-t pt-4 space-y-2"><label className="block text-sm">Section {i+1}<input className={inputClass} value={section.heading} onChange={e=>setDocument({...document,sections:document.sections.map((s,n)=>n===i?{...s,heading:e.target.value}:s)})}/></label><label className="block text-sm">Paragraphes (séparer par une ligne vide)<textarea className={inputClass} rows={9} value={section.paragraphs.join('\n\n')} onChange={e=>setDocument({...document,sections:document.sections.map((s,n)=>n===i?{...s,paragraphs:e.target.value.split('\n\n')}:s)})}/></label><p className="text-xs text-gray-500">Sources : {section.source_ids.join(', ')||'Aucune'}</p></div>)}
              <h3 className="font-bold">Questions fréquentes</h3>{document.faq.map((faq,i)=><div key={i} className="space-y-2"><input aria-label={`Question ${i+1}`} className={inputClass} value={faq.question} onChange={e=>setDocument({...document,faq:document.faq.map((f,n)=>n===i?{...f,question:e.target.value}:f)})}/><textarea aria-label={`Réponse ${i+1}`} className={inputClass} value={faq.answer} rows={3} onChange={e=>setDocument({...document,faq:document.faq.map((f,n)=>n===i?{...f,answer:e.target.value}:f)})}/></div>)}
              <button disabled={!dirty||busy} onClick={()=>run(()=>mutate('edit',{document}))} className="px-4 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-40">Enregistrer les corrections</button>
              {dirty&&<p className="text-sm text-amber-800">Modifications non enregistrées. Enregistrer remet l’article en relecture.</p>}
            </fieldset>
            <details open className="border-t pt-4"><summary className="font-bold cursor-pointer">Sources & contrôles</summary><p className="text-sm text-gray-500 mt-2">Les contrôles techniques ne prouvent pas l’exactitude. Ouvre les sources et vérifie les affirmations, en particulier les comparatifs.</p><ul className="list-disc pl-5 my-3">{document.sources.map(s=><li key={s.id}><a className="text-rose-700 underline" href={s.url} target="_blank" rel="noreferrer">[{s.id}] {s.title}</a> <span className="text-xs">{s.checked_at.slice(0,10)}</span></li>)}</ul>{draft.audit.errors.map((s,i)=><p key={i} className="text-red-700 text-sm">• {s}</p>)}{draft.audit.warnings.map((s,i)=><p key={i} className="text-amber-700 text-sm">• {s}</p>)}<h3 className="font-semibold mt-3">Relecture IA de la version initiale</h3>{[...draft.review.issues,...draft.review.unsupported_claims].map((s,i)=><p className="text-amber-800 text-sm" key={i}>• {s}</p>)}{!draft.review.useful_to_reader&&<p className="text-amber-800 text-sm">L’utilité de cet article a été signalée comme insuffisante.</p>}<details className="mt-3"><summary>Brief de recherche</summary><pre className="whitespace-pre-wrap text-sm mt-2">{draft.research.brief}</pre></details></details>
            {draft.status==='review'&&<div className="bg-amber-50 p-4 rounded-lg space-y-3"><label className="flex gap-2 text-sm"><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)}/>J’ai vérifié les sources, les informations Fableya et les affirmations signalées. Le texte peut être publié.</label><button disabled={busy||dirty||!verified||draft.audit.errors.length>0} onClick={()=>run(()=>mutate('approve',{sources_verified:true}))} className="bg-gray-900 text-white rounded-lg px-4 py-2 disabled:opacity-40">Approuver cette version</button></div>}
            {draft.status==='approved'&&<div className="space-y-3"><button disabled={busy||dirty} onClick={()=>run(()=>mutate('publish'))} className="bg-rose-700 text-white px-4 py-2 rounded-lg disabled:opacity-40">Publier sur Fableya maintenant</button><label className="block text-sm">Ou programmer la publication (heure locale)<input type="datetime-local" className={inputClass} value={publishAt} onChange={e=>setPublishAt(e.target.value)}/></label><button disabled={busy||dirty||!publishAt} onClick={()=>run(()=>mutate('schedule',{publish_at:new Date(publishAt).toISOString()}))} className="border px-4 py-2 rounded-lg disabled:opacity-40">Programmer</button><p className="text-xs text-gray-500">Publication au prochain passage du worker après cette date.</p></div>}
            {draft.status==='published'&&<a href={`/blog/${draft.document.slug}`} target="_blank" rel="noreferrer" className="text-rose-700 underline">Ouvrir l’article publié ↗</a>}
            {!['published','archived'].includes(draft.status)&&<button disabled={busy} onClick={()=>run(()=>mutate('archive'))} className="text-sm text-gray-500 underline">Archiver ce brouillon</button>}
          </>}
        </section>
      </div>
      <section className="bg-white border rounded-xl p-5 overflow-auto"><h2 className="font-bold mb-3">File de travail · 30 dernières tâches</h2><table className="w-full text-sm"><thead><tr className="text-left"><th>Sujet</th><th>État</th><th>Prévu</th><th>Action</th></tr></thead><tbody>{data.jobs.map(j=><tr key={j.id} className="border-t"><td className="p-2">{j.topic||({generate:'Recherche d’un nouveau sujet',refresh:'Actualisation',metrics:'Synchronisation Google'}[j.kind])}{j.error&&<p className="text-red-700">{j.error}</p>}</td><td>{statuses[j.status]}</td><td>{dateLabel(j.due_at)}</td><td>{j.status==='queued'&&<button disabled={busy} className="underline" onClick={()=>run(async()=>{await api({action:'cancel',id:j.id})})}>Annuler</button>}</td></tr>)}</tbody></table><p className="text-xs text-gray-500 mt-3">Après un échec, corrige la cause puis ajoute une nouvelle tâche. Aucun appel IA payant n’est relancé automatiquement.</p></section>
      <section className="bg-white border rounded-xl p-5"><h2 className="font-bold mb-3">Articles en ligne · 100 derniers</h2>{data.posts.map(p=><div className="flex justify-between gap-4 border-t py-3" key={p.id}><a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="underline">{p.title}</a><button disabled={busy} className="text-sm underline" onClick={()=>run(async()=>{await api({action:'enqueue',kind:'refresh',target_id:p.id,topic:p.title,language:p.language});setMessage('Actualisation en file ; la version actuelle reste en ligne.')})}>Préparer une actualisation</button></div>)}</section>
      <section className="bg-white border rounded-xl p-5 space-y-4"><h2 className="font-bold">Diffuser sur mes autres comptes</h2><p className="text-sm text-gray-500">Un extrait déclaré comme publié par Fableya renvoie vers l’article complet. Les identifiants et la destination doivent être activés dans le worker. DEV convient aux sujets techniques ; choisis une plateforme adaptée à son lectorat.</p>
        <div className="grid sm:grid-cols-2 gap-3"><label className="text-sm">Article publié<select className={inputClass} value={distributionPost} onChange={e=>{setDistributionPost(e.target.value);setConfirmDistribution(false)}}><option value="">Choisir un article</option>{data.posts.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><label className="text-sm">Destination<select className={inputClass} value={destination} onChange={e=>{setDestination(e.target.value);setConfirmDistribution(false)}}><option value="wordpress">Mon WordPress</option><option value="dev">Mon compte DEV</option></select></label></div>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmDistribution} onChange={e=>setConfirmDistribution(e.target.checked)}/>Je souhaite publier cet extrait sur mon compte configuré.</label><button disabled={busy||!distributionPost||!confirmDistribution} className="bg-gray-900 text-white rounded-lg px-4 py-2 disabled:opacity-40" onClick={()=>run(async()=>{await api({action:'distribute',post_id:distributionPost,destination,confirm_publication:true});setConfirmDistribution(false);setMessage('Envoi mis en file, ou déjà enregistré pour cette version. Consulte son état ci-dessous.')})}>Programmer l’envoi</button>
        {data.deliveries.map(d=><div key={d.id} className="text-sm border-t py-2"><strong>{d.destination}</strong> · {({queued:'En attente',running:'En cours',succeeded:'Publié',unknown:'À vérifier sur le compte distant',cancelled:'Annulé'} as Record<string,string>)[d.status]}{d.remote_url&&<a className="ml-3 underline" href={d.remote_url} target="_blank" rel="noreferrer">Ouvrir ↗</a>}{d.error&&<p className="text-amber-800">{d.error}</p>}{d.status==='queued'&&<button disabled={busy} className="ml-3 underline" onClick={()=>run(async()=>{await api({action:'cancel_delivery',id:d.id})})}>Annuler</button>}</div>)}
      </section>
    </>}
    {data&&tab==='results'&&<div className="space-y-5"><div className="grid sm:grid-cols-3 gap-4">{[['Clics Google',totalClicks.toLocaleString()],['Impressions',totalImpressions.toLocaleString()],['Position moyenne',weightedPosition?weightedPosition.toFixed(1):'—']].map(([label,value])=><div key={label} className="bg-white border rounded-xl p-5"><p className="text-sm text-gray-500">{label}</p><strong className="text-3xl">{value}</strong></div>)}</div><p className="text-sm text-gray-600">Données Google des pages /blog/, jusqu’à 1 000 lignes sur les 31 derniers jours. Google fournit ses résultats avec un délai ; zéro ligne ne signifie pas zéro visite. Les clics ne sont pas des achats.</p><button disabled={busy} className="border rounded-lg px-4 py-2" onClick={()=>run(async()=>{await api({action:'enqueue',kind:'metrics',language:'fr'});setMessage('Synchronisation en file.')})}>Synchroniser Search Console</button><div className="bg-white border rounded-xl p-5 overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th>Date</th><th>Page</th><th>Clics</th><th>Impressions</th><th>Position</th></tr></thead><tbody>{data.metrics.slice(0,100).map(r=><tr key={r.day+r.page} className="border-t"><td className="p-2">{r.day}</td><td className="break-all">{r.page}</td><td>{r.clicks}</td><td>{r.impressions}</td><td>{r.position.toFixed(1)}</td></tr>)}</tbody></table>{!data.metrics.length&&<p className="text-gray-500">Aucune donnée importée. Configure l’accès Search Console puis lance la synchronisation.</p>}</div><p className="text-sm">Les boutons « Créer mon livre » des articles transmettent des paramètres UTM à l’outil d’analyse existant. L’attribution des achats nécessite une configuration analytics séparée.</p></div>}
    {data&&settings&&tab==='settings'&&<form className="bg-white border rounded-xl p-5 space-y-5 max-w-3xl" onSubmit={e=>{e.preventDefault();run(async()=>{await api({action:'settings',settings});setMessage('Réglages enregistrés.')})}}><h2 className="font-bold text-lg">Automatisation & consommation</h2><label className="flex gap-2"><input type="checkbox" checked={settings.enabled} onChange={e=>setSettings({...settings,enabled:e.target.checked})}/>Créer automatiquement des brouillons chaque jour</label><p className="text-sm text-gray-500">Les tâches manuelles et les publications déjà programmées continuent même si la création quotidienne est désactivée.</p><div className="grid sm:grid-cols-3 gap-3">{[['daily_articles','Articles / jour',0,3],['daily_api_calls','Appels IA / jour',1,100],['monthly_api_calls','Appels IA / mois',1,3000]].map(([key,label,min,max])=><label key={key} className="text-sm">{label}<input className={inputClass} type="number" min={min} max={max} value={settings[key as keyof Settings] as number} onChange={e=>setSettings({...settings,[key]:Number(e.target.value)})}/></label>)}</div><label className="block">Langue quotidienne<select className={inputClass} value={settings.language} onChange={e=>setSettings({...settings,language:e.target.value})}><option value="fr">Français</option><option value="en">English</option><option value="ja">日本語</option></select></label><label className="block">Thèmes à explorer<textarea className={inputClass} rows={3} maxLength={4000} value={settings.seeds} onChange={e=>setSettings({...settings,seeds:e.target.value})}/></label><label className="block">Informations produit vérifiées<textarea className={inputClass} rows={6} maxLength={10000} value={settings.product_facts} onChange={e=>setSettings({...settings,product_facts:e.target.value})}/></label><p className="text-sm text-gray-500">Renseigne uniquement les fonctions et tarifs actuellement proposés. L’agent s’appuie sur ce texte pour décrire Fableya.</p><button disabled={busy} className="bg-gray-900 text-white px-4 py-2 rounded-lg">Enregistrer</button><hr/><h3 className="font-bold">Consommation du mois UTC</h3><p>{data.usage.length} appel(s) réservés, dont {data.usage.filter(u=>u.status==='failed_or_unknown').length} en échec ou résultat inconnu.</p><p>{data.usage.reduce((s,u)=>s+(u.input_tokens??0)+(u.output_tokens??0),0).toLocaleString()} tokens connus.</p><p className="text-sm text-gray-500">Une rédaction utilise 3 appels, ou 4 avec proposition de sujet. Les recherches Web sont facturées séparément par le fournisseur. Ces quotas ne constituent pas un plafond monétaire ; vérifier aussi la facturation du compte API.</p><h3 className="font-bold">Historique récent</h3>{data.events.map(e=><p key={e.id} className="text-xs">{dateLabel(e.created_at)} · {e.action}</p>)}</form>}
  </div>
}
