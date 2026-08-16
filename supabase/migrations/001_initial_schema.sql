-- ════════════════════════════════════════════════════════════════
-- Kidoria — Initial Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  display_name text,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Books ────────────────────────────────────────────────────────
create type book_status as enum (
  'pending_payment',
  'paid',
  'generating',
  'completed',
  'failed'
);

create table public.books (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null default '',
  status            book_status not null default 'pending_payment',
  form_data         jsonb not null default '{}',
  cover_url         text,
  stripe_session_id text,
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger books_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

-- ── Book Pages ───────────────────────────────────────────────────
create table public.book_pages (
  id           uuid primary key default uuid_generate_v4(),
  book_id      uuid not null references public.books(id) on delete cascade,
  page_number  integer not null,
  image_url    text,
  text         text not null default '',
  created_at   timestamptz default now() not null,
  unique (book_id, page_number)
);

-- ── Row Level Security ───────────────────────────────────────────

-- Profiles: users can only see/edit their own profile
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Books: users can only see/create/edit their own books
alter table public.books enable row level security;

create policy "books_select_own" on public.books
  for select using (auth.uid() = user_id);

create policy "books_insert_own" on public.books
  for insert with check (auth.uid() = user_id);

create policy "books_update_own" on public.books
  for update using (auth.uid() = user_id);

create policy "books_delete_own" on public.books
  for delete using (auth.uid() = user_id);

-- Book pages: accessible if the parent book belongs to the user
alter table public.book_pages enable row level security;

create policy "book_pages_select_own" on public.book_pages
  for select using (
    exists (
      select 1 from public.books
      where books.id = book_pages.book_id
      and books.user_id = auth.uid()
    )
  );

-- ── Indexes ──────────────────────────────────────────────────────
create index idx_books_user_id on public.books(user_id);
create index idx_books_status on public.books(status);
create index idx_book_pages_book_id on public.book_pages(book_id);
create index idx_book_pages_order on public.book_pages(book_id, page_number);
