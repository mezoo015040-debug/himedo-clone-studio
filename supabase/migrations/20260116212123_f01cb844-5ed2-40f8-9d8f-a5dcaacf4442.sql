-- Add IP address column to customer_applications table
ALTER TABLE public.customer_applications ADD COLUMN IF NOT EXISTS ip_address text;