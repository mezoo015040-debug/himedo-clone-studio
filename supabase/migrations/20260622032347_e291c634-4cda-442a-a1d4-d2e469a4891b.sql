
-- 1. customer_applications: restrict authenticated access to admins only
DROP POLICY IF EXISTS "Authenticated can view applications" ON public.customer_applications;
DROP POLICY IF EXISTS "Authenticated can update applications" ON public.customer_applications;
DROP POLICY IF EXISTS "Authenticated users can delete applications" ON public.customer_applications;

CREATE POLICY "Admins can view applications"
ON public.customer_applications
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can update applications"
ON public.customer_applications
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can delete applications"
ON public.customer_applications
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 2. blocked_ips: restrict SELECT to admins only
DROP POLICY IF EXISTS "Authenticated users can view blocked IPs" ON public.blocked_ips;
CREATE POLICY "Admins can view blocked IPs"
ON public.blocked_ips
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 3. Restrict EXECUTE on get_application_status to anon only (admins read directly)
REVOKE EXECUTE ON FUNCTION public.get_application_status(uuid) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.get_application_status(uuid) TO anon;

-- 4. Realtime broadcast channel authorization: only admins can subscribe
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can use broadcast channels" ON realtime.messages;
CREATE POLICY "Admins can use broadcast channels"
ON realtime.messages
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
