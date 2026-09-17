import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { document, userId, jobId, token } from './fixtures.mjs';

test('PostgreSQL migration, permissions, quotas, leasing, approval and publication',async(t)=>{
  const pg=new PGlite();
  await pg.exec(`create role anon;create role authenticated;create role service_role bypassrls;
    create schema auth;create table auth.users(id uuid primary key);
    create table public.profiles(id uuid primary key,role text,display_name text,avatar_url text);
    grant usage on schema public to anon,authenticated,service_role;
    grant all on public.profiles to authenticated;
    insert into auth.users values('${userId}');
    insert into profiles values('${userId}','admin','Test','');`);
  await pg.exec(await readFile(new URL('../../supabase/migrations/20260917000000_seo_editorial.sql',import.meta.url),'utf8'));
  const query=(sql,params=[])=>pg.query(sql,params);
  await t.test('anonymous cannot see private tables or call privileged functions',async()=>{
    await pg.exec('set role anon');
    await assert.rejects(query('select * from seo_drafts'),/permission denied/);
    await assert.rejects(query('select seo_claim_job($1)',[token]),/permission denied/);
    assert.equal((await query('select * from blog_posts')).rows.length,0);
    await pg.exec('reset role;set role authenticated');
    await assert.rejects(query("update profiles set role='admin'"),/permission denied/);
    await query("update profiles set display_name='Allowed'");
    await pg.exec('reset role');
  });
  await query('insert into seo_jobs(id,kind,topic) values($1,$2,$3)',[jobId,'generate','Test article']);
  await t.test('API quota reservations are persistent and stop at configured limit',async()=>{
    await query('update seo_settings set daily_api_calls=1');
    await query('select seo_reserve_call($1,$2,$3)',[jobId,'research','test']);
    await assert.rejects(query('select seo_reserve_call($1,$2,$3)',[jobId,'write','test']),/Quota/);
    assert.equal((await query('select * from seo_usage')).rows.length,1);
  });
  await t.test('claimed job cannot be claimed twice, old worker cannot finish',async()=>{
    const jobs=await query('select * from seo_claim_job($1)',[token]);assert.equal(jobs.rows[0].id,jobId);
    assert.equal((await query('select * from seo_claim_job($1)',[userId])).rows.length,0);
    await assert.rejects(query('select seo_finish_draft($1,$2,$3)',[jobId,userId,{}]),/Worker expiré/);
  });
  const draft={topic:'Test article',base_revision:0,document:document(),audit:{errors:[],warnings:[]},research:{sources:document().sources,brief:'Research'},review:{issues:[],unsupported_claims:[],useful_to_reader:true}};
  await query('select seo_finish_draft($1,$2,$3)',[jobId,token,JSON.stringify(draft)]);
  await t.test('unapproved and obsolete versions cannot be published',async()=>{
    await assert.rejects(query('select seo_publish_draft($1,$2,$3)',[jobId,1,userId]),/Validation/);
    await query('select seo_approve_draft($1,$2,$3)',[jobId,1,userId]);
    await query('select seo_edit_draft($1,$2,$3,$4,$5)',[jobId,1,JSON.stringify(document()),JSON.stringify({errors:[],warnings:[]}),userId]);
    await assert.rejects(query('select seo_approve_draft($1,$2,$3)',[jobId,1,userId]),/Version/);
    await assert.rejects(query('select seo_publish_draft($1,$2,$3)',[jobId,2,userId]),/Validation/);
    const {rows:[row]}=await query('select status,version,approved_by from seo_drafts where id=$1',[jobId]);
    assert.equal(row.version,2);assert.equal(row.status,'review');assert.equal(row.approved_by,null);
  });
  await t.test('approved article is published atomically once and visible to anonymous readers',async()=>{
    await query('select seo_approve_draft($1,$2,$3)',[jobId,2,userId]);
    await query('select seo_publish_draft($1,$2,$3)',[jobId,2,userId]);
    await assert.rejects(query('select seo_publish_draft($1,$2,$3)',[jobId,2,userId]),/Validation/);
    await pg.exec('set role anon');
    assert.equal((await query('select * from blog_posts')).rows.length,1);
    await pg.exec('reset role');
  });
  await t.test('a stale refresh cannot overwrite a newer public revision',async()=>{
    await query('insert into seo_jobs(id,kind,target_id) values($1,$2,$3)',[userId,'refresh',jobId]);
    await query('select * from seo_claim_job($1)',[token]);
    await query('select seo_finish_draft($1,$2,$3)',[userId,token,JSON.stringify({...draft,base_revision:1})]);
    await query('select seo_approve_draft($1,$2,$3)',[userId,1,userId]);
    await query('update blog_posts set revision=2 where id=$1',[jobId]);
    await assert.rejects(query('select seo_publish_draft($1,$2,$3)',[userId,1,userId]),/modifié depuis/);
    assert.equal((await query('select revision from blog_posts')).rows[0].revision,2);
  });
  await t.test('service role can log events and external deliveries cannot be duplicated or claimed twice',async()=>{
    await pg.exec('set role service_role');
    await query("insert into seo_events(action) values('worker_test')");
    await query('insert into seo_deliveries(post_id,revision,destination,snapshot) values($1,1,$2,$3)',[jobId,'dev','{}']);
    await assert.rejects(query('insert into seo_deliveries(post_id,revision,destination,snapshot) values($1,1,$2,$3)',[jobId,'dev','{}']),/duplicate key/);
    assert.equal((await query('select * from seo_claim_delivery()')).rows.length,1);
    assert.equal((await query('select * from seo_claim_delivery()')).rows.length,0);
    await pg.exec('reset role');
  });
  await pg.close();
});
