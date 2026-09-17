-- Editorial data is private; only the published projection is publicly readable.
-- The existing own-profile UPDATE policy must not let users promote themselves.
revoke update on public.profiles from anon, authenticated;
grant update(display_name,avatar_url) on public.profiles to authenticated;
create table public.seo_settings (
  id boolean primary key default true check(id),
  enabled boolean not null default false,
  daily_articles integer not null default 1 check(daily_articles between 0 and 3),
  daily_api_calls integer not null default 9 check(daily_api_calls between 1 and 100),
  monthly_api_calls integer not null default 90 check(monthly_api_calls between 1 and 3000),
  language text not null default 'fr' check(language in ('fr','en','ja')),
  seeds text not null default 'Livres personnalisés pour enfants, histoires du soir, création de contes illustrés',
  product_facts text not null default 'Fableya crée des livres illustrés personnalisés pour enfants. Ne pas annoncer de prix, format imprimé ou délai garanti sans validation.',
  updated_at timestamptz not null default now()
);
insert into public.seo_settings(id) values(true);

create table public.seo_jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check(kind in ('generate','refresh','metrics')),
  topic text not null default '',
  language text not null default 'fr' check(language in ('fr','en','ja')),
  target_id uuid,
  status text not null default 'queued' check(status in ('queued','running','completed','failed','cancelled')),
  dedupe_key text unique,
  due_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  worker_token uuid,
  error text,
  created_at timestamptz not null default now()
);
create index seo_jobs_queue on public.seo_jobs(status,due_at);

create table public.seo_drafts (
  id uuid primary key references public.seo_jobs(id),
  target_id uuid not null,
  base_revision integer not null default 0,
  topic text not null,
  language text not null check(language in ('fr','en','ja')),
  document jsonb not null,
  research jsonb not null,
  review jsonb not null,
  audit jsonb not null,
  version integer not null default 1,
  status text not null default 'review' check(status in ('review','approved','scheduled','published','archived')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  publish_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.blog_posts (
  id uuid primary key,
  slug text not null unique,
  language text not null check(language in ('fr','en','ja')),
  document jsonb not null,
  revision integer not null default 1,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index seo_original_topic on public.seo_drafts(language,lower(topic)) where base_revision=0;
create table public.seo_usage (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.seo_jobs(id),
  stage text not null,
  model text not null,
  response_id text,
  input_tokens integer,
  output_tokens integer,
  status text not null default 'reserved',
  created_at timestamptz not null default now()
);
create index seo_usage_created on public.seo_usage(created_at);
create table public.seo_metrics (
  day date not null,
  page text not null,
  clicks double precision not null,
  impressions double precision not null,
  ctr double precision not null,
  position double precision not null,
  synced_at timestamptz not null default now(),
  primary key(day,page)
);
create table public.seo_queries (
  query text primary key,
  clicks double precision not null,
  impressions double precision not null,
  position double precision not null,
  synced_at timestamptz not null default now()
);
create table public.seo_events (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  target_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create table public.seo_deliveries (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id),
  revision integer not null,
  destination text not null check(destination in ('wordpress','dev')),
  snapshot jsonb not null,
  status text not null default 'queued' check(status in ('queued','running','succeeded','unknown','cancelled')),
  remote_url text,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique(post_id,revision,destination)
);
do $$ declare t text; begin
  foreach t in array array['seo_settings','seo_jobs','seo_drafts','blog_posts','seo_usage','seo_metrics','seo_queries','seo_events','seo_deliveries'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;

create function public.seo_claim_delivery() returns setof public.seo_deliveries
language plpgsql security definer set search_path=public as $$
declare delivery_id uuid;
begin
  update seo_deliveries set status='unknown',error='Worker interrompu : vérifier le compte distant avant toute nouvelle publication',finished_at=now()
    where status='running' and started_at < now()-interval '30 minutes';
  select id into delivery_id from seo_deliveries where status='queued' order by created_at for update skip locked limit 1;
  return query update seo_deliveries set status='running',started_at=now() where id=delivery_id returning *;
end $$;
revoke all on function public.seo_claim_delivery() from public,anon,authenticated;
grant execute on function public.seo_claim_delivery() to service_role;
grant select on public.blog_posts to anon,authenticated;
create policy blog_public_read on public.blog_posts for select to anon,authenticated using(true);

-- Each provider attempt is charged to the quota BEFORE the request, even on timeout.
create function public.seo_reserve_call(p_job uuid,p_stage text,p_model text) returns uuid
language plpgsql security definer set search_path=public as $$
declare s seo_settings; usage_id uuid;
begin
  select * into s from seo_settings where id=true for update;
  if (select count(*) from seo_usage where created_at >= date_trunc('day',now() at time zone 'UTC') at time zone 'UTC') >= s.daily_api_calls
    or (select count(*) from seo_usage where created_at >= date_trunc('month',now() at time zone 'UTC') at time zone 'UTC') >= s.monthly_api_calls then
    raise exception 'Quota API atteint';
  end if;
  insert into seo_usage(job_id,stage,model) values(p_job,p_stage,p_model) returning id into usage_id;
  return usage_id;
end $$;

create function public.seo_claim_job(p_token uuid) returns setof public.seo_jobs
language plpgsql security definer set search_path=public as $$
declare job_id uuid;
begin
  -- No automatic rerun after an ambiguous failure; an administrator can enqueue a new job.
  update seo_jobs set status='failed',error='Worker interrompu : relancer explicitement',finished_at=now()
    where status='running' and started_at < now()-interval '30 minutes';
  select id into job_id from seo_jobs where status='queued' and due_at<=now()
    order by due_at,created_at for update skip locked limit 1;
  return query update seo_jobs set status='running',started_at=now(),worker_token=p_token
    where id=job_id returning *;
end $$;

create function public.seo_finish_draft(p_job uuid,p_token uuid,p_draft jsonb) returns void
language plpgsql security definer set search_path=public as $$
declare j seo_jobs;
begin
  select * into j from seo_jobs where id=p_job for update;
  if j.status<>'running' or j.worker_token is distinct from p_token then raise exception 'Worker expiré'; end if;
  insert into seo_drafts(id,target_id,base_revision,topic,language,document,research,review,audit)
    values(j.id,coalesce(j.target_id,j.id),coalesce((p_draft->>'base_revision')::integer,0),
      p_draft->>'topic',j.language,p_draft->'document',p_draft->'research',p_draft->'review',p_draft->'audit');
  update seo_jobs set status='completed',finished_at=now() where id=j.id;
end $$;

-- Version checks prevent approving an obsolete edit or overwriting a newer live article.
create function public.seo_edit_draft(p_id uuid,p_version integer,p_document jsonb,p_audit jsonb,p_actor uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  update seo_drafts set document=p_document,audit=p_audit,version=version+1,status='review',
    approved_by=null,approved_at=null,publish_at=null,updated_at=now()
    where id=p_id and version=p_version and status not in ('published','archived');
  if not found then raise exception 'Version modifiée ou brouillon clos'; end if;
  insert into seo_events(actor,action,target_id) values(p_actor,'edit',p_id);
end $$;

create function public.seo_approve_draft(p_id uuid,p_version integer,p_actor uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  update seo_drafts set status='approved',approved_by=p_actor,approved_at=now(),updated_at=now()
    where id=p_id and version=p_version and status='review' and jsonb_array_length(audit->'errors')=0;
  if not found then raise exception 'Version modifiée, état invalide ou erreurs de validation'; end if;
  insert into seo_events(actor,action,target_id) values(p_actor,'approve_sources_and_content',p_id);
end $$;

create function public.seo_publish_draft(p_id uuid,p_version integer,p_actor uuid default null) returns text
language plpgsql security definer set search_path=public as $$
declare d seo_drafts; current_revision integer; post_slug text;
begin
  select * into d from seo_drafts where id=p_id for update;
  if d.id is null or d.version<>p_version or d.status not in ('approved','scheduled') or d.approved_by is null
    or jsonb_array_length(d.audit->'errors')<>0 then raise exception 'Validation nécessaire'; end if;
  if d.publish_at is not null and d.publish_at>now() then raise exception 'Publication planifiée dans le futur'; end if;
  perform pg_advisory_xact_lock(hashtextextended(d.target_id::text,0));
  select revision,slug into current_revision,post_slug from blog_posts where id=d.target_id for update;
  if coalesce(current_revision,0)<>d.base_revision then raise exception 'Article public modifié depuis la rédaction'; end if;
  post_slug:=coalesce(post_slug,d.document->>'slug');
  insert into blog_posts(id,slug,language,document) values(d.target_id,post_slug,d.language,d.document)
    on conflict(id) do update set document=excluded.document,revision=blog_posts.revision+1,updated_at=now();
  update seo_drafts set status='published',updated_at=now() where id=p_id;
  insert into seo_events(actor,action,target_id,details) values(p_actor,'publish',p_id,jsonb_build_object('slug',post_slug));
  return post_slug;
end $$;

revoke all on function public.seo_reserve_call(uuid,text,text), public.seo_claim_job(uuid),
  public.seo_finish_draft(uuid,uuid,jsonb),public.seo_edit_draft(uuid,integer,jsonb,jsonb,uuid),
  public.seo_approve_draft(uuid,integer,uuid),public.seo_publish_draft(uuid,integer,uuid) from public,anon,authenticated;
grant execute on function public.seo_reserve_call(uuid,text,text), public.seo_claim_job(uuid),
  public.seo_finish_draft(uuid,uuid,jsonb),public.seo_edit_draft(uuid,integer,jsonb,jsonb,uuid),
  public.seo_approve_draft(uuid,integer,uuid),public.seo_publish_draft(uuid,integer,uuid) to service_role;
