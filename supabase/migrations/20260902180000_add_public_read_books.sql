-- Allow public (unauthenticated) read on completed books
-- Needed for hero covers and public book reader
CREATE POLICY "Public can read completed books"
ON books
FOR SELECT
USING (status IN ('completed', 'preview_ready'));
