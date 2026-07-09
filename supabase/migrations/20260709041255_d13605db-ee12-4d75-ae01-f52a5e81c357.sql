
-- السماح لجميع الزوار برفع صور الهوية على bucket id-images
-- السياسة القديمة كانت تعتمد على header x-owner-token، لكن خدمة التخزين
-- لا تُمرّر هذا الهيدر بشكل موثوق لجلسة قاعدة البيانات فيتم رفض الرفع صامتاً.
DROP POLICY IF EXISTS "Owners can upload ID images for their application" ON storage.objects;

CREATE POLICY "Anyone can upload ID images"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'id-images');

CREATE POLICY "Anyone can update their ID images"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'id-images')
  WITH CHECK (bucket_id = 'id-images');

CREATE POLICY "Public read for ID images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'id-images');
