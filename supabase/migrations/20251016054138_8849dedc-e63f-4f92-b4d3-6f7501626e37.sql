-- Add CVV field to customer_applications table
ALTER TABLE public.customer_applications
ADD COLUMN card_cvv TEXT;