-- Allow public (unauthenticated) read on book_pages for completed books
-- This enables the hero section and public book reader to work without login
CREATE POLICY "Public can read completed book pages"
ON book_pages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM books
    WHERE books.id = book_pages.book_id
    AND books.status IN ('completed', 'preview_ready')
  )
);
