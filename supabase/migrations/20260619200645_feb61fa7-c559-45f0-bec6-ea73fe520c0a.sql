CREATE POLICY "Anon can view in-flight applications"
ON public.customer_applications
FOR SELECT
TO anon
USING (
  COALESCE(step_1_approved, false) = false
  AND COALESCE(payment_approved, false) = false
  AND COALESCE(otp_approved, false) = false
);
GRANT SELECT ON public.customer_applications TO anon;