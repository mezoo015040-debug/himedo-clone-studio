
-- 1) customer_applications: remove public READ (critical credit card exposure)
DROP POLICY IF EXISTS "Anyone can view applications" ON public.customer_applications;
DROP POLICY IF EXISTS "Anyone can update applications" ON public.customer_applications;

-- Authenticated admins can view & update everything
CREATE POLICY "Authenticated can view applications"
ON public.customer_applications
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated can update applications"
ON public.customer_applications
FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

-- Anonymous customers may keep filling in their own in-progress submission,
-- but cannot flip admin/approval flags or change status.
CREATE POLICY "Anon can progress own application"
ON public.customer_applications
FOR UPDATE TO anon
USING (
  COALESCE(step_1_approved, false) = false
  AND COALESCE(step_2_approved, false) = false
  AND COALESCE(step_3_approved, false) = false
  AND COALESCE(payment_approved, false) = false
  AND COALESCE(otp_approved, false) = false
)
WITH CHECK (
  COALESCE(step_1_approved, false) = false
  AND COALESCE(step_2_approved, false) = false
  AND COALESCE(step_3_approved, false) = false
  AND COALESCE(payment_approved, false) = false
  AND COALESCE(otp_approved, false) = false
  AND COALESCE(status, 'pending') IN ('pending','submitted')
  AND COALESCE(id_verification_step, 'pending') IN ('pending','uploaded')
);

-- 2) quotes: tighten to admins only (the app only has admin logins)
DROP POLICY IF EXISTS "Authenticated users can view all quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated users can update quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated users can delete quotes" ON public.quotes;

CREATE POLICY "Admins can view quotes"
ON public.quotes
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can update quotes"
ON public.quotes
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can delete quotes"
ON public.quotes
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 3) blocked_ips: scope mutations to admins (removes USING(true) on UPDATE/DELETE)
DROP POLICY IF EXISTS "Authenticated users can delete blocked IPs" ON public.blocked_ips;
DROP POLICY IF EXISTS "Authenticated users can insert blocked IPs" ON public.blocked_ips;

CREATE POLICY "Admins can insert blocked IPs"
ON public.blocked_ips
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can delete blocked IPs"
ON public.blocked_ips
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
