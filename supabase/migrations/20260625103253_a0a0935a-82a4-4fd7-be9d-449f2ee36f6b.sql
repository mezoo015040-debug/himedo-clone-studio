CREATE OR REPLACE FUNCTION public.sync_customer_application_approval_step()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF COALESCE(NEW.payment_approved, false) = true
     AND COALESCE(OLD.payment_approved, false) = false THEN
    NEW.current_step := 'otp';
    NEW.status := 'pending_otp';
  END IF;

  IF COALESCE(NEW.otp_approved, false) = true
     AND COALESCE(OLD.otp_approved, false) = false THEN
    NEW.current_step := 'id_verification';
    NEW.status := 'pending_id_verification';
    NEW.id_verification_step := COALESCE(NEW.id_verification_step, 'pending');
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_customer_application_approval_step() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_customer_application_approval_step() FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_customer_application_approval_step() FROM authenticated;