# معماری فنی و جریان داده (Technical Architecture)

این سند ساختار مهندسی، معماری ماژول‌ها و نحوه جریان داده و محاسبات را در پروژه تشریح می‌کند.

---

## ۱. ساختار پوشه‌ها و سلسله‌مراتب فایل‌ها

```
/
├── app/
│   ├── layout.tsx                   # چیدمان ریشه (Root Layout) و تنظیم فونت و متادیتا
│   ├── page.tsx                     # صفحه اصلی (سوئیچینگ ابزارها)
│   └── globals.css                  # استایل‌های سراسری، فونت‌های محلی و Tailwind
├── components/
│   ├── layout/
│   │   └── AppShell.tsx             # پوسته اصلی شامل هدر مهندسی، سوییچ ابزار و فوتر
│   ├── resistor-calculator/         # ماژول آزمایشگاه مقاومت‌های موازی
│   │   ├── ResistorCalculatorView.tsx  # کانتینر اصلی وضعیت شبکه موازی
│   │   ├── CircuitSchematic.tsx        # رندرینگ SVG شماتیک زنده و تعاملی
│   │   ├── ResistorRow.tsx             # ردیف ورودی مقاومت و کنترل‌های واحد/حذف
│   │   └── ResultDisplay.tsx           # کارت نمایش مقاومت معادل و بازشونده فرمول
│   ├── voltage-divider/             # ماژول آزمایشگاه مقسم ولتاژ و پتانسیومتر
│   │   ├── VoltageDividerView.tsx      # کانتینر وضعیت مقسم و حل‌کننده‌های معکوس
│   │   ├── DividerSchematic.tsx        # شماتیک برداری مدار مقسم ولتاژ
│   │   ├── DividerResultDisplay.tsx    # نمایشگر پارامترهای تئونن، توان و جریان
│   │   ├── DividerStandardPairPicker.tsx # جدول بهینه‌ساز جفت مقاومت‌های استاندارد
│   │   └── DividerTableSortHeader.tsx  # هدر مرتب‌سازی ستون‌های جدول مهندسی
│   ├── passive-filter/              # ماژول آزمایشگاه فیلترهای فرکانسی RC و RL
│   │   ├── PassiveFilterView.tsx       # کانتینر وضعیت فیلترها و تنظیمات فرکانس تست
│   │   ├── FilterSchematic.tsx         # شماتیک برداری مدار فیلتر با موج متناوب AC
│   │   ├── FilterBodePlot.tsx          # رسم دیاگرام بُد (دامنه dB و فاز) در ۴ دهه لاگاریتمی
│   │   ├── FilterResultDisplay.tsx     # نمایشگر مقادیر فرکانس قطع، تاخیر و تضعیف
│   │   └── FilterStandardPicker.tsx    # انتخاب‌گر جفت قطعات تجاری E24/E12
│   ├── schematic-core/              # المان‌های زیربنایی SVG شماتیک (Power, Gnd, Pad, Resistor)
│   ├── custom-cursor/               # نشانگر ماوس شتاب‌یافته سخت‌افزاری 120FPS
│   └── ui/                          # کامپوننت‌های پایه UI (دکمه، کارت، ورودی، سلکتور)
├── lib/
│   ├── resistor-calc.ts             # موتور محاسبات شبکه موازی و کدهای رنگی
│   ├── voltage-divider-calc.ts      # موتور محاسبات مقسم ولتاژ و نقطه کار
│   ├── voltage-divider-solver.ts    # حل‌کننده‌های تحلیلی معادلات (R1, R2, Vin)
│   ├── voltage-divider-pair-finder.ts # جستجوگر چندهدفه مقاومت‌های استاندارد E24/E96
│   ├── voltage-divider-format.ts    # ماژول فرمت مهندسی واحدهای جریان، توان و مقاومت
│   ├── passive-filter-calc.ts       # موتور محاسبات فیزیک فیلترها و توابع تبدیل فرکانسی
│   ├── e-series.ts                  # جداول کدهای استاندارد EIA سری‌های E12/E24
│   └── utils.ts                     # توابع کمکی مشترک (cn برای کلاس‌های شرطی)
├── types/
│   ├── resistor.ts                  # تایپ‌های محاسبات مقاومت موازی
│   ├── voltage-divider.ts           # تایپ‌های مقسم ولتاژ و سری‌های استاندارد
│   └── passive-filter.ts            # تایپ‌های فیلترهای پسیو فرکانسی RC/RL
└── GEMINI.md                        # قوانین و استانداردهای توسعه
```

---

## ۲. جریان داده و مدیریت وضعیت (State Flow)

جریان داده در این نرم‌افزار به صورت یک‌طرفه (Unidirectional) و مبتنی بر Single Source of Truth مدیریت می‌شود:

```
[کاربر: ورودی مقادیر / تغییر واحد / حذف / اضافه شاخه]
                         │
                         ▼
        ┌──────────────────────────────────┐
        │   ResistorCalculatorView State   │
        │      items: ResistorItem[]       │
        └──────────────────────────────────┘
                         │
                         ├─────────────────────────────────────────┐
                         │                                         │
                         ▼                                         ▼
            ┌───────────────────────────┐             ┌─────────────────────────┐
            │ lib/resistor-calc.ts      │             │ CircuitSchematic.tsx    │
            │ calculateParallelResistance│             │ محاسبات سهم جریان Ik    │
            └───────────────────────────┘             │ رندر اتصالات و قطعات    │
                         │                            └─────────────────────────┘
                         ▼                                         │
        ┌──────────────────────────────────┐                       ▼
        │ ParallelCalculationResult        │─────────────► [نمایش بصری مدار]
        │ Req, Conductance, Error, Units   │
        └──────────────────────────────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │ ResultDisplay.tsx     │
             │ نمایش خروجی و فرمول   │
             └───────────────────────┘
```

---

## ۳. موتور محاسبات فیزیک مدار (`lib/resistor-calc.ts`)

محاسبات موازی با بهره‌گیری از مفهوم رسانایی الکتریکی (Conductance $G$ بر حسب زیمنس) انجام می‌شود تا از خطاهای ممیز شناور و پیچیدگی‌های فرمول‌های کسری تو در تو جلوگیری شود:

1. **تبدیل به اهم خالص**:
   $$R_{\text{ohms}} = \text{value} \times \text{multiplier}$$
   ($\text{multiplier} = 1$ برای $\Omega$، $10^3$ برای $\text{k}\Omega$، $10^6$ برای $\text{M}\Omega$)

2. **رسانایی هر شاخه و جمع کل**:
   $$G_k = \frac{\text{count}_k}{R_{\text{ohms}, k}}, \quad G_{\text{total}} = \sum_{k=1}^N G_k$$

3. **مقاومت معادل ($R_{eq}$)**:
   $$R_{eq} = \frac{1}{G_{\text{total}}}$$

4. **تشخیص اتصال کوتاه**:
   اگر حتی یک شاخه دارای مقدار $0\,\Omega$ باشد، کل مدار دچار اتصال کوتاه شده و بلافاصله $R_{eq} = 0\,\Omega$ با فلگ `isShortCircuit = true` بازگردانده می‌شود.

5. **مقیاس‌بندی هوشمند واحدها (Auto Unit Scaling)**:
   اگر $R_{eq} \ge 10^6\,\Omega \implies \text{M}\Omega$، اگر $R_{eq} \ge 10^3\,\Omega \implies \text{k}\Omega$، در غیر این صورت $\Omega$.

---

## ۴. موتور شماتیک الکتریکی (`CircuitSchematic.tsx`)

کامپوننت `CircuitSchematic` مقادیر `items` و شیء خروجی `result` را دریافت کرده و به شکل هندسی برداری SVG تبدیل می‌کند:
- **نقطه شروع و فاصله شاخه‌ها**:
  موقعیت شاخه $i$ به صورت $X_i = \text{firstBranchX} + i \times \text{branchSpacing}$ محاسبه می‌شود.
- **ترمینال انتهایی ریل**:
  ریل‌های اصلی ولتاژ بالا و پایین در نقطه اتصال آخرین شاخه ($X_{last}$) متوقف می‌شوند تا خط معلق در مدار وجود نداشته باشد.
- **محاسبه توزیع جریان شاخه‌ها**:
  $$\text{Current Share } \% = \frac{G_i}{G_{\text{total}}} \times 100\%$$
