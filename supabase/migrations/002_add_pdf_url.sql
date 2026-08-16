-- Ajouter la colonne pdf_url à la table books
alter table public.books add column if not exists pdf_url text;
