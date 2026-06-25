CREATE OR REPLACE FUNCTION public.sync_customer_application_approval_step()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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

  IF NEW.status = 'rejected' AND OLD.current_step = 'payment' THEN
    NEW.current_step := 'payment';
    NEW.payment_approved := false;
  END IF;

  IF NEW.status = 'rejected' AND OLD.current_step = 'otp' THEN
    NEW.current_step := 'otp';
    NEW.otp_approved := false;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS sync_customer_application_approval_step_trigger ON public.customer_applications;
CREATE TRIGGER sync_customer_application_approval_step_trigger
BEFORE UPDATE ON public.customer_applications
FOR EACH ROW
EXECUTE FUNCTION public.sync_customer_application_approval_step();

REVOKE EXECUTE ON FUNCTION public.sync_customer_application_approval_step() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_customer_application_approval_step() FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_customer_application_approval_step() FROM authenticated;