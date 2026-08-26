-- ── Subscriptions ──────────────────────────────────────────────────────────
CREATE TABLE subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id    text NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_price_id       text,
  status                text NOT NULL DEFAULT 'inactive',
  -- Stripe statuses: active | trialing | past_due | unpaid | canceled
  --                  incomplete | incomplete_expired | inactive (our own)
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean NOT NULL DEFAULT false,
  books_used_this_period integer NOT NULL DEFAULT 0,
  plan_book_limit       integer NOT NULL DEFAULT 25,
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role writes (edge functions use service key — bypasses RLS)

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
