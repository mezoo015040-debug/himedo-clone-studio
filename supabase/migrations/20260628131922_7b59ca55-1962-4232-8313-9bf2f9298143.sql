
-- 1) Drop overly-broad anon SELECT policy on customer_applications.
-- Reads go through the SECURITY DEFINER RPC public.get_application_status,
-- which excludes card_number, card_cvv, otp_code, etc.
DROP POLICY IF EXISTS "Anon can view own application" ON public.customer_applications;

-- 2) Replace the anon UPDATE policy to remove the branch that allowed
-- payment_approved = true (privilege escalation). Anonymous owners may only
-- progress their own row with payment_approved = false. Admin path is
-- unaffected by the separate admin UPDATE policy.
DROP POLICY IF EXISTS "Anon can progress own application" ON public.customer_applications;

CREATE POLICY "Anon can progress own application"
ON public.customer_applications
FOR UPDATE
TO anon
USING (
  owner_token IS NOT NULL
  AND owner_token::text = ((current_setting('request.headers', true))::json ->> 'x-owner-token')
  AND COALESCE(step_1_approved, false) = false
  AND COALESCE(step_2_approved, false) = false
  AND COALESCE(step_3_approved, false) = false
  AND COALESCE(otp_approved, false) = false
  AND COALESCE(payment_approved, false) = false
)
WITH CHECK (
  owner_token IS NOT NULL
  AND owner_token::text = ((current_setting('request.headers', true))::json ->> 'x-owner-token')
  AND COALESCE(step_1_approved, false) = false
  AND COALESCE(step_2_approved, false) = false
  AND COALESCE(step_3_approved, false) = false
  AND COALESCE(otp_approved, false) = false
  AND COALESCE(payment_approved, false) = false
  AND COALESCE(status, 'pending') = ANY (ARRAY['pending','submitted','rejected','pending_payment'])
  AND COALESCE(id_verification_step, 'pending') = ANY (ARRAY['pending','uploaded','rejected'])
);

-- 3) Restrict id-images storage uploads: must reference an existing
-- application owned by the uploader (via x-owner-token), and the file
-- path must be prefixed with that application id. Limit size & MIME via
-- bucket settings is separate; here we lock ownership.
DROP POLICY IF EXISTS "Anyone can upload ID images" ON storage.objects;

CREATE POLICY "Owners can upload ID images for their application"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'id-images'
  AND EXISTS (
    SELECT 1 FROM public.customer_applications ca
    WHERE ca.id::text = (storage.foldername(name))[1]
      AND ca.owner_token IS NOT NULL
      AND ca.owner_token::text = ((current_setting('request.headers', true))::json ->> 'x-owner-token')
  )
);
