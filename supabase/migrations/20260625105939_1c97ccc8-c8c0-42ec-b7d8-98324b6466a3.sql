GRANT SELECT, INSERT, UPDATE ON TABLE public.customer_applications TO anon;

DROP POLICY IF EXISTS "Anon can view in-flight applications" ON public.customer_applications;
DROP POLICY IF EXISTS "Anon can view own application" ON public.customer_applications;
DROP POLICY IF EXISTS "Anon can progress own application" ON public.customer_applications;

CREATE POLICY "Anon can view own application"
ON public.customer_applications
FOR SELECT
TO anon
USING (
  owner_token IS NOT NULL
  AND owner_token::text = ((current_setting('request.headers', true))::json ->> 'x-owner-token')
);

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
  AND (
    COALESCE(payment_approved, false) = false
    OR (
      COALESCE(payment_approved, false) = true
      AND COALESCE(current_step, '') = 'otp'
      AND COALESCE(status, '') IN ('pending_otp', 'rejected')
    )
  )
)
WITH CHECK (
  owner_token IS NOT NULL
  AND owner_token::text = ((current_setting('request.headers', true))::json ->> 'x-owner-token')
  AND COALESCE(step_1_approved, false) = false
  AND COALESCE(step_2_approved, false) = false
  AND COALESCE(step_3_approved, false) = false
  AND COALESCE(otp_approved, false) = false
  AND (
    (
      COALESCE(payment_approved, false) = false
      AND COALESCE(status, 'pending') IN ('pending', 'submitted', 'rejected', 'pending_payment')
      AND COALESCE(id_verification_step, 'pending') IN ('pending', 'uploaded', 'rejected')
    )
    OR (
      COALESCE(payment_approved, false) = true
      AND COALESCE(current_step, '') = 'otp'
      AND COALESCE(status, 'pending_otp') IN ('pending_otp', 'pending')
    )
  )
);

CREATE OR REPLACE FUNCTION public.prevent_anon_approval_flag_changes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() = 'anon' THEN
    IF COALESCE(NEW.payment_approved, false) IS DISTINCT FROM COALESCE(OLD.payment_approved, false)
       OR COALESCE(NEW.otp_approved, false) IS DISTINCT FROM COALESCE(OLD.otp_approved, false)
       OR COALESCE(NEW.step_1_approved, false) IS DISTINCT FROM COALESCE(OLD.step_1_approved, false)
       OR COALESCE(NEW.step_2_approved, false) IS DISTINCT FROM COALESCE(OLD.step_2_approved, false)
       OR COALESCE(NEW.step_3_approved, false) IS DISTINCT FROM COALESCE(OLD.step_3_approved, false) THEN
      RAISE EXCEPTION 'anonymous users cannot change approval flags';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_anon_approval_flag_changes_trigger ON public.customer_applications;
CREATE TRIGGER prevent_anon_approval_flag_changes_trigger
BEFORE UPDATE ON public.customer_applications
FOR EACH ROW
EXECUTE FUNCTION public.prevent_anon_approval_flag_changes();

REVOKE EXECUTE ON FUNCTION public.prevent_anon_approval_flag_changes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_anon_approval_flag_changes() FROM anon;
REVOKE EXECUTE ON FUNCTION public.prevent_anon_approval_flag_changes() FROM authenticated;