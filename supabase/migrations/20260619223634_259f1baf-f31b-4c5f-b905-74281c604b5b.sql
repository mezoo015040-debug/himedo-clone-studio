
GRANT INSERT, UPDATE ON public.customer_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_applications TO authenticated;
GRANT ALL ON public.customer_applications TO service_role;
