# LOADRYX → WordPress / WooCommerce Migration Kit

حزمة جاهزة لتحويل متجر LOADRYX من HTML/JS ثابت إلى WordPress + WooCommerce.

## محتويات الحزمة

- **`SETUP-GUIDE-AR.md`** — دليل التركيب خطوة بخطوة بالعربي (ابدأ من هنا).
- **`products.csv`** — ١٤ منتج جاهز للاستيراد عبر WooCommerce → Products → Import.
- **`loadryx-child-theme.zip`** — قالب فرعي (Child Theme) تابع لـ Storefront، بهوية LOADRYX (ألوان داكنة + أزرق نيوني + RTL + ر.س).
- **`loadryx-child-theme/`** — الكود المصدر للقالب (للتعديل لو احتجت).

## ترتيب الاستخدام

1. اقرأ `SETUP-GUIDE-AR.md` من البداية.
2. احجز استضافة وركّب WordPress.
3. ركّب WooCommerce.
4. ارفع `loadryx-child-theme.zip` كقالب فرعي.
5. استورد `products.csv`.
6. تابع باقي الخطوات في الدليل.

## ملاحظات

- **العملة:** SAR (الريال السعودي) — مفعّلة تلقائياً من القالب.
- **الاتجاه:** RTL — مفعّل تلقائياً.
- **الصور:** المنتجات تستورد صورها من `raw.githubusercontent.com/mo-genai/LOADRYX.v6/main/...`. تأكد من دمج هذا الفرع في `main` قبل الاستيراد، أو عدّل الروابط في الـ CSV.
- **بوابة الدفع:** الدليل يشرح Moyasar (سعودية، أرخص خيار للمدى/فيزا).
