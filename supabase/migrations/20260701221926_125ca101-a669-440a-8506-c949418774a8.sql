REVOKE EXECUTE ON FUNCTION public.update_customer_application_public(uuid, uuid, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_customer_application_public(uuid, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_customer_application_public(uuid, uuid, jsonb) TO anon;