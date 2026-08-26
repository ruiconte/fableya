-- ── Book generation usage audit trail ─────────────────────────────────────
CREATE TABLE book_generation_usage (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id              uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  subscription_id      uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  billing_period_start timestamptz,
  billing_period_end   timestamptz,
  status               text NOT NULL DEFAULT 'committed',
  -- 'committed' | 'reversed_system_error'
  created_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE book_generation_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own generation usage"
  ON book_generation_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_gen_usage_user ON book_generation_usage(user_id);
CREATE INDEX idx_gen_usage_book ON book_generation_usage(book_id);
CREATE INDEX idx_gen_usage_sub  ON book_generation_usage(subscription_id);
