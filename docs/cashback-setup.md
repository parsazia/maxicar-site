# راه‌اندازی امن بازگشت وجه در محیط آزمایشی

این پیاده‌سازی فقط API و طرح پایگاه داده را اضافه می‌کند؛ هیچ پرداختی انجام نمی‌دهد و به دامنه/محیط production متصل نشده است.

## ۱. متغیرهای محیطی Preview در Vercel
در پروژه آزمایشی `maxicar-site` و فقط برای Preview تنظیم شوند:
- `SUPABASE_URL`: نشانی پروژه Supabase آزمایشی
- `SUPABASE_ANON_KEY`: کلید عمومی پروژه
- `SUPABASE_SERVICE_ROLE_KEY`: کلید محرمانه service role؛ هرگز در مرورگر یا Git قرار نگیرد.

## ۲. اجرای migration
فایل `supabase/migrations/202610270001_cashback_security.sql` را فقط روی دیتابیس Supabase آزمایشی اجرا کنید. اجرای migration روی دیتابیس واقعی ممنوع است تا پس از بررسی و تأیید جداگانه.

## ۳. ایجاد اولین مدیر
ابتدا مدیر از طریق Supabase Auth ایجاد شود. سپس در SQL Editor آزمایشی:
```sql
insert into public.profiles (id, role)
values ('UUID-OF-ADMIN-AUTH-USER', 'admin')
on conflict (id) do update set role = 'admin', updated_at = now();
```
فقط UUID کاربر مدیر واقعی را جایگزین کنید. هیچ مسیر عمومی برای ارتقای نقش وجود ندارد.

## ۴. ثبت سفارش واجد شرایط
تا اتصال منبع معتبر سفارش‌ها، بازپرداخت واقعی قابل اتکا نیست. سفارش‌های تأییدشده باید از اتصال سمت سرور در جدول `orders` درج شوند؛ فقط سفارش پرداخت‌شده و بررسی‌شده با `cashback_eligible=true` محاسبه می‌شود. لغو، مرجوع، پرداخت‌نشده و سفارش نامطمئن واجد شرایط نیستند. فعلاً هیچ API عمومی برای نوشتن سفارش ایجاد نشده است.

## API
- `GET /api/cashback/requests`: تاریخچه مشتری واردشده
- `POST /api/cashback/requests`: درخواست ماه جاری؛ مبلغ فقط سمت دیتابیس محاسبه می‌شود
- `GET /api/admin/cashback/requests?status=pending`: صف مدیر
- `PATCH /api/admin/cashback/requests`: تغییر وضعیت مجاز و ثبت رویداد
همه مسیرها به `Authorization: Bearer <Supabase access token>` نیاز دارند. مدیر از روی نقش ثبت‌شده در `profiles` تشخیص داده می‌شود.

## گردش وضعیت
`pending -> processing -> paid` یا `pending -> rejected` یا `processing -> rejected`. درخواست‌های `paid` و `rejected` بسته‌اند. تغییر وضعیت صرفاً ثبت می‌شود و هیچ انتقال وجهی انجام نمی‌دهد.
