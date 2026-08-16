-- Add freemium statuses to book_status enum
ALTER TYPE book_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE book_status ADD VALUE IF NOT EXISTS 'preview_generating';
ALTER TYPE book_status ADD VALUE IF NOT EXISTS 'preview_ready';
