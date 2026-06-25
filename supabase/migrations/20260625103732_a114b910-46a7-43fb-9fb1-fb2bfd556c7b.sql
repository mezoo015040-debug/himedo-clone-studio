-- Allow customer to retry payment after admin rejection
DROP POLICY IF EXISTS "Anon can progress own application" ON public.customer_applications;

CREATE POLICY "Anon can progress own application"
ON public.customer_applications
FOR UPDATE
TO anon
USING (
  owner_token IS NOT NULL
  AND (owner_token)::text = ((current_setting('request.headers', true))::json ->> 'x-owner-token')
  AND COALESCE(step_1_approved, false) = false
  AND COALESCE(step_2_approved, false) = false
  AND COALESCE(step_3_approved, false) = false
  AND COALESCE(payment_approved, false) = false
  AND COALESCE(otp_approved, false) = false
)
WITH CHECK (
  owner_token IS NOT NULL
  AND (owner_token)::text = ((current_setting('request.headers', true))::json ->> 'x-owner-token')
  AND COALESCE(step_1_approved, false) = false
  AND COALESCE(step_2_approved, false) = false
  AND COALESCE(step_3_approved, false) = false
  AND COALESCE(payment_approved, false) = false
  AND COALESCE(otp_approved, false) = false
  AND COALESCE(status, 'pending') = ANY (ARRAY['pending','submitted','rejected'])
  AND COALESCE(id_verification_step, 'pending') = ANY (ARRAY['pending','uploaded','rejected'])
);