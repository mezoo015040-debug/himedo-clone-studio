DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views"
ON public.page_views FOR INSERT
TO anon, authenticated
WITH CHECK (true);