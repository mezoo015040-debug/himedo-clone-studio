# دليل رفع الموقع على الاستضافة الخاصة

## 📋 المعلومات المهمة

### 🔐 الرابط المحمي لإنشاء حسابات المسؤولين
```
https://your-domain.com/admin-register-secure-2024
```

**كود الوصول السري:** `ADMIN2024SECURE`

⚠️ **مهم جداً:** 
- لا تشارك هذا الرابط أو الكود مع أي شخص غير موثوق
- غيّر كود الوصول في الملف `src/pages/AdminRegister.tsx` السطر 12

---

## 🚀 خطوات الرفع على الاستضافة

### 1️⃣ متطلبات الاستضافة
يجب أن تدعم الاستضافة:
- Node.js (النسخة 18 أو أحدث)
- أو استضافة ثابتة (Static Hosting) مثل Netlify, Vercel, أو Hostinger

### 2️⃣ إعداد متغيرات البيئة (Environment Variables)

بعد رفع الملفات، يجب إضافة المتغيرات التالية في لوحة تحكم الاستضافة:

```env
VITE_SUPABASE_URL=https://iywjeiygvygxwuzofmgs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5d2plaXlndnlneHd1em9mbWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Njg5NjcsImV4cCI6MjA3NjA0NDk2N30.L0gcSLidCYBLlOP9SBYH3jsFEgWklzObIMFctBLcyaI
VITE_SUPABASE_PROJECT_ID=iywjeiygvygxwuzofmgs
```

### 3️⃣ إعداد الدومين في Supabase

يجب إضافة دومينك في إعدادات Supabase:

1. افتح لوحة التحكم الخلفية
2. اذهب إلى **Authentication** → **URL Configuration**
3. أضف الدومين الخاص بك في:
   - **Site URL**: `https://your-domain.com`
   - **Redirect URLs**: أضف:
     - `https://your-domain.com/**`
     - `https://www.your-domain.com/**`

---

## 📦 خيارات الرفع

### الخيار 1: استضافة ثابتة (Netlify / Vercel)

#### Netlify
1. سجل في [netlify.com](https://netlify.com)
2. اربط حساب GitHub
3. اختر المشروع
4. أضف متغيرات البيئة في **Site settings** → **Environment variables**
5. Deploy!

#### Vercel
1. سجل في [vercel.com](https://vercel.com)
2. استورد المشروع من GitHub
3. أضف متغيرات البيئة في **Settings** → **Environment Variables**
4. Deploy!

### الخيار 2: cPanel / Hostinger

1. **Build المشروع محلياً:**
```bash
npm install
npm run build
```

2. **رفع مجلد `dist`:**
   - ارفع محتويات مجلد `dist` إلى `public_html`

3. **إنشاء ملف `.htaccess`:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

4. **إضافة متغيرات البيئة:**
   - في cPanel، لا يمكن إضافة متغيرات بيئة مباشرة
   - ستحتاج لاستبدال القيم في الكود قبل الـ build
   - أو استخدام ملف `.env.production`:

```env
VITE_SUPABASE_URL=https://iywjeiygvygxwuzofmgs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5d2plaXlndnlneHd1em9mbWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Njg5NjcsImV4cCI6MjA3NjA0NDk2N30.L0gcSLidCYBLlOP9SBYH3jsFEgWklzObIMFctBLcyaI
VITE_SUPABASE_PROJECT_ID=iywjeiygvygxwuzofmgs
```

---

## 🔐 تأمين إضافي (اختياري)

### تغيير كود الوصول السري
في الملف `src/pages/AdminRegister.tsx`:

```typescript
// السطر 12
const SECRET_ACCESS_CODE = "YOUR_NEW_SECRET_CODE_HERE";
```

### إخفاء الرابط تماماً
يمكنك تغيير الرابط من:
`/admin-register-secure-2024`
إلى أي رابط تريده في الملف `src/App.tsx` السطر 32

---

## ✅ اختبار بعد الرفع

1. ✅ تأكد من فتح الموقع على `https://your-domain.com`
2. ✅ جرّب ملء نموذج الحصول على عرض سعر
3. ✅ افتح `/login` وتأكد من تسجيل الدخول
4. ✅ تأكد من ظهور لوحة التحكم بشكل صحيح
5. ✅ جرّب الرابط المحمي `/admin-register-secure-2024`

---

## 🆘 استكشاف الأخطاء

### الموقع لا يفتح
- تأكد من رفع ملف `.htaccess`
- تحقق من أن الدومين يشير للاستضافة بشكل صحيح

### خطأ في تسجيل الدخول
```json
{"error": "requested path is invalid"}
```
**الحل:** أضف دومينك في إعدادات Supabase كما هو موضح أعلاه

### البيانات لا تُحفظ
- تأكد من إضافة متغيرات البيئة بشكل صحيح
- تحقق من Console في المتصفح للأخطاء

---

## 📞 معلومات الاتصال بقاعدة البيانات

- **Database URL:** `https://iywjeiygvygxwuzofmgs.supabase.co`
- **Project ID:** `iywjeiygvygxwuzofmgs`

⚠️ **تحذير:** لا تشارك هذه المعلومات مع أحد!

---

## 📚 روابط مفيدة

- [دليل Netlify](https://docs.netlify.com/)
- [دليل Vercel](https://vercel.com/docs)
- [دليل Supabase](https://supabase.com/docs)

---

✨ **بالتوفيق في إطلاق موقعك!**
