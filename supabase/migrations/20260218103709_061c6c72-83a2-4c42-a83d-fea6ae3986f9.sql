
-- إضافة أعمدة صور الهوية في جدول الطلبات
ALTER TABLE public.customer_applications
  ADD COLUMN IF NOT EXISTS id_front_url text,
  ADD COLUMN IF NOT EXISTS id_back_url text,
  ADD COLUMN IF NOT EXISTS id_verification_step text DEFAULT 'pending';

-- إنشاء bucket للصور
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-images', 'id-images', true)
ON CONFLICT (id) DO NOTHING;

-- سياسة رفع الصور للجميع
CREATE POLICY "Anyone can upload ID images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'id-images');

-- سياسة قراءة الصور للجميع
CREATE POLICY "Anyone can view ID images"
ON storage.objects FOR SELECT
USING (bucket_id = 'id-images');
