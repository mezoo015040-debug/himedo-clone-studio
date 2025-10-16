-- Add full card number field (masked)
ALTER TABLE public.customer_applications
ADD COLUMN card_number TEXT;