-- Add IP address column to page_views table
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS ip_address text;

-- Create blocked_ips table
CREATE TABLE public.blocked_ips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address text NOT NULL UNIQUE,
    reason text,
    blocked_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Policies for blocked_ips
CREATE POLICY "Authenticated users can view blocked IPs"
ON public.blocked_ips
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert blocked IPs"
ON public.blocked_ips
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blocked IPs"
ON public.blocked_ips
FOR DELETE
TO authenticated
USING (true);

-- Create index for faster IP lookups
CREATE INDEX idx_blocked_ips_ip ON public.blocked_ips(ip_address);
CREATE INDEX idx_page_views_ip ON public.page_views(ip_address);