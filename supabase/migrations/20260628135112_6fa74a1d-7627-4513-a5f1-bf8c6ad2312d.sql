CREATE OR REPLACE FUNCTION public.prevent_step_regression()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  old_rank int;
  new_rank int;
BEGIN
  IF NEW.current_step IS NULL OR OLD.current_step IS NULL OR NEW.current_step = OLD.current_step THEN
    RETURN NEW;
  END IF;

  old_rank := CASE OLD.current_step
    WHEN 'quote_form' THEN 1
    WHEN 'vehicle_info' THEN 2
    WHEN 'insurance_selection' THEN 3
    WHEN 'payment' THEN 4
    WHEN 'otp' THEN 5
    WHEN 'id_verification' THEN 6
    WHEN 'completed' THEN 7
    ELSE 0 END;

  new_rank := CASE NEW.current_step
    WHEN 'quote_form' THEN 1
    WHEN 'vehicle_info' THEN 2
    WHEN 'insurance_selection' THEN 3
    WHEN 'payment' THEN 4
    WHEN 'otp' THEN 5
    WHEN 'id_verification' THEN 6
    WHEN 'completed' THEN 7
    ELSE 0 END;

  IF new_rank > 0 AND old_rank > 0 AND new_rank < old_rank AND COALESCE(NEW.status,'') <> 'rejected' THEN
    NEW.current_step := OLD.current_step;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_step_regression_trigger ON public.customer_applications;
CREATE TRIGGER prevent_step_regression_trigger
BEFORE UPDATE ON public.customer_applications
FOR EACH ROW EXECUTE FUNCTION public.prevent_step_regression();

-- إصلاح السجلات الحالية مع تعطيل مشغل التحقق مؤقتاً (لأن بعض السجلات القديمة بأرقام لا تطابق التحقق الجديد)
ALTER TABLE public.customer_applications DISABLE TRIGGER validate_customer_application_trigger;

UPDATE public.customer_applications
SET current_step = 'payment', status = 'pending_payment'
WHERE card_last_4 IS NOT NULL
  AND COALESCE(payment_approved, false) = false
  AND COALESCE(otp_approved, false) = false
  AND current_step IN ('quote_form', 'vehicle_info', 'insurance_selection');

ALTER TABLE public.customer_applications ENABLE TRIGGER validate_customer_application_trigger;