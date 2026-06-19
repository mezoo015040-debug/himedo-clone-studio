GRANT INSERT, UPDATE ON TABLE public.customer_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customer_applications TO authenticated;
GRANT ALL ON TABLE public.customer_applications TO service_role;