# Apex audit kamchiliklarini tuzatish — Implementation Plan

> **Ijro holati (2026-11-17):** Foydalanuvchining “boshla unda” topshirig‘i bilan lokal tuzatishlar boshlandi. T02 va T05 bajarilib tekshirildi; qolgan vazifalarning bajarilgan qismi va tashqi bog‘liqliklari [joriy hisobotda](../../audits/remediation-progress-2026-11-17.md). Quyidagi “faqat reja” iboralari dastlabki rejalashtirish bosqichiga tegishli. Commit, push va deploy bajarilmadi.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Ushbu hujjat reja; implementatsiya, commit, push va deploy bu ko‘rib chiqish doirasida bajarilmaydi.

**Goal:** 17-noyabr auditidagi ochiq kamchiliklarni amaldagi kod va avvalgi tuzatishlar bilan solishtirib, mavjud ko‘p sahifali saytni ishonchli kontent, aniq SEO va o‘lchanadigan murojaat oqimi bilan rivojlantirish.

**Architecture:** Mavjud App Router, server komponentlar, umumiy xizmat shablonlari va `src/content` manbalari saqlanadi. Booking UI va mavjud submission adapter ajratilgan holda qoladi. Yangi xizmat/hudud sahifalari tasdiqlangan kontentga asoslanib keyingi bosqichda qo‘shiladi; qayta dizayn, yangi CMS yoki Quo integratsiyasi bu rejaning sharti emas.

**Tech Stack:** package.json bo‘yicha Next.js 16.3.4, React 19.2.8, TypeScript strict, Tailwind CSS 4; mavjud booking va review modullari.

**Spec:** `apex-audit/apex-seo-audit-2026-11-17.md`, `apex-audit/apex-sahifalar-va-kontent.md`, `apex-audit/apex-parsed-pages.json`, `apex-audit/apex-texnik-dalillar.json`, `AGENTS.md`.

**Sana:** 2026-11-17, Asia/Tashkent.

## Qamrov va dalil chegarasi

Ushbu reja mahalliy kod, yangi audit va oldingi hisobotlar asosida tuzildi. Bu sessiyada production qayta crawl qilinmadi, GSC/GA4/CRM hisoblari ochilmadi va real ariza yuborilmadi. Auditdagi Lighthouse va HTTP raqamlari audit muallifining saqlangan natijalari; bu sessiyaning qayta o‘lchovi emas.

Asosiy baseline: yangi auditda 20 ochiq sahifa, sitemap’da 19 URL, 20/20 HTTP 200, har sahifada bitta H1, noyob title/description va mos canonical qayd etilgan. Shu sabab texnik poydevorni qayta qurish ustuvor emas. `src/content/routes.ts` va `services.ts` ham hozir 19 marketing yo‘lini beradi. `/review` yordamchi noindex sahifa bo‘lib qoladi.

Qo‘shimcha manbalar: `ON_PAGE_SEO_ISSUES.csv`, `SEO_RECOMMENDATIONS.md`, `IMPLEMENTATION_PROGRESS.md`, `VISUAL_QA_REPORT.md`, `UI_UX_AUDIT.md`, `docs/UX_UI_AUDIT_2026-11-16.md`, `docs/audits/service-workspace-2026-11-16/browser-qa.md`. Tarixiy CSV’dagi `Pending` yozuvi muammo bugun ham ochiq ekanini anglatmaydi.

## Global Constraints

- “Treat all business details as unverified until supplied.” Koddagi `client-approved` izohi oldingi qarorni ko‘rsatadi, ammo amaldagi sertifikat, ish soati yoki qamrovni mustaqil tasdiqlamaydi; mavjud faktlar o‘zboshimchalik bilan almashtirilmaydi.
- “Do not build future pages or integrations before their roadmap phase unless a task explicitly expands scope.” Hozir faqat reja tayyorlanadi. Ikkinchi bosqich sahifalari quyida shartli ish sifatida belgilangan.
- “Use tokens in `src/app/globals.css`; do not scatter raw brand colors across components.” Tasdiqlangan ko‘rinish va mobil harakatlar saqlanadi.
- “Use server components by default. Add `"use client"` only at the narrowest interactive boundary.” Yangi runtime dependency uchun aniq zarurat bo‘lishi kerak.
- “Do not claim browser, visual, integration, or release validation unless it was performed.” Mock booking haqiqiy yetkazilish dalili emas; lab natijasi field Core Web Vitals emas.
- “Before handoff, run `npm run lint`, `npm run typecheck`, and `npm run build`.” Windows’da `npm.cmd` ishlatiladi.
- Dasturlashdan oldin o‘rnatilgan Next qo‘llanmasining tegishli bo‘limi o‘qiladi. Reja uchun metadata, sitemap, Image va CSP yo‘riqnomalari ko‘rildi; `priority` eskirgan, mavjud hero allaqachon `preload` ishlatadi.
- Auditlarning asl fayllari saqlanadi. Xulosa va joriy status alohida kuzatiladi; boshlang‘ich `apex-audit/` va `qa-runs/` untracked papkalari o‘chirilmaydi yoki avtomatik commit qilinmaydi.

## Review Focus

1. `?book=1&utm_source=...` ochilganda query tozalanishidan oldin attribution olinishi, shaxsiy ma’lumot analytics’ga chiqmasligi — T06 testi.
2. API xatosi, noaniq tarmoq javobi yoki qayta render conversion’ni takror yozmasligi — T06 testi; haqiqiy saqlash T12 staging tekshiruvida.
3. Bir xil nomli county’lar turli shtatlarda aralashmasligi; noma’lum state/county yo‘li 404 qaytarishi — T05 va T10 tekshiruvlari.
4. Privacy havolasini ochganda to‘ldirilayotgan forma yo‘qolmasligi; 320px, qisqa landscape va 200% zoom’da submit ochiq qolishi — T03 va T12 tekshiruvlari.
5. CSP, image optimizatsiyasi va analytics yuklanishi booking, chat va review rasmlarini buzmasligi — T08 va T12 tekshiruvlari.

## Auditlarni amaldagi holat bilan yarashtirish

| Topilma / eski ID | Hozirgi dalil | Rejadagi qaror |
|---|---|---|
| OP-01, OP-02 — takroriy title, Twitter inheritance | Home’da `title.absolute`, About/Contact’da qisqa title; root Twitter’da faqat card qolgan | Asosiy fix mavjud; T02/T12 regressiya. `/review` title dublikati alohida ochiq |
| OP-06 — Contact’da booking ulanmagan degan matn | `contact/page.tsx` endi received/coverage/appointment farqini tushuntiradi | Eski matn muammosi yopilgan; live delivery T12’da alohida tekshiriladi |
| OP-07 — appliance/water-heater rejalashtirish matni | `ServiceDirectory` hozir amaliy tayyorgarlik ko‘rsatmasini chiqaradi | Placeholder olib tashlangan, lekin xizmat tafsilotlari hali kam — T04 |
| OP-05 — umumiy heading’lar; OP-04 — sahifa maqsadi | Shablonlar yangilangan, ayrim marketing H1’lari hanuz shiorli | To‘liq redesign emas; T04’da xizmat/maqsadga mos tahrir |
| OP-17, OP-20 — services hub va brands havolalari | Navigatsiyada services destination, xizmat shablonida `/brands` havolasi bor | Mavjud yechim saqlanadi, T12 regressiya |
| OP-18 — reviews discovery | `/reviews` `completedPublicPaths` ichida, yangi audit sitemap’da ham bor | Sitemap qismi yopilgan; About/xizmat kontekstidagi havolalar T07’da |
| OP-12 — natijalar kelajak zamonida | `ApexResults` endi completed work deb ko‘rsatadi | Eski muammo yopilgan; ish kim tomonidan bajarilgani T01’da aniqlanadi |
| OP-24 — breadcrumb | `ServiceHero`da ko‘rinadigan breadcrumb bor; JSON-LD yo‘q | Navigatsiyani qayta yozmasdan T05’da umumiy model va markup |
| OP-28 — juda kichik hero carousel dot | `HeroImageCarousel` fayli mavjud, lekin `src` ichida import/foydalanish topilmadi | Hozirgi homepage defekti sifatida kiritilmaydi; qayta ishlatilsa target-size fix shart |
| OP-29 va VQA-001…004 | Ikki rangli focus CSS mavjud; to‘rtta visual fix oldingi QA’da yopilgan | Qayta implementatsiya emas, T12 regressiya; yangi footer accessible-name muammosi T02 |
| OP-03, OP-08, OP-09, OP-30 | Service matnlari hanuz qisqa/umumiy; heating description boiler’ni sanamaydi | T04 |
| OP-10, OP-11, OP-13, OP-14 | Mustaqil ustalar modeli, statik Live Now, dryer label/caption va “first visit” iborasi hali tekshiruv talab qiladi | T01, T04, T07 |
| OP-15, OP-16, OP-25, OP-26, OP-27 | Review association masalasi lokal kod bilan hal bo‘lmaydi; generic ALT va mavjud media xaritasi saqlangan | T07; mavjud foto yoki mijoz matni dalilsiz almashtirilmaydi |
| OP-19, OP-21, OP-22, OP-23 | Boiler contextual link, homepage entity, county aniqligi, stable ID masalalari ochiq | T04, T05 |

Yangi audit bo‘yicha muhim kod dalillari:

- `company.ts`: email/address/hours — `null`; `trust.ts`: Live Now statik. Ish soati haqidagi boshqa satr bor, lekin to‘liq kun/vaqt zonasi va jonli status manbasi yo‘q.
- Privacy/terms route’lari va booking/footer havolalari topilmadi; formadagi kommentariy ham yo‘q sahifaga link bermaslikni aytadi.
- `sitemap.ts` har entry uchun `new Date()` ishlatadi: auditdagi bir xil lastmod endi kod bilan tushuntirildi.
- `ServiceStructuredData` provider sifatida faqat Apex nomini, areaServed uchun besh shtatni beradi; `OrganizationStructuredData` faqat About’da ishlatiladi.
- GA4/GTM/Plausible yoki UTM event integratsiyasi qidiruvda topilmadi. Mavjud campaignToken/sourcePath mexanizmi bor; uni yangidan yozish shart emas.
- `BookNowUrlSync` `router.replace(pathname)` orqali query’ni tozalaydi. Analitika shu nuqtadan oldin attribution olishi kerak.
- `ServiceHero` allaqachon `next/image` va `preload` ishlatadi. LCP uchun “preload qo‘shish” tayyor yechim emas.
- `src/app/icon.png` va `apple-icon.png` har biri 285 831 bayt. Kichik variant ajratish konkret optimizatsiya.

## Ish tartibi

| Bosqich | Ishlar | Ustuvorlik | Asosiy bog‘liqlik |
|---|---|---|---|
| 1A — mavjud saytni tuzatish | T01 biznes faktlari; T02 tezkor texnik fix | P1 / kichik P2–P3 | T02 T01 javoblarini kutmasdan bajariladi |
| 1B — ishonch va konversiya | T03 privacy; T04 mavjud kontent; T06 analitika | P1 | Tasdiqlangan matn, xizmat qamrovi va analytics hisob tanlovi |
| 1C — schema va dalillar | T05 entity; T07 reviews/foto; T08 redirect/performance/headers | P2, ayrim P3 | T01; tashqi konfiguratsiya va media dalillari |
| 2 — talabga mos sahifalar | T09 appliance; T10 lokal kontent | P1 strategik imkoniyat, ammo shartli implementatsiya | T04 pilot, real xizmat/hudud faktlari va bosqich doirasi |
| 3 — yakuniy tekshiruv va kuzatuv | T11 o‘lchash; T12 regressiya/handoff | Har release uchun zarur | Oldingi tegishli vazifalar |

Rejalashtirish uchun 4 haftalik ketma-ketlik: 1-hafta T01–T03 va T06 spetsifikatsiyasi; 2-hafta T04–T08; 3-hafta tasdiqlangan T09–T10 pilotlari; 4-hafta T11–T12 va qayta ishlash. Bu muddat kafolati emas: kontent, hisob kirishi va tasdiqlar kechiksa kalendar suriladi. Texnik murakkablik quyida; kontent yozish va huquqiy ko‘rib chiqish alohida mehnat.

## T01 — Biznes modeli va yagona faktlar manbasi

**Ustuvorlik:** P1. **Murakkablik:** kod — kichik; fakt yig‘ish — tashqi bog‘liqlik. **Mas’ul:** biznes egasi + kontent + dasturchi.

**Fayllar:** `src/content/company.ts`, `trust.ts`, `homepage.ts`, `site.ts`, `offers.ts`; `src/types/content.ts`; `src/components/navigation/site-header.tsx`; `src/app/(marketing)/about/page.tsx`, `contact/page.tsx`; `src/features/booking/book-now-modal.tsx`. Yangi qaror hujjati: `docs/BUSINESS_FACTS.md`.

**Kirish → chiqish:** operatorning tasdiqlangan ma’lumotlari → boshqa vazifalar foydalanadigan biznes roli, qamrov, narx, aloqa va javobgarlik matnlari.

- [ ] Bitta fakt jadvaliga: servis/koordinator roli, operator nomi, email, ish kunlari/vaqt zonasi, telefon javob tartibi, county×xizmat qamrovi, commercial xizmatlar, $89 sharti, maintenance chegirmasi, sertifikat/tajriba da’vosi va warranty javobgarini yozish. Har qiymatda manba va tasdiq sanasi bo‘lsin.
- [ ] “Live Now” uchun real mavjudlik signali bo‘lmasa, onlayn operator taassurotini bermaydigan tasdiqlangan statik label ishlatish. Faqat ish soati ichida bo‘lish operator hozir javob berishini isbotlamaydi.
- [ ] About, homepage, footer, xizmat va booking yonidagi izohlarni bir xil rolga moslashtirish. Noma’lum qiymatlar tasdiqlangan fakt kabi chiqmasin; manzil/filial o‘ylab topilmasin.
- [ ] Barcha da’volarni fakt jadvali bilan tekshirish; `company.contact.hours` va ishlatiladigan trust matni bir-biriga zid bo‘lmasin.

**Qabul mezoni:** foydalanuvchi kim bilan bog‘lanishi, kim xizmat bajarishi va qachon appointment tasdiqlanishini tushunadi. GBP/LocalBusiness qarori model aniqlanguncha ochiq qoladi; profil ochish bu vazifaning avtomatik natijasi emas.

## T02 — Tezkor metadata, sitemap va accessible-name tuzatishlari

**Ustuvorlik:** P2/P3, tez bajariladi. **Murakkablik:** kichik. **Bog‘liqlik:** yo‘q.

**Fayllar:** `src/app/(marketing)/review/page.tsx`, `src/app/sitemap.ts`, `src/components/layout/footer.tsx`; tekshiruv: `tests/check-public-responses.py`, `tests/browser-qa.cjs`.

- [x] `/review` metadata title’ni `Leave a Review` qilish; parent template brendni bir marta qo‘shsin. Open Graph, canonical va `noindex, follow` saqlansin.
- [x] Footer states havolasidagi ortiqcha `aria-label`ni olib tashlash: ko‘rinadigan “States served” va “NY · NJ · CT · MA · RI” accessible name’ni hosil qilsin.
- [x] Haqiqiy sahifa yangilanish sanalari yo‘qligi sabab `lastModified: new Date()`ni olib tashlash. Keyin sana yuritish jarayoni paydo bo‘lsa aniq kontent sanasini qo‘shish; build vaqti ishlatilmasin.
- [x] Renderlangan HTML’da review title’da brend bir marta, review sitemap’dan tashqarida, reviews bir marta ichida ekanini tekshirish. Footer’da ko‘rinadigan label accessible name’ga kirishini browser accessibility tree orqali ko‘rish.

**Qabul mezoni:** uchta lokal sabab bartaraf; mavjud 19 marketing URL, canonical va robots xulqi buzilmagan. Kichik matn fix’lari uchun sun’iy unit testlar yozilmaydi, mavjud HTTP/browser tekshiruvlari kengaytiriladi.

## T03 — Privacy va xizmat shartlarini haqiqiy oqimga ulash

**Ustuvorlik:** P1. **Murakkablik:** UI — kichik/o‘rta; matn tasdig‘i — tashqi. **Bog‘liqlik:** T01.

**Yangi fayllar:** `src/content/policies.ts`, `src/app/(marketing)/privacy-policy/page.tsx`, `src/app/(marketing)/terms/page.tsx`.
**O‘zgaradi:** `src/components/layout/footer.tsx`, `src/features/booking/book-now-modal.tsx`, `src/features/reviews/review-form.tsx`, `src/content/routes.ts`, `docs/BOOK_NOW_ARCHITECTURE.md`.

- [ ] Oqim xaritasini tuzish: booking saqlanishi, Telegram notification, ixtiyoriy email, review/media va chat’da ishlatiladigan servislar; yoqilgan konfiguratsiyani taxminsiz tasdiqlash. Retention/deletion tartibi va mustaqil ustalarga uzatish shartini biznesdan olish.
- [ ] Shu oqimga mos tasdiqlangan privacy va terms matnlarini server sahifalarida chiqarish. Ushbu reja huquqiy muvofiqlik xulosasi bermaydi.
- [ ] Footer va ma’lumot yig‘ish nuqtalariga havola qo‘yish. Booking’dagi link yangi tab’da ochilishi va bu foydalanuvchiga bildirilishi bilan formadagi draft yo‘qolmasin. Mavjud optional SMS roziligi marketing roziligiga aylantirilmasin.
- [ ] Ikki URL 200, yagona H1/title/canonical, ishlaydigan link va haqiqiy revision sanasiga ega bo‘lsin; tasdiqlangan sahifalarni route inventari/sitemap va test inventariga qo‘shish.
- [ ] Formani to‘ldirib policy’ni ochish/qaytish, klaviatura va qisqa ekran holatini tekshirish; draft saqlangan va submit yetisharli.

**Qabul mezoni:** foydalanuvchi yuborishdan oldin ma’lumot qanday ishlatilishini topadi; linklar 404 emas; tasdiqsiz qonuniy va’dalar yoki majburiy marketing checkbox yo‘q.

## T04 — Mavjud xizmat va metadata kontentini kuchaytirish

**Ustuvorlik:** P1. **Murakkablik:** o‘rta, kontent ulushi katta. **Bog‘liqlik:** T01.

**Fayllar:** `src/content/services.ts`, `appliance-repair.ts`, `company.ts`, `offers.ts`; `src/types/content.ts`; `src/components/services/service-detail-page.tsx`, `service-category-page.tsx`, `service-sections.tsx`; `src/components/home/first-time-offer.tsx`; tegishli marketing sahifalari.

- [ ] Avval AC Repair, Appliance Repair va Water Heater Repair uchun original matn tayyorlash: equipment scope, tashrifga kiradigan/kirmaydigan ish, narx omillari, tayyorgarlik, qismlar/kafolatning tasdiqlangan sharti va xizmatga xos FAQ.
- [ ] Takroriy “what happens after booking” bloklarini qisqa saqlab, mavjud `overview`, `signs`, `faqs` maydonlarini mazmunli to‘ldirish. Yetishmaydigan bo‘limlar uchun `Service` va `ServiceCategory`ga ixtiyoriy `scope?: { included: readonly string[]; excluded: readonly string[]; pricingFactors: readonly string[] }` qo‘shish; faqat tasdiqlangan qiymatlar render qilinsin.
- [ ] Tasdiqlangan $89 diagnostika va chegirma shartini tegishli joylarda umumiy manbadan chiqarish. “Off your first visit”ni maintenance chekloviga moslashtirish; ta’mirning o‘ziga avtomatik 10% va’da qilmaslik.
- [ ] Pilot tahrir tasdiqlangach qolgan xizmatlarni to‘ldirish; installation va replacement’ni aniq ajratish, AC maintenance va outdoor cleaning munosabatini tushuntirish, heating overview/metadata’da boiler’ni ham aks ettirish.
- [ ] Home title/description va xizmat metadata’sini foydalanuvchi niyatiga mos yangilash; faqat tanlangan county’lar mavjudligini aytish. Shiorni saqlash mumkin, ammo uning yonida aniq xizmat/qamrov izohi bo‘lsin.
- [ ] Boiler’ga mazmunli related links, mavjud Brands katalogi va tegishli review dalillariga kontekstli yo‘lni tekshirish; har xizmatning booking category/service tanlovi to‘g‘ri qolsin.

**Qabul mezoni:** 4 kategoriya va 8 detail sahifaning har biri o‘z xizmatiga oid qaror ma’lumoti beradi; takroriy matnni ko‘paytirish yoki sun’iy so‘z soni maqsadi yo‘q. Barcha scope/narx da’volari T01 manbasiga bog‘lanadi. Metadata va title dublikatlari qayta crawl bilan tekshiriladi.

## T05 — Organization, Service va breadcrumb ma’lumotlarini moslashtirish

**Ustuvorlik:** P2. **Murakkablik:** o‘rta. **Bog‘liqlik:** T01; breadcrumb uchun T04 shablon holati.

**Fayllar:** `src/components/public/organization-structured-data.tsx`, `src/components/services/service-structured-data.tsx`, `service-sections.tsx`; `src/app/(marketing)/page.tsx`, `about/page.tsx`; `src/content/site.ts`. Yangi: `src/components/public/breadcrumb-structured-data.tsx`.

**Interface:** `BreadcrumbStructuredData({ items }: { items: readonly { name: string; href: string }[] })`; ayni items ko‘rinadigan breadcrumb uchun ham ishlatiladi.

- [x] Organization uchun `${siteUrl}/#organization` stable ID, canonical root URL, mavjud logo va faqat tasdiqlangan telefon/profillarni bog‘lash. Home/About’da qarama-qarshi entity’lar yaratilmasin.
- [x] Service bilan tashkilot aloqasini T01’dagi roldan chiqarish. Koordinatorni avtomatik bevosita provider deb e’lon qilmaslik; implementatsiya vaqtida tanlangan schema munosabatini rasmiy qo‘llanmada tekshirish.
- [x] `areaServed`ni `serviceAreas`dagi county+parent state asosida berish; Suffolk/Middlesex/Bristol kabi nomlar shtat bilan farqlansin. Har service barcha county’da mavjud degan taxmin bo‘lmasin.
- [x] Breadcrumb’da Home → Services → category → joriy detail, kategoriya sahifasida esa Home → Services → category bo‘lsin; ko‘rinadigan matn va JSON-LD bir modeldan chiqsin.
- [x] Renderlangan JSON-LD’ni parse qilish: stable ID, absolute URL, ketma-ket position, county-parent mosligi, mavjud bo‘lmagan filial/manzil/rating yo‘qligini tekshirish.

**Qabul mezoni:** markup ko‘rinadigan kontentga mos. LocalBusiness va review/FAQ rich result va’dasi avtomatik qo‘shilmaydi.

## T06 — Murojaat analitikasi va trafik manbasi

**Ustuvorlik:** P1. **Murakkablik:** o‘rta. **Bog‘liqlik:** analytics hisob/provider va consent qarori, T03 matni.

**Yangi:** `src/features/analytics/events.ts`, `attribution.ts`, `analytics-provider.tsx`, `types.ts`; `tests/analytics.test.cjs`.
**O‘zgaradi:** `src/app/(marketing)/layout.tsx`, `src/features/booking/book-now-context.tsx`, `book-now-modal.tsx`, `.env.example`, `tests/browser-interactions.cjs`. CRM attribution saqlanishini kengaytirish alohida keyingi ish; birinchi bosqichda DB migratsiya shart emas.

**Interfaces:** `trackEvent(name: AnalyticsEventName, payload: AnalyticsPayload): void`; `captureAttribution(search: string, pathname: string, referrer: string): Attribution`. EventName: `click_to_call | booking_open | booking_start | booking_submit_success | booking_error`. Payload faqat ruxsat etilgan service/category ID, toza route, tasdiqlangan area ID, cheklangan source/medium/campaign kodi va error code’dan iborat.

- [ ] Provider hisobini va consent xulqini aniqlash; bitta adapter tanlash, GA4+GTM+yana bir tracker’ni sababsiz birga qo‘ymaslik. Disabled holatda adapter no-op bo‘lsin.
- [ ] `BookNowUrlSync` ichida query tozalanishidan oldin attribution olish; oddiy landing tashrifini ham saqlash. Referrer’dan faqat origin/domain, URL’dan faqat ruxsatli public pathname olinsin; tokenli `/l/*`, `/review/*` yo‘llar maskalansin. UTM qiymatlarini xom yubormaslik: uzunligi/formati cheklangan, tasdiqlangan kampaniya qiymatlari, qolganlari `unknown`.
- [ ] Booking open/start’ni alohida hisoblash; start — birinchi foydalanuvchi tahriri. `booking_submit_success` faqat muvaffaqiyatli HTTP javob va `{ ok: true, status: "received" }`dan keyin bir marta. Qayta render/reopen oldingi lead’ni takror hisoblamasin.
- [ ] Telefon link click’larini bitta umumiy handler orqali kuzatish. Telefon raqami, ism, email, ZIP, issue matni, requestId va campaignToken tashqi analytics’ga yuborilmasin; requestId zarur bo‘lsa faqat lokal dedup uchun saqlansin.
- [ ] Testlar: query cleanup’dan keyin attribution saqlanadi; 201 received → 1 success; 400/500/503/network → 0 success; rerender → 0 qo‘shimcha success; disabled consent/adapter → 0 tashqi so‘rov; maxfiy satrlar event payload’da yo‘q.

**Qabul mezoni:** test collector/debug view’da hodisalar tekshirilgan, bir lead ikki marta conversion bo‘lmaydi. GA4 tanlansa `booking_submit_success` yagona key event bo‘ladi; ayni lead uchun ikkinchi `generate_lead` conversion avtomatik qo‘shilmaydi. Call click real qo‘ng‘iroq/sotuv deb hisobot qilinmaydi.

## T07 — Sharh, ish misollari va foto aniqligi

**Ustuvorlik:** P2. **Murakkablik:** o‘rta, dalilga bog‘liq. **Bog‘liqlik:** T01 va asl media/review konteksti.

**Fayllar:** `src/content/results.ts`, `media.ts`; `src/components/home/apex-results.tsx`; `src/components/reviews/review-card.tsx`, `review-media.tsx`; `src/app/(marketing)/reviews/page.tsx`, `about/page.tsx`; `docs/REVIEWS_ARCHITECTURE.md`.

- [ ] Furnace/boiler uchun haqiqiy mos rasm olish yoki mavjud outdoor HVAC rasmni umumiy illustratsiya sifatida ochiq izohlash; ALT orqali boshqa uskunaga aylantirmaslik.
- [ ] Dryer Vent Cleaning va lint-trap caption’ni bajarilgan ish dalili bilan moslashtirish. Yangi foto qo‘shilganda mazmunli filename ishlatish; faqat SEO uchun eski URLlarni ommaviy almashtirmaslik.
- [ ] Auditdagi bir xil review fotolarining haqiqiy bog‘lanishini vakolatli manba bilan tekshirish; xato tasdiqlansa aniq yozuvni tuzatish rejasi berish. Hozirgi uch sharh yoki Queens manzili yolg‘on deb talqin qilinmasin, qamrov avtomatik kengaytirilmasin.
- [ ] `Verified Customer` shartini real moderation/invitation jarayoniga moslashtirish. Dalil yetarli bo‘lmasa kuchli verification da’vosini yumshatish; sharh matnini mijoz o‘rniga qayta yozmaslik.
- [ ] Tasdiqlangan foto tavsifi bor joyda `ReviewMedia`ga aniq ALT uzatish; tavsifni service label’dan taxmin qilmaslik. Tavsifni saqlashga yangi DB maydoni kerak bo‘lsa, to‘liq migration loyihasi alohida ko‘riladi, bu reja bilan live DB o‘zgarmaydi.
- [ ] Reviews sahifasida moderation izohi, About/xizmatlardan kerakli havolalar va rozilik olingan case study tafsilotlarini qo‘shish.

**Qabul mezoni:** har ko‘rsatilgan foto va claim o‘z daliliga mos; real review bo‘lmaganida fallback to‘g‘ri, o‘ylab topilgan rating/sertifikat/natija yo‘q.

## T08 — Redirect, rasm hajmi va xavfsizlik sarlavhalari

**Ustuvorlik:** P2/P3. **Murakkablik:** o‘rta. **Fayllar:** `next.config.ts`, `src/app/icon.png`, `apple-icon.png`, zarur bo‘lsa `favicon.ico`; `src/components/services/service-sections.tsx`, `src/content/media.ts`; `tests/browser-performance.cjs`. Hosting redirect’i koddan tashqari konfiguratsiya bo‘lishi mumkin.

- [ ] Auditdagi www 307’ni implementatsiya oldidan qayta GET bilan o‘lchash va redirect qayerda boshqarilishini aniqlash. Asosiy domen tasdiqlangach aynan o‘sha qatlamda 301/308 qilish; pathname va query saqlansin, ikki qarama-qarshi redirect yaratilmasin.
- [ ] AC Repair LCP elementini va request waterfall’ni o‘lchash: mavjud hero preload’ni hisobga olish, haqiqiy render eni bilan `sizes`ni moslashtirish; ayniqsa tablet’dagi split layout va katta ekran container kengligini tekshirish.
- [ ] Asl tasdiqlangan logodan kichik favicon va Apple icon variantlarini chiqarish; logo dizaynini o‘zgartirmaslik. Sahifa ishlatayotgan asset 285 KB original bo‘lib qolmaganini network’da tekshirish.
- [ ] LCP oldin/keyin o‘lchovlarini bir xil profil va ketma-ket kamida uch run bilan qilish; median va diapazonni saqlash. Legacy JS 14 KiB uchun katta refaktor boshlamaslik.
- [ ] `X-Content-Type-Options`, Referrer-Policy va frame himoyasi uchun amaldagi resurs/embed ehtiyojini tekshirish. CSP’ni avval staging Report-Only’da sinash, kerakli rasm/script/connect manbalarini dalilga ko‘ra ruxsatlash.
- [ ] Nonce CSP’ni butun statik marketing saytiga ko‘r-ko‘rona joriy qilmaslik: o‘rnatilgan Next qo‘llanmasida rendering/caching ta’sirini tekshirish. Enforcement’dan oldin booking, chat, analytics, review signed image va admin regressiyasi shart.

**Qabul mezoni:** doimiy domen redirect’i sinovdan o‘tgan; rasmlar buzilmagan, o‘lchov bilan tejam ko‘rsatilgan; yangi headers zarur oqimlarni bloklamaydi. LCP ≤2,5 s laboratoriya maqsadi bo‘lishi mumkin, lekin field CWV pass deb chiqarilmaydi.

## T09 — Appliance intent sahifalari: keyingi bosqich

**Ustuvorlik:** strategik P1. **Murakkablik:** o‘rta/katta. **Bog‘liqlik:** T01, T04 pilot, tasdiqlangan scope va kontent.

**Mavjud:** `src/app/(marketing)/services/[category]/[service]/page.tsx`, `src/content/services.ts`, `appliance-repair.ts`, `footer.ts`, `src/features/booking/model.ts`. Avval mavjud dynamic route va catalog modeli kengaytiriladi; parallel yangi router yaratilmaydi.

- [ ] Refrigerator, washer, dryer, oven va dishwasher xizmatlarini beshta alohida candidate sifatida baholash. Avval eng ko‘p real talab/dalilga ega 3 tasini, qolganini kontent tayyor bo‘lgach chiqarish.
- [ ] Har birida original uskunalar/symptoms/scope/FAQ/narx omillari va mos ish misoli bo‘lsin; takroriy county yoki appliance nom almashtirish bilan sahifa yasamaslik.
- [ ] Catalog children orqali `getService`, static params, metadata, finder, related links, footer, sitemap va booking service selection’ni bir xil ID bilan bog‘lash.
- [ ] Har yangi route 200/self-canonical/unique metadata; noma’lum service 404; category bo‘yicha noto‘g‘ri service tanlovi server validatsiyasidan o‘tmasligini tekshirish.
- [ ] Commercial yo‘nalishga real scope yetarli bo‘lsa alohida reja tuzish; hozircha tasdiqlangan commercial uskunalarni mavjud hub’da aniq tushuntirish yoki mos bo‘lmagan da’voni fakt asosida tuzatish.

**Qabul mezoni:** footer’dagi aniq xizmat nomi shu niyatdagi foydali sahifaga olib boradi; appointment yoki equipment support o‘ylab topilmagan.

## T10 — Lokal sahifalar va case study pilotlari: keyingi bosqich

**Ustuvorlik:** strategik P1. **Murakkablik:** o‘rta/katta. **Bog‘liqlik:** biznes qamrovi, real hududiy ishlar, T04/T05.

**Yangi:** `src/content/locations.ts`, `src/app/(marketing)/service-areas/[state]/[county]/page.tsx`.
**O‘zgaradi:** `src/app/(marketing)/service-areas/page.tsx`, `src/app/sitemap.ts`, `src/types/content.ts`; `tests/check-public-responses.py`.

**Model:** `LocationPage = { stateSlug: string; countySlug: string; title: string; summary: string; serviceIds: readonly string[]; faqs: readonly ServiceFAQ[]; resultIds: readonly string[]; updatedAt: string }`. `getLocationPage(stateSlug: string, countySlug: string): LocationPage | undefined` yagona lookup bo‘ladi; faqat tasdiqlangan/publish qilingan entry’lar ro‘yxatga kiritiladi.

- [ ] Real leadlar, qamrov va xizmat sig‘imi bo‘yicha 3–5 county tanlash. Auditdagi Nassau/Bergen — taklif, tayyor ustuvorlik qarori emas.
- [ ] Har county uchun haqiqiy xizmatlar, qamrov cheklovi, lokal FAQ va rozilikli ish misoli tayyorlash. Yetarli ma’lumot bo‘lmasa umumiy `/service-areas` sahifasini yaxshilash bilan cheklanish.
- [ ] Static params va route metadata’ni ro‘yxatdan yaratish; noma’lum state, county yoki noto‘g‘ri juftlik `notFound()` qaytarsin. Parent state sahifasi yaratilmasa breadcrumb unda mavjud bo‘lmagan URLga havola bermasin.
- [ ] County sahifalari bilan mos xizmatlar orasida contextual links; canonical va sitemap faqat nashr qilingan URLlar uchun. Suffolk NY va Suffolk MA alohida bo‘lsin.
- [ ] Case study’ni avval mavjud xizmat/lokal sahifa ichida boyitish. Mustaqil `/projects/...`, brand-service yoki blog yo‘llari yetarli original material va alohida roadmap vazifasi bo‘lgandagina yaratiladi.

**Qabul mezoni:** 29 county×barcha xizmatlar avtomatik ishlab chiqarilmaydi; soxta ofis, butun shtat qamrovi va tasdiqsiz GBP profili yo‘q.

## T11 — O‘lchash baseline’i va audit statuslarini yangilash

**Ustuvorlik:** P1 o‘lchash / davomiy. **Murakkablik:** kichik/o‘rta. **Bog‘liqlik:** hisobga read access, T06.

**Hujjatlar:** yangi `docs/SEO_MEASUREMENT.md`; `docs/ROADMAP.md`, `IMPLEMENTATION_PROGRESS.md`; yangi `docs/audits/remediation-status-2026-11-17.csv` — implementatsiya boshlanganida joriy status registri. Eski audit CSV tarixiy dalil bo‘lib qoladi.

- [ ] GSC’da canonical/indexing/sitemap va query×page baseline; analytics’da landing×service funnel; CRM’da qualified lead/appointment/sale ta’riflarini kelishtirish. Mavjud bo‘lmagan raqamlar `unavailable` deb belgilanadi.
- [ ] GBP eligibility va biznes identifikatsiyasini T01 faktlari hamda implementatsiya paytidagi rasmiy talablar bilan tekshirish. Profil yaratish/yangilash faqat alohida aniq vazifa bo‘lsa bajariladi.
- [ ] Har topilmaga `open / needs_business_input / implemented_local / verified_staging / verified_production / deferred` status, fayl, mas’ul va dalil biriktirish.
- [ ] T06 ishlagach boshlang‘ich 2–4 haftada booking open→start→success nisbatlarini yig‘ish; call click’ni haqiqiy call/qualified lead’dan alohida chiqarish. Oldingi davr data’si bo‘lmasa foizli o‘sish da’vosi qilmaslik.
- [ ] Eskirgan roadmap va progress matnlarini joriy dalil bilan yangilash; eski browser cheklovi va keyingi QA bir-biriga zid joriy xulosa sifatida qolmasin.

**Qabul mezoni:** nima tuzatilgani, qayerda tekshirilgani va qanday biznes natijasi o‘lchanayotgani alohida ko‘rinadi. Ranking, trafik yoki daromad kafolati yo‘q.

## T12 — Regressiya, staging va topshirish

**Ustuvorlik:** har bosqich yakunida. **Murakkablik:** o‘rta. **Bog‘liqlik:** joriy bosqichdagi o‘zgarishlar.

**Mavjud testlar:** `tests/booking-model.test.cjs`, `service-search.test.cjs`, `check-public-responses.py`, `browser-qa.cjs`, `browser-interactions.cjs`, `browser-links.cjs`, `browser-performance.cjs`.

- [ ] O‘zgargan model/analytics uchun ma’noli regressiya testlarini bajarish. Mavjud HTTP/browser inventarlarini yangi route’lar bilan yangilash; 19 URL sonini abadiy hardcode qilib qoldirmaslik.
- [ ] `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`; keyin `node tests/booking-model.test.cjs`, `node tests/service-search.test.cjs`. Build eski production server ishlayotgan paytda almashtirilmasin; test server yakunda qayta ishga tushirilsin.
- [ ] Local production serverda `python tests/check-public-responses.py`; booking request’lari intercept qilingan browser regression; desktop/tablet/mobile va 320px/landscape/200% zoom/focus/reduced-motion holatlari.
- [ ] Browser test scriptlarining joriy UI selektorlarini oldin tekshirish: eski suite natijalari keyingi workspace redesign’ni avtomatik tasdiqlamaydi. Policy linklar, footer name va analytics test collector qo‘shilsin.
- [ ] Staging test ma’lumotlari bilan bitta request → bitta saqlangan yozuv va notification holatlarini alohida tekshirish; test xabarlar faqat maxsus test recipient/sink’lariga yo‘naltirilsin. Haqiqiy mijozga call/email/SMS yuborilmasin.
- [ ] Safari/WebKit, Firefox, physical iOS/Android virtual keyboard va screen reader’dan bajarilganlarini alohida qayd etish; bajarilmaganlari ochiq cheklov bo‘lib qolsin.
- [ ] Release alohida topshirilganda production’da URL/canonical/robots/sitemap/schema/redirect/header va asset smoke-check. `git diff --check` va diff’da faqat vazifaga tegishli o‘zgarishlar borligini tekshirish.

**Qabul mezoni:** avtomatik tekshiruvlar, browser tajribasi, live integration va production holati to‘rtta alohida natija sifatida hisobot qilinadi. Deploy/commit/push bu reja tayyorlash vazifasida bajarilmaydi.

## Hozir boshlash mumkin bo‘lgan paket

T02 — review title, footer accessible name va noto‘g‘ri lastmod. Shu bilan bir vaqtda T01 uchun bitta jamlangan biznes faktlari hujjati tayyorlanadi. Keyin T03/T04/T06; T05/T07/T08 ularning dalillari bilan davom etadi. Yangi sahifalar T09/T10 uchun original kontent va tasdiqlangan xizmat qamrovi tayyor bo‘lishi shart.

## Ushbu reja sessiyasidagi tekshiruvlar

| Tekshiruv | 2026-11-17 natijasi |
|---|---|
| `npm.cmd run lint` | Exit 0 |
| `npm.cmd run typecheck` | Exit 0 |
| `npm.cmd run build` | Exit 0; 33/33 statik sahifa generatsiyasi yakunlandi |
| Build’dagi review fetch | Ikki marta `[reviews_fetch_failed] TypeError: fetch failed`; build fallback bilan tugadi. Review backend mavjudligi yoki populated reviews tekshirildi deb hisoblanmaydi |
| `git diff --check` | Exit 0; tracked application source diff yo‘q |
| Git holati | Oldindan mavjud `apex-audit/`, `qa-runs/` untracked; ushbu sessiya faqat reja uchun `docs/superpowers/` qo‘shdi |

Lokal kod va hujjatlar tekshirildi. Browser, real booking va production qayta validatsiyasi ushbu sessiyada bajarilmadi. Application source, audit asl fayllari va deployment konfiguratsiyasi o‘zgartirilmadi; commit/push/deploy bajarilmadi.
