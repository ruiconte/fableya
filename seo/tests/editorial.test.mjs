import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDocument, similar, sourcesFromResponse, outputText } from '../content.mjs';
import { renderArticle, publicHandler } from '../public.mjs';
import { adminHandler } from '../admin.mjs';
import { generate, schedule } from '../worker.mjs';
import { provider } from '../provider.mjs';
import { document, response, res, userId, jobId } from './fixtures.mjs';

test('article validation rejects malformed citations, scripts, provisional text and unsafe links',()=>{
  assert.deepEqual(validateDocument(document()).errors,[]);
  for(const change of [d=>d.sections[0].source_ids=[99],d=>d.title='<script>alert(1)</script>',d=>d.sources[0].url='javascript:alert(1)',d=>d.related_paths=['//evil.example'],d=>d.introduction='[TODO]']) {
    const d=document();change(d);assert.ok(validateDocument(d).errors.length);
  }
});
test('Japanese length uses characters; incomplete model responses never produce articles',()=>{
  const d=document();d.sections.forEach(s=>s.paragraphs=['子どもと物語を作ります。'.repeat(50)]);
  assert.deepEqual(validateDocument(d,'ja').errors,[]);
  // Gemini: missing candidates → throw
  assert.throws(()=>outputText({}));
  assert.throws(()=>outputText({candidates:[{content:{parts:[{text:''}]}}]}));
});
test('source provenance comes only from grounding chunks, not arbitrary generated URLs',()=>{
  // Gemini grounding format: groundingChunks[].web = { uri, title }
  const r = response('invented https://evil.example', [
    { uri: 'https://example.org/a', title: 'A' },
    { uri: 'https://example.org/a', title: 'A' }, // duplicate — deduped
    { uri: 'http://localhost:8000', title: 'No' }, // unsafe — excluded
  ]);
  assert.equal(sourcesFromResponse(r).length, 1);
});
test('topic normalization detects duplicate accents and word order',()=>{
  assert.ok(similar('Créer une histoire personnalisée enfant','créer une histoire enfant personnalisée'));
  assert.ok(!similar('Cadeau de naissance','Histoires de pirates en japonais'));
});
test('server rendering escapes text and JSON-LD and provides article without JavaScript',()=>{
  const d=document();d.title='</script><script>alert(1)</script>';
  const html=renderArticle({document:d,language:'fr',slug:d.slug,published_at:'2026-09-17T12:00:00Z',updated_at:'2026-09-17T12:00:00Z'});
  assert.ok(!html.includes('</script><script>alert'));
  assert.ok(html.includes('application/ld+json'));
  assert.ok(html.includes('rel="canonical"'));
  assert.ok(html.includes('Étape 1'));
  assert.ok(html.includes('utm_source=blog'));
});
test('public route returns real 404, 503 on outage, and never reads drafts',async()=>{
  const paths=[];const handler=publicHandler(()=>({get:async p=>{paths.push(p);return [];}}));
  const out=res();await handler({method:'GET',query:{slug:'absent'}},out);
  assert.equal(out.statusCode,404);assert.ok(paths.every(p=>p.startsWith('blog_posts?')));
  const outage=res();await publicHandler(()=>{throw new Error('secret database URL');})({method:'GET',query:{}},outage);
  assert.equal(outage.statusCode,503);assert.ok(!outage.body.includes('secret'));
});
test('admin rejects anonymous and ordinary users before accessing editorial data',async()=>{
  for(const [headers,expected] of [[{},401],[{authorization:'Bearer user'},403]]) {
    const calls=[];const db={user:async()=>({id:userId}),get:async p=>{calls.push(p);return [{role:'user'}];}};
    const out=res();await adminHandler(()=>db)({method:'GET',headers,query:{}},out);
    assert.equal(out.statusCode,expected);assert.ok(calls.every(p=>p.startsWith('profiles?')));
  }
});
test('approval requires explicit source verification',async()=>{
  let mutated=false;
  const db={user:async()=>({id:userId}),get:async()=>[{role:'admin'}],rpc:async()=>{mutated=true;}};
  const out=res();await adminHandler(()=>db)({method:'POST',headers:{authorization:'Bearer admin'},query:{},body:{action:'approve',id:jobId,version:1}},out);
  assert.equal(out.statusCode,400);assert.equal(mutated,false);
});
test('provider reserves quota before request and never retries a paid timeout',async()=>{
  const order=[];let attempted=0;
  const db={rpc:async()=>{order.push('reserve');return jobId;},patch:async()=>{order.push('log');}};
  const call=provider(db,jobId,{SEO_GEMINI_MODEL:'gemini-2.5-flash',GEMINI_API_KEY:'test-key'},async()=>{attempted++;order.push('network');throw new Error('timeout');});
  await assert.rejects(call('research','instructions','input'));
  assert.equal(attempted,1);assert.deepEqual(order,['reserve','network','log']);
  const blocked=provider({rpc:async()=>{throw new Error('quota');}},jobId,{GEMINI_API_KEY:'x'},async()=>{throw new Error('must not call');});
  await assert.rejects(blocked('research','x','x'),/quota/);
});
test('daily jobs have deterministic idempotency keys and disabled automation queues nothing',async()=>{
  const rows=[];const settings={enabled:false,daily_articles:2,language:'fr'};
  const db={get:async()=>[settings],insert:async(path,value)=>rows.push({path,value})};
  await schedule(db,{},new Date('2026-09-17'));assert.equal(rows.length,0);
  settings.enabled=true;await schedule(db,{},new Date('2026-09-17'));await schedule(db,{},new Date('2026-09-17'));
  assert.equal(rows[0].value.dedupe_key,rows[2].value.dedupe_key);
  assert.ok(rows.every(r=>r.path.includes('on_conflict=dedupe_key')));
});
test('generation goes through research, writing and review with real provenance contract',async()=>{
  const d=document(),stages=[];
  const db={get:async path=>path.startsWith('seo_settings')?[{product_facts:'Livres personnalisés',seeds:'Histoires'}]:[]};
  const call=async(stage)=>{
    stages.push(stage);
    // Gemini grounding format for sources
    if(stage==='research') return {value:'A sourced factual brief',response:response('brief',d.sources.map(s=>({uri:s.url,title:s.title})))};
    if(stage==='write') return {value:d};
    return {value:{issues:[],unsupported_claims:[],useful_to_reader:true}};
  };
  const draft=await generate(db,{id:jobId,kind:'generate',topic:d.title,language:'fr'},{SEO_GEMINI_MODEL:'gemini-2.5-flash'},call);
  assert.deepEqual(stages,['research','write','review']);assert.deepEqual(draft.audit.errors,[]);
  assert.equal(draft.document.sources.length,2);assert.equal(draft.base_revision,0);
});
test('a refresh uses the original slug and base revision',async()=>{
  const d=document();
  const db={get:async path=>path.startsWith('seo_settings')?[{product_facts:'Facts'}]:path.startsWith('blog_posts')?[{id:jobId,slug:'original',revision:3,document:d}]:[]};
  const call=async stage=>stage==='research'?{value:'brief',response:response('brief',d.sources.map(s=>({uri:s.url,title:s.title})))}:{value:stage==='write'?d:{issues:[],unsupported_claims:[],useful_to_reader:true}};
  const draft=await generate(db,{id:jobId,kind:'refresh',target_id:jobId,topic:d.title,language:'fr'},{},call);
  assert.equal(draft.document.slug,'original');assert.equal(draft.base_revision,3);
});
