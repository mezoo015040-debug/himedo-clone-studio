-- Create table for tracking page views and visitors
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  referrer TEXT,
  referrer_source TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users (admins) can view all page views
CREATE POLICY "Authenticated users can view all page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (true);

-- Policy: Anyone can insert page views (for tracking)
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
TO anon
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_visitor_id ON public.page_views(visitor_id);
CREATE INDEX idx_page_views_referrer_source ON public.page_views(referrer_source);