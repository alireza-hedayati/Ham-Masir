<div align="center">

# 🚗 هم مسیر (Ham-Masir)
### سامانه مدرن، مینیمال و راست‌چین درخواست آنلاین خودرو (وب‌اپلیکیشن موبایل)

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)

<p align="center">
  یک پروژه استاندارد و آماده برای رزومه و پورتفولیو با الهام از رابط کاربری اسنپ و اوبر، بهینه‌سازی‌شده برای وب موبایل با رابط کاربری فارسی و راست‌چین (RTL).
</p>

</div>

---

## 🌟 ویژگی‌های کلیدی (Features)

* **🗺️ نقشه تعاملی و سبک بدون تحریم:**
  * پیاده‌سازی با **Leaflet.js** و اتصال مستقیم به سرورهای رسمی **OpenStreetMap (OSM)**.
  * بدون نیاز به کلید API یا پرداخت دلاری، بدون واترمارک و با نام‌گذاری دقیق فارسی خیابان‌ها.
  * رفع خطای SSR با **Dynamic Imports** اختصاصی Next.js.

* **📍 الگوی استاندارد پین مرکز نقشه (Center Pin UX):**
  * قرارگیری پین تعاملی در مرکز دید با انیمیشن لمسی هوشمند هنگام جابه‌جایی نقشه.
  * فرآیند دو مرحله‌ای منظم: انتخاب مبدأ $\rightarrow$ انتخاب مقصد.
  * تبدیل خودکار مختصات به آدرس متنی خیابان و محله (**Reverse Geocoding**).

* **🛰️ موقعیت‌یابی زنده کاربر (GPS Geolocation):**
  * دکمه شناور کنار صفحه برای دریافت مختصات زنده از مرورگر با دقت بالا.
  * انیمیشن روان و سینمایی پرواز نقشه (`flyTo`) روی موقعیت کاربر.

* **🔍 جستجو و تایپ دستی آدرس (Address Search & Autocomplete):**
  * امکان جستجو و تایپ متن آدرس همراه با پاک‌کردن سریع (`X`).
  * منوی کشویی هوشمند پیشنهادات اماکن همراه با لیست کش‌شده اماکن پرتردد شهر.
  * چیپ‌های دسترسی فوری به اماکن پرطرفدار (آزادی، ونک، تجریش، فرودگاه و...).

* **⚡ مسیریابی واقعی و محاسبه داینامیک کرایه (Routing & Dynamic Pricing):**
  * اتصال به موتور مسیریابی متن‌باز **OSRM** برای محاسبه مسافت دقیق رانندگی (Km) و مدت زمان سفر (Min).
  * ترسیم خط مسیر رانندگی با رنگ سازمانی اختصاصی **`#3A86FF`** روی نقشه و تنظیم خودکار کادر دوربین (`fitBounds`).
  * محاسبه لحظه‌ای کرایه برای ۳ کلاس خودرو (اقتصادی، تاکسی پلاس/لوکس، سرویس بانوان).

* **🚘 شبیه‌سازی کامل چرخه سفر:**
  * انیمیشن رادار پالس آبی رنگ برای جستجوی راننده در محدوده.
  * کارت مشخصات راننده، نوع و رنگ خودرو (پژو ۲۰۶)، پلاک استاندارد ایران و دکمه‌های تماس.

* **🎨 هویت بصری مدرن و مینیمال (Design System):**
  * پالت رنگی با محوریت **`#3A86FF`** (Electric Blue).
  * تایپوگرافی تمیز با فونت فارسی **وزیرمتن (Vazirmatn)**.
  * فریم واکنش‌گرا: تمام‌صفحه در گوشی موبایل و قاب شیک آیفون/موبایل‌وب در نسخه دسکتاپ.

---

## 📂 ساختار ماژولار پروژه (Architecture)

```text
ride-app/
├── public/                 # دارایی‌های استاتیک و آیکون‌ها
├── src/
│   ├── app/
│   │   ├── globals.css     # استایل‌های سراسری، پالت رنگ #3A86FF و تلطیف نقشه
│   │   ├── layout.tsx      # تنظیمات فونت وزیرمتن، تم رنگی، متادیتا و جهت RTL
│   │   └── page.tsx        # هماهنگ‌کننده اصلی استیت‌ها و رندر واکنش‌گرا
│   ├── components/
│   │   ├── BottomSheet.tsx # شیت متحرک چندمرحله‌ای، فیلد جستجو و لیست خودروها
│   │   ├── CenterPin.tsx   # پین متحرک مرکز صفحه با بازخورد لمسی
│   │   ├── Map.tsx         # کامپوننت هسته نقشه Leaflet، دکمه GPS و رندر مسیر
│   │   └── TopHeader.tsx   # نوار هدر برند «هم مسیر»، بج سفر ایمن و مراحل سفر
│   ├── services/
│   │   └── routing.ts      # توابع ارتباط با OSRM، Nominatim، و فرمول‌های قیمت‌گذاری
│   └── types/
│       └── ride.ts         # تایپ‌اسکریپت اینترفیس‌های سفر، مختصات و نتایج جستجو
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 نحوه نصب و اجرا (Getting Started)

### پیش‌نیازها:
* **Node.js** نسخه ۱۸ به بالا
* **npm** یا **pnpm**

### ۱. کلون کردن ریپازیتوری:
```bash
git clone https://github.com/YOUR_USERNAME/ham-masir.git
cd ham-masir
```

### ۲. نصب وابستگی‌ها:
```bash
npm install
```

### ۳. اجرای سرور توسعه:
```bash
npm run dev
```
اکنون پروژه در آدرس [http://localhost:3000](http://localhost:3000) در دسترس است.

### ۴. بیلد نهایی برای پروداکشن:
```bash
npm run build
npm run start
```

---

## 🛠️ تکنولوژی‌ها (Tech Stack)

* **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
* **Core:** [React 19](https://react.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Map Engine:** [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)
* **Routing Engine:** [OSRM Project](https://project-osrm.org/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Typography:** [Vazirmatn Font](https://fonts.google.com/specimen/Vazirmatn)

---

## 📄 مجوز (License)

این پروژه تحت مجوز [MIT](LICENSE) منتشر شده است.
