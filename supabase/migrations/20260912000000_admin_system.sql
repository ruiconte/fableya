-- ── Admin role ──────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Set admin account
UPDATE public.profiles SET role = 'admin' WHERE email = 'ruycompte@gmail.com';

-- ── Bonus credits (independent from subscription) ────────────────────────────
CREATE TABLE public.admin_credits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount       INTEGER NOT NULL, -- positive = add, negative = remove
  reason       TEXT,
  created_by   UUID NOT NULL REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_credits ENABLE ROW LEVEL SECURITY;
-- Only service role can read/write (edge functions bypass RLS via service role key)

-- ── Admin audit log ──────────────────────────────────────────────────────────
CREATE TABLE public.admin_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID NOT NULL REFERENCES auth.users(id),
  admin_email     TEXT NOT NULL,
  action          TEXT NOT NULL,
  target_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_book_id  UUID REFERENCES public.books(id) ON DELETE SET NULL,
  details         JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
-- Only service role can access

-- Index for fast lookups
CREATE INDEX admin_credits_user_id_idx ON public.admin_credits(user_id);
CREATE INDEX admin_audit_log_created_at_idx ON public.admin_audit_log(created_at DESC);
CREATE INDEX admin_audit_log_target_user_idx ON public.admin_audit_log(target_user_id);
