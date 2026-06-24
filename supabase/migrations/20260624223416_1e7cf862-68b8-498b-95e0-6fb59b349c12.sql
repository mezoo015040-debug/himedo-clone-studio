
-- 1) Add owner_token column for anonymous ownership binding
ALTER TABLE public.customer_applications
  ADD COLUMN IF NOT EXISTS owner_token uuid;

-- 2) Replace anon UPDATE policy to require matching owner_token header
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
  AND COALESCE(payment_approved, false) = false
  AND COALESCE(otp_approved, false) = false
)
WITH CHECK (
  owner_token IS NOT NULL
  AND owner_token::text = ((current_setting('request.headers', true))::json ->> 'x-owner-token')
  AND COALESCE(step_1_approved, false) = false
  AND COALESCE(step_2_approved, false) = false
  AND COALESCE(step_3_approved, false) = false
  AND COALESCE(payment_approved, false) = false
  AND COALESCE(otp_approved, false) = false
  AND COALESCE(status, 'pending'::text) = ANY (ARRAY['pending'::text, 'submitted'::text])
  AND COALESCE(id_verification_step, 'pending'::text) = ANY (ARRAY['pending'::text, 'uploaded'::text])
);

-- 3) Require new INSERTs to include an owner_token
DROP POLICY IF EXISTS "Anyone can create applications" ON public.customer_applications;

CREATE POLICY "Anyone can create applications"
ON public.customer_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (owner_token IS NOT NULL);

-- 4) Remove public listing policy on id-images bucket.
-- Public URLs continue to work via the public storage CDN endpoint;
-- only the ability to list/enumerate via the SQL API is removed.
DROP POLICY IF EXISTS "Anyone can view ID images" ON storage.objects;
