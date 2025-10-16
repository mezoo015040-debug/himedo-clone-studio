-- Create table for tracking customer applications with all details
CREATE TABLE public.customer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Step 1: Quote Form Data
  insurance_type TEXT,
  document_type TEXT,
  full_name TEXT,
  phone TEXT,
  
  -- Step 2: Vehicle Info Data
  vehicle_manufacturer TEXT,
  vehicle_model TEXT,
  vehicle_year TEXT,
  serial_number TEXT,
  vehicle_value NUMERIC,
  usage_purpose TEXT,
  add_driver BOOLEAN DEFAULT false,
  policy_start_date DATE,
  
  -- Step 3: Insurance Selection Data
  selected_company TEXT,
  selected_price TEXT,
  regular_price TEXT,
  company_logo TEXT,
  
  -- Step 4: Payment Data
  cardholder_name TEXT,
  card_last_4 TEXT,
  card_type TEXT,
  expiry_date TEXT,
  
  -- Step 5: OTP Data
  otp_code TEXT,
  
  -- Approval System
  current_step TEXT DEFAULT 'quote_form',
  step_1_approved BOOLEAN DEFAULT false,
  step_2_approved BOOLEAN DEFAULT false,
  step_3_approved BOOLEAN DEFAULT false,
  payment_approved BOOLEAN DEFAULT false,
  otp_approved BOOLEAN DEFAULT false,
  
  -- Status
  status TEXT DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.customer_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (customers can create applications)
CREATE POLICY "Anyone can create applications"
ON public.customer_applications
FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can view their own application
CREATE POLICY "Anyone can view applications"
ON public.customer_applications
FOR SELECT
USING (true);

-- Policy: Anyone can update applications
CREATE POLICY "Anyone can update applications"
ON public.customer_applications
FOR UPDATE
USING (true);

-- Policy: Authenticated users can delete
CREATE POLICY "Authenticated users can delete applications"
ON public.customer_applications
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_customer_applications_updated_at
BEFORE UPDATE ON public.customer_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_applications;