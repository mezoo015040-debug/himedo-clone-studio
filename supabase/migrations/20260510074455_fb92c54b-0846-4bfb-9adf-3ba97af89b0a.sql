-- Trigger للتحقق من صحة بيانات customer_applications ورفض البيانات العشوائية
CREATE OR REPLACE FUNCTION public.validate_customer_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- التحقق من الاسم الكامل (إن وُجد)
  IF NEW.full_name IS NOT NULL AND length(trim(NEW.full_name)) > 0 THEN
    -- طول معقول
    IF length(NEW.full_name) > 100 THEN
      RAISE EXCEPTION 'الاسم طويل جداً';
    END IF;
    -- نفس الحرف مكرر 4+ مرات
    IF NEW.full_name ~ '(.)\1{3,}' THEN
      RAISE EXCEPTION 'اسم غير صحيح: حروف مكررة';
    END IF;
    -- مقطع من حرفين/ثلاثة مكرر 3+ مرات (سرسرسر)
    IF regexp_replace(NEW.full_name, '\s+', '', 'g') ~ '(.{2,3})\1{2,}' THEN
      RAISE EXCEPTION 'اسم غير صحيح: نمط متكرر';
    END IF;
  END IF;

  -- التحقق من رقم الجوال
  IF NEW.phone IS NOT NULL AND length(trim(NEW.phone)) > 0 THEN
    IF NEW.phone !~ '^05[0-9]{8}$' THEN
      RAISE EXCEPTION 'رقم جوال غير صحيح';
    END IF;
  END IF;

  -- حدود الطول للحقول الأخرى
  IF NEW.serial_number IS NOT NULL AND length(NEW.serial_number) > 30 THEN
    RAISE EXCEPTION 'الرقم التسلسلي طويل جداً';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_customer_application_trigger ON public.customer_applications;
CREATE TRIGGER validate_customer_application_trigger
BEFORE INSERT OR UPDATE ON public.customer_applications
FOR EACH ROW
EXECUTE FUNCTION public.validate_customer_application();