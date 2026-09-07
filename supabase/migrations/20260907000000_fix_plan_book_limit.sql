-- Fix plan_book_limit for subscriptions incorrectly set to 25 (should be 20)
UPDATE subscriptions
SET plan_book_limit = 20
WHERE plan_book_limit = 25;
