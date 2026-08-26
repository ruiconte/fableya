-- Atomic increment: returns 1 if incremented, 0 if quota already reached (race-condition safe)
CREATE OR REPLACE FUNCTION increment_book_usage(p_user_id uuid, p_limit integer)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH updated AS (
    UPDATE subscriptions
    SET
      books_used_this_period = books_used_this_period + 1,
      updated_at = now()
    WHERE
      user_id = p_user_id
      AND books_used_this_period < p_limit
    RETURNING 1
  )
  SELECT count(*)::integer FROM updated;
$$;

-- Decrement (used on system error rollback)
CREATE OR REPLACE FUNCTION decrement_book_usage(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE subscriptions
  SET
    books_used_this_period = GREATEST(0, books_used_this_period - 1),
    updated_at = now()
  WHERE user_id = p_user_id;
$$;
