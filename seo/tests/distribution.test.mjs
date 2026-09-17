import test from 'node:test';
import assert from 'node:assert/strict';
import { distributionPayload, sendDelivery, distributeDue } from '../distribute.mjs';
import { document, jobId } from './fixtures.mjs';

const delivery=()=>({id:jobId,post_id:jobId,revision:1,destination:'dev',snapshot:{slug:'original',document:document(),language:'fr'}});
test('external excerpt discloses Fableya, links to original and omits most of the article',()=>{
  const p=distributionPayload(delivery().snapshot);
  assert.ok(p.markdown.includes('publié par Fableya'));assert.ok(p.html.includes('https://fableya.com/blog/original'));
  assert.ok(!p.markdown.includes('Étape 3'));
});
test('external publishing is disabled until a destination is explicitly enabled',async()=>{
  await assert.rejects(sendDelivery(delivery(),{},()=>{throw new Error('must not call');}),/désactivée/);
});
test('DEV posts to fixed API and specifies canonical URL',async()=>{
  let request;
  const url=await sendDelivery(delivery(),{SEO_DESTINATIONS:'dev',SEO_DEV_API_KEY:'test'},async(u,o)=>{
    request={u,o};return new Response(JSON.stringify({url:'https://dev.to/test/post'}),{status:201});
  });
  assert.equal(url,'https://dev.to/test/post');assert.equal(request.u,'https://dev.to/api/articles');
  assert.equal(JSON.parse(request.o.body).article.canonical_url,'https://fableya.com/blog/original');
});
test('WordPress does not forward credentials through redirects',async()=>{
  await sendDelivery({...delivery(),destination:'wordpress'},{SEO_DESTINATIONS:'wordpress',SEO_WORDPRESS_URL:'https://blog.example.org',SEO_WORDPRESS_USER:'user',SEO_WORDPRESS_APP_PASSWORD:'secret'},async(u,o)=>{
    assert.equal(o.redirect,'error');assert.equal(u,'https://blog.example.org/wp-json/wp/v2/posts');
    assert.equal(JSON.parse(o.body).status,'publish');return new Response(JSON.stringify({link:'https://blog.example.org/post'}));
  });
});
test('an ambiguous network failure becomes unknown and is not retried',async()=>{
  let claimed=false,calls=0;const changes=[];
  const db={rpc:async()=>{if(claimed)return [];claimed=true;return [delivery()];},patch:async(path,body)=>changes.push(body)};
  const ok=await distributeDue(db,{SEO_DESTINATIONS:'dev',SEO_DEV_API_KEY:'test'},async()=>{calls++;throw new Error('timeout');});
  assert.equal(ok,false);assert.equal(calls,1);assert.equal(changes[0].status,'unknown');
});
