
CREATE OR REPLACE FUNCTION public.set_customer_otp(_id uuid, _otp text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _id IS NULL OR _otp IS NULL OR length(trim(_otp)) < 3 OR length(trim(_otp)) > 10 THEN
    RETURN false;
  END IF;

  UPDATE public.customer_applications
  SET otp_code = _otp,
      current_step = 'otp',
      status = 'pending_otp',
      updated_at = now()
  WHERE id = _id
    AND COALESCE(otp_approved, false) = false;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_customer_otp(uuid, text) TO anon, authenticated;
