# Apex Home Services — SEO, kontent va UX auditi

**Sayt:** https://apexhomesupport.com/

**Tekshiruv sanasi:** 17-noyabr 2026, Toshkent vaqti.

**Asosiy xulosa:** saytning texnik poydevori yaxshi. Asosiy o‘sish imkoniyati — xizmat va hududga mos foydali kontent, biznes haqidagi ishonchli ma’lumotlar, aniq xizmat modeli va murojaatlarni o‘lchash. Saytni qaytadan qurish zarurati ushbu auditda aniqlanmadi.

## 1. Tekshiruv qamrovi va chegaralari

- Sitemap’dagi **19 URL** va ichki havola orqali topilgan **1 qo‘shimcha sahifa** tekshirildi: jami **20 ochiq sahifa**.
- Har bir sahifaning HTTP holati, title, description, canonical, robots, H1–H6, asosiy HTML matni, ichki havolalari, rasm atributlari va JSON-LD ma’lumotlari ajratildi.
- Robots.txt, sitemap.xml, HTTP/HTTPS, www, slash, UTM parametrli URL, mavjud bo‘lmagan URL va uchta ehtimoliy privacy/terms manzili tekshirildi.
- Desktop va mobil bosh sahifa, buyurtma oynasi, xizmat tanlovi, mobil menyu va AC Repair sahifasi brauzerda ko‘rildi.
- Lighthouse 13.6.0 bilan bosh sahifa mobil/desktop, AC Repair mobil ikki marta o‘lchandi.
- Ochiq qidiruvda domen va brend/telefon bo‘yicha natijalar tekshirildi; ishonchli domen sahifalari natijalari olinmadi. Bu **Google indeksida 0 sahifa bor** degani emas.

Bu sitemap va ochiq havolalar orqali topilgan sahifalar auditi. Havolasiz yashirin URLlar, admin, server kodi, ma’lumotlar bazasi, barcha biznes jarayonlari yoki butun internetdagi backlinklar to‘liq qamrab olingan deb hisoblanmaydi. Search Console, GA4, Google Business Profile va CRM hisoblariga kirilmadi. Haqiqiy ariza, SMS, qo‘ng‘iroq yoki sharh yuborilmadi. Sayt o‘zgartirilmadi.

## 2. O‘lchangan texnik holat

| Tekshiruv | Natija | Talqin |
|---|---|---|
| Topilgan ochiq sahifalar | 20/20 — HTTP 200 | Crawl paytida buzilgan ichki sahifa topilmadi |
| Sitemap | 19 URL, HTTP 200 | Marketing sahifalari mavjud |
| Indekslash direktivasi | 19 sahifa `index, follow` | Indekslashga ruxsat; haqiqiy indekslashni kafolatlamaydi |
| Sharh yozish sahifasi | `/review`: `noindex, follow` | Formani qidiruvdan cheklash mantiqli; sitemap’da yo‘q |
| Title va description | 20/20 mavjud, qiymatlari noyob | Asosiy teglar yo‘qolmagan |
| H1 | Har sahifada 1 ta | Asosiy sarlavha tuzilmasi tartibli |
| Canonical | Har sahifa o‘z URLiga mos | UTMli bosh sahifa ham toza URLni ko‘rsatadi |
| HTML `lang` | `en` | Inglizcha kontentga mos |
| Rasm `alt` atributi | Atributsiz rasm topilmadi | 19 ta bo‘sh `alt` uchrashi bor; dekorativ rasm uchun bu to‘g‘ri bo‘lishi mumkin |
| Ichki `#anchor`lar | Tekshirilgan HTML’da manzilsiz anchor yo‘q | Bo‘lim havolalari mavjud elementlarga ulanadi |
| Robots.txt | `Allow: /`, `Disallow: /admin`, sitemap ko‘rsatilgan | Marketing crawl bloklanmagan; robots autentifikatsiya vositasi emas |
| HTTP → HTTPS | 308 | Doimiy yo‘naltirish to‘g‘ri |
| www → asosiy domen | **307** | Doimiy domen tanlovi uchun 301/308 tavsiya qilinadi |
| Mavjud bo‘lmagan URL | 404 va `noindex` | Sinovda soft-404 kuzatilmadi |
| Server | Next.js / Vercel | Asosiy kontent boshlang‘ich HTML’da bor |
| HTTPS xavfsizlik sarlavhasi | HSTS mavjud | Ijobiy texnik signal |

Manbalar: [bosh sahifa](https://apexhomesupport.com/), [robots.txt](https://apexhomesupport.com/robots.txt), [sitemap.xml](https://apexhomesupport.com/sitemap.xml), auditga ilova qilingan `apex-texnik-dalillar.json`.

## 3. Tezlik va mobil ko‘rinish

| Sahifa / rejim | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Bosh sahifa, mobil | 98 | 100 | 100 | 100 | 1,15 s | 168 ms | 0 |
| Bosh sahifa, desktop | 99 | 100 | 100 | 100 | 0,42 s | 6 ms | 0,00018 |
| AC Repair, mobil — 1-o‘lchov | 89 | 100 | 100 | 100 | 2,60 s | 292 ms | 0 |
| AC Repair, mobil — alohida qayta o‘lchov | 97 | 100 | 100 | 100 | 2,58 s | 63 ms | 0 |

Bu mahalliy kompyuterda simulyatsiya qilingan laboratoriya o‘lchovlari. Birinchi AC Repair o‘lchovi desktop tekshiruvi bilan parallel bajarilgan; kompyuter yuklamasi TBT farqiga ta’sir qilgan bo‘lishi mumkin. Shu sabab alohida qayta o‘lchov ham berildi. Natijalar AQShdagi real mijozlarning 28 kunlik CrUX statistikasi emas. INP o‘lchanmadi; TBT’ni INP deb talqin qilish mumkin emas.

Google’ning yaxshi foydalanuvchi tajribasi chegaralari LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 bo‘lib, real tashriflarning 75-percentili bilan baholanadi. AC Repair laboratoriya LCP’si ikki o‘lchovda ham 2,5 soniyadan ozgina yuqori; bu butun sayt Core Web Vitals’dan yiqildi degani emas. [web.dev mezonlari](https://web.dev/articles/defining-core-web-vitals-thresholds).

**Amaliy ishlar:**

- AC Repair sahifasining LCP elementini, hero rasmning hajmi va yuklanish ustuvorligini tekshirish; ekranning yuqorisidagi muhim rasmni kech yuklamaslik.
- Lighthouse bosh sahifada mobil rasmlardan taxminan 76 KiB, desktop rasmlardan 237 KiB tejash imkoniyatini ko‘rsatdi. Bu hisoblangan imkoniyat, kafolatlangan real tejam emas.
- AC Repair rasmlarida taxminan 15 KiB, legacy JavaScript’da taxminan 14 KiB kamaytirish imkoniyati bor. Buni kontent va konversiya ishlaridan yuqori qo‘yish shart emas.
- Brauzerda favicon so‘rovi taxminan 286 KB trafik ishlatdi; HTML’da 1254×1254 o‘lcham ko‘rsatilgan. Kichik favicon variantlarini ajratish foydali.

390 px bosh sahifa va forma ko‘rinishida gorizontal chiqib ketish kuzatilmadi. Mobil menyu ochildi; “Cooling” tanlanganda matn va xizmat havolasi o‘zgardi, “Book cooling” formasida Cooling oldindan tanlandi. Escape oynani yopdi. Telefon/ZIP uchun mos klaviatura turi, ism/telefon/ZIP/email autocomplete atributlari bor. Arizaning backendga yetib borishi tekshirilmagan.

## 4. Ustuvor topilmalar

P1 — yaqin muddatda bajarish; P2 — keyingi ishlar; P3 — kichik tuzatish. Ustuvorlik biznesga ta’sir bo‘yicha berilgan, xavfsizlik zaifligi reytingi emas.

### P1 — Biznes modeli va ishonch ma’lumotlarini aniqlashtirish

**Dalil:** [About](https://apexhomesupport.com/about) Apex’ni mijozlarni mustaqil mahalliy xizmat ko‘rsatuvchilar bilan bog‘laydigan tashkilot sifatida tushuntiradi. Bosh sahifadagi “EPA 608 Certified Technicians”, “10+ Years Technician Experience”, “Same-Day Service Available” va “Apex projects” iboralari esa yagona o‘z jamoasi taassurotini berishi mumkin.

**Ta’sir:** mijoz kim kelishi, xizmatni kim bajarishi, kafolat va javobgarlik kimga tegishli ekanini aniq tushunmasligi mumkin. Bu konversiya va mahalliy SEO strategiyasiga ta’sir qiladi.

**Tavsiya:** real modelga qarab bir xil izoh yozish: Apex servis kompaniyasimi, dispetcherlik xizmatimi yoki ustalarni bog‘lovchi platformami? Buyurtma oynasi yonida ham qisqa izoh berish. Sertifikat, tajriba va same-day da’volarini amaldagi dalillar va aniq shartlar bilan mustahkamlash. Ushbu audit sertifikatlar yolg‘onligini aniqlamadi; ularni tashqi manbada tasdiqlamadi ham.

**Mahalliy SEO sharti:** Google Business Profile’ni avtomatik ravishda ochishni tavsiya qilish to‘g‘ri bo‘lmaydi. Google lead generation kompaniyalarini mos bo‘lmagan bizneslar qatoriga kiritadi. Agar Apex faqat lead yig‘ib uzatsa, organik xizmat/hudud kontenti strategiyasi kerak. Agar real, mijoz bilan bevosita ishlaydigan servis biznesi bo‘lsa, profil talablari va haqiqiy xizmat hududi tekshiriladi. Soxta ofislar yoki har county uchun sun’iy profillar yaratmaslik. [Google Business Profile qoidalari](https://support.google.com/business/answer/13762416).

### P1 — Privacy Policy topilmadi

**Dalil:** buyurtma oynasi ism, telefon, ZIP, ixtiyoriy email va muammo matnini yig‘adi. SMS uchun alohida rozilik matni bor, ammo formada Privacy Policy havolasi yo‘q. Crawl qilingan havolalar va footer’da ham u topilmadi. `/privacy`, `/privacy-policy`, `/terms` manzillari 404 qaytardi.

**Ta’sir:** foydalanuvchi ma’lumotlari qanday ishlatilishi va qaysi mustaqil xizmat ko‘rsatuvchiga uzatilishini oson topa olmaydi.

**Tavsiya:** haqiqiy ma’lumot oqimiga mos privacy sahifasi va xizmat shartlarini tayyorlash, footer va forma yoniga havola qo‘yish. Bu topilma maxfiylik va ishonch bo‘yicha UX kamchiligi; huquqiy muvofiqlik yuzasidan hukm emas. Boshqa, havolasiz siyosat URLi mavjud bo‘lishi istisno qilinmaydi.

### P1 — Lokal qidiruv uchun hudud sahifalari yetishmaydi

**Dalil:** [Service Areas](https://apexhomesupport.com/service-areas) besh shtat va 29 county’ni bitta sahifada ro‘yxatlaydi. Topilgan sitemap va ichki havolalarda alohida shtat/county sahifalari yo‘q. Title — “Service Areas | Apex Home Services”; asosiy xizmat title’larida ham joy nomlari yo‘q.

**Ta’sir:** “AC repair Nassau County”, “furnace repair Bergen County” kabi xizmat+hudud niyatiga mos to‘liq javob beruvchi sahifa yo‘q. Kalit so‘z hajmi yoki aniq ranking o‘lchanmagan; bu kontent arxitekturasi imkoniyati.

**Tavsiya:** avval real buyurtma va xizmat sig‘imiga qarab 3–5 ustuvor hududni tanlash. Har sahifada amaldagi qamrov, xizmatlar, haqiqiy bajarilgan ishlar, hududga tegishli savollar va aloqa yo‘li bo‘lsin. Bir xil matnda faqat county nomini almashtirib 29 ta sahifa chiqarmaslik. Ommaviy xizmat hududini butun shtatga kengaytirib ko‘rsatmaslik.

### P1 — Appliance qidiruv niyatlari bitta umumiy sahifaga yig‘ilgan

**Dalil:** footer’dagi refrigerator, washer/dryer, oven, dishwasher va commercial equipment havolalari [bir xil appliance-repair sahifasiga](https://apexhomesupport.com/services/appliance-repair) olib boradi. Alohida mos landing sahifalar topilmadi. Commercial equipment uchun ham alohida izohli sahifa yo‘q.

**Ta’sir:** masalan, sovutgich ta’miri izlagan mijoz umumiy matnga tushadi; “commercial refrigerator repair” foydalanuvchisi uchun uy texnikasiga yo‘naltirilgan taklif noaniq.

**Tavsiya:** tasdiqlangan xizmatlardan refrigerator repair, washer repair, dryer repair, oven repair, dishwasher repair sahifalarini boshlash. Commercial yo‘nalish amalda bo‘lsa, alohida hub; bo‘lmasa tegishli da’vo va havolalarni qayta ko‘rib chiqish. Har sahifa muammo, qamrab olinadigan uskuna, jarayon, narx omillari, real ish misoli va mos CTA bilan farqlansin.

### P1 — Xizmat kontenti umumiy va qaror uchun yetarli tafsilot bermaydi

**Dalil:** AC Repair va boshqa xizmat sahifalarida bir xil besh qadamli jarayon, brendlar, hududlar va buyurtmadan keyingi umumiy izoh qaytariladi. AC Repair asosiy HTML matni taxminan 428 so‘z; uning katta qismi xizmatlararo umumiy bloklardir. So‘z sonining o‘zi muammo yoki ranking mezoni emas.

**Tavsiya:** har xizmatga tegishli original bo‘limlar qo‘shish: qaysi uskunalar bilan ishlanadi, tashrifga nima kiradi, nimalar kirmaydi, narxni nima o‘zgartiradi, ehtiyot qismlar va kafolatning amaldagi shartlari, hududdagi real ish misollari. Bosh sahifadagi $89 boshlang‘ich diagnostika taklifini tegishli xizmat sahifalarida ham aniq shartlari bilan ko‘rsatish. Masofadan qat’iy tashxis yoki asossiz narx va’dalari kerak emas.

### P1 — Kontakt va tashkilot ma’lumotlari kam

**Dalil:** [Contact](https://apexhomesupport.com/contact) sahifasidagi “Business contact information” bo‘limida faqat telefon bor. Ko‘rilgan kontaktda email, ish soatlari, operator/yuridik nomi yoki to‘liq yordam tartibi ko‘rsatilmagan. Bosh sahifadagi “Live Now” bilan birga ish vaqti izohi topilmadi.

**Tavsiya:** amaldagi ish soatlari va vaqt zonasini, mijoz murojaat qiladigan emailni, operator nomini, murojaatga javob tartibini ko‘rsatish. Haqiqiy ofis yoki mijoz qabul qilinadigan joy bo‘lsa, to‘g‘ri manzil va tegishli ma’lumot berish; ko‘chma xizmat biznesi uchun manzilni o‘ylab topmaslik. “Live Now” haqiqiy operator mavjudligi bilan bog‘langanini tekshirish. U doim noto‘g‘ri ko‘rsatiladi degan xulosa chiqarilmadi.

### P1 — Murojaatlar analitikasi tashqaridan tasdiqlanmadi

**Dalil:** bosh sahifa Lighthouse tarmoq logida GA4/GTM/Clarity/Plausible kabi analitika so‘rovlari aniqlanmadi. Bu server tomondagi analitika yoki shartli ishlaydigan tracking yo‘q degani emas.

**Tavsiya:** amaldagi konfiguratsiyani tekshirish; zarur bo‘lsa quyidagi hodisalarni o‘lchash: `click_to_call`, `booking_open`, `booking_start`, `booking_submit_success`, `booking_error`. Xizmat, landing page, hudud va trafik manbasini maxfiy ma’lumot yubormasdan bog‘lash. `booking_submit_success` tugma bosilganda emas, server tasdiqlaganidan keyin yozilsin. Telefon tugmasi bosilishi real qo‘ng‘iroq yoki sotuvga teng emas.

## 5. P2 — texnik va on-page yaxshilashlar

**www uchun vaqtinchalik redirect.** `https://www.apexhomesupport.com/` → `307` → asosiy domen. `http://www...` ikki bosqichda o‘tadi: 308, so‘ng 307. Asosiy domen doimiy tanlov bo‘lsa, www yo‘naltirishini 301/308 qilish; imkon qadar zanjirni qisqartirish. Hozir canonical mavjudligi yaxshi, bu holat indekslashni to‘liq bloklayapti degani emas. [Google redirect tavsiyasi](https://developers.google.com/search/docs/crawling-indexing/301-redirects).

**Organization ma’lumotlari to‘liq bog‘lanmagan.** Bosh sahifada JSON-LD topilmadi; About’da minimal `Organization`, 12 xizmat sahifasida `Service` bor. Organization’da `@id`, logo, telefon, `sameAs` topilmadi; Service.provider faqat tashkilot nomi bilan berilgan. Barqaror `https://apexhomesupport.com/#organization` identifikatori, haqiqiy aloqa ma’lumotlari, logo va tasdiqlangan profillar bilan yagona tashkilot entity’sini bog‘lash foydali. `LocalBusiness` turini faqat haqiqiy biznes modeliga mos bo‘lsa ishlatish. Markup yo‘qligi avtomatik jarima emas. [Google Organization tavsiyasi](https://developers.google.com/search/docs/appearance/structured-data/organization).

**Schema qamrovi sayt matnidan kengroq ko‘rinishi mumkin.** Service JSON-LD `areaServed`da besh shtatni sanaydi, sayt esa coverage statewide emasligini aytadi. Imkon bo‘lsa tasdiqlangan county va hudud cheklovlarini ma’lumotlarda ham moslashtirish. Haqiqiy manzil yoki filiallarni o‘ylab topmaslik.

**Title/H1 foydalanuvchi niyatini yaxshiroq ifodalashi mumkin.** Bosh title “Apex Home Services | Premium Home Services” umumiy; H1 hissiy taklif beradi, xizmat turi va joyni ochmaydi. Dizayn sarlavhasini majburan yo‘qotish shart emas: unga yaqin ko‘rinadigan xizmat+qamrov izohini kuchaytirish yoki sarlavhani o‘zgartirish. Meta description uzunligini mexanik ravishda 160 belgiga to‘ldirish kerak emas; foydali va aniq taklif muhim.

**Sharhlar va ishonch dalillari cheklangan.** Reviews sahifasida 3 ta qisqa sharh bor. Google yoki boshqa tashqi review profiliga havola topilmadi. “Verified Customer” tekshirish tartibini qisqacha tushuntirish, haqiqiy ishga mos batafsil sharh va case study’lar yig‘ish foydali. Sharhlar soxta degan dalil yo‘q. Queens sharhi bor, ammo joriy NY county ro‘yxatida Queens yo‘q: bu tarixiy xizmat bo‘lishi mumkin; hozirgi qamrov bilan farqni izohlash kerak. O‘z biznesi haqidagi sharhlarga schema qo‘shish Google yulduzchalarini kafolatlamaydi; self-serving review cheklovlari bor. [Google review qoidalari](https://developers.google.com/search/docs/appearance/structured-data/review-snippet).

**Accessibility’da bitta aniq nomlash muammosi.** Lighthouse category bahosi 100 bo‘lsa ham, `label-content-name-mismatch` tekshiruvi xato qaytargan. Footer’dagi ko‘rinadigan `NY · NJ · CT · MA · RI` matni `aria-label`da aynan aks etmagan. Ko‘rinadigan label’ni accessible name tarkibiga kiritish yoki ortiqcha aria-label’ni olib tashlash. Buni klaviatura va ekran o‘quvchi bilan tekshirish. Avtomatik 100 ball to‘liq WCAG muvofiqligi kafolati emas.

## 6. P3 — mayda tuzatish va keyingi tekshiruvlar

- `/review` title’da brend ikki marta kelgan: `Leave a Review | Apex Home Services | Apex Home Services`. Metadata template dublikatini tozalash. Sahifa noindex bo‘lgani uchun SEO ta’siri past.
- Barcha sitemap yozuvlarida bir xil `lastmod`: `2026-11-16T15:55:34.557Z`. Bu bir paytdagi haqiqiy yangilanish bo‘lishi mumkin. Agar har buildda avtomatik yangilansa, muhim kontent o‘zgargan sanani ishlatish. Google `lastmod` aniqligiga qaraydi; bir xil qiymatning o‘zi xato emas. [Google sitemap tavsiyasi](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- Tekshirilgan bosh sahifa javobida CSP, X-Content-Type-Options, Referrer-Policy va frame himoyasi sarlavhalari ko‘rinmadi. Kerakli resurslar bilan mos siyosatni ishlab chiqish mumkin. Bu xavfsizlikni mustahkamlash tavsiyasi; ekspluatatsiya qilinadigan zaiflik tasdiqlanmagan. HSTS bor.
- Xizmat sahifalarida breadcrumb ko‘rinadi, lekin `BreadcrumbList` topilmadi. Navigatsiyaga mos markup qo‘shish mumkin; rich result kafolatlanmaydi.
- Brendlar katalogi mavjud, ammo alohida brand-service sahifalari topilmadi. Faqat real tajriba va talab bo‘lsa Samsung refrigerator repair kabi sahifalar ishlab chiqish; manufacturer authorization da’vosini faqat tasdiq bo‘lsa ishlatish.

## 7. Kontent va SEO arxitekturasi taklifi

Quyidagilar yangi URL takliflari, hozir mavjud sahifalar emas. Nomlash, ustuvor xizmatlar va geografiya haqiqiy biznes ma’lumotlari bilan tasdiqlanadi.

| Yo‘nalish | Taklif qilinayotgan sahifa | Qanday foyda beradi |
|---|---|---|
| Sovutgich | `/services/appliance-repair/refrigerator-repair` | Refrigeration muammosiga aniq javob |
| Kir yuvish | `/services/appliance-repair/washer-repair` | Washer qidiruv niyatiga alohida kontent |
| Quritish | `/services/appliance-repair/dryer-repair` | Dryer va vent xizmatlari qamrovini aniqlashtirish |
| Pishirish | `/services/appliance-repair/oven-repair` | Oven/range/cooktop farqlarini tushuntirish |
| Idish yuvish | `/services/appliance-repair/dishwasher-repair` | Alohida muammo, jarayon va FAQ |
| Hudud | `/service-areas/new-york/nassau-county` | Haqiqiy lokal qamrov va ishlar |
| Hudud | `/service-areas/new-jersey/bergen-county` | Xizmat va mavjudlikni hududga bog‘lash |
| Ish natijalari | `/projects/...` yoki mavjud sahifadagi kengaytirilgan case study | Qurilma, muammo, bajarilgan ish, hudud va ruxsatli foto |

Birinchi bosqichda barcha xizmat×hudud kombinatsiyalarini yaratish tavsiya qilinmaydi. 3–5 asosiy xizmat va 3–5 eng muhim hudud yetarli boshlanish bo‘ladi; tanlov talab va real imkoniyatga qarab qilinadi.

**Metadata namunalari — biznes faktlari tasdiqlangach:**

- Bosh title: `Appliance Repair & HVAC Services | Apex Home Services`.
- Bosh description: `Request appliance repair, heating, cooling or water-heater service in select NY, NJ, CT, MA and RI counties. ZIP coverage confirmed when you book.`
- Hudud title: `Home Services in Nassau County, NY | Apex`.
- Hudud H1: `Appliance repair, heating and cooling in Nassau County` — faqat shu xizmatlarning hududda mavjudligi tasdiqlansa.
- AC Repair’da geo qo‘shishdan oldin yagona sahifa besh shtatga xizmat qiladimi yoki alohida lokal sahifalar bo‘ladimi, shuni belgilash. Bir title’ga barcha county’larni tiqmaslik.

## 8. 30 kunlik ish rejasi

| Muddat | Ish | Mas’ul | Tayyor deb qabul qilish mezoni |
|---|---|---|---|
| 1–3-kun | Biznes modeli, qamrov, narx, sertifikat, aloqa soatlari va javobgarlikni aniqlash | Biznes egasi | Barcha sahifalar uchun yagona tasdiqlangan ma’lumot |
| 1–7-kun | Privacy/terms sahifalari va forma havolalari; kontaktni to‘ldirish | Kontent + mutaxassis + dasturchi | Sahifalar 200, footer va formadan ochiladi |
| 1–7-kun | www 301/308; title dublikati; accessible name | Dasturchi | Redirect zanjiri qayta tekshirilgan, nomlash xatosi yo‘q |
| 1–7-kun | GSC/analitika holatini tekshirish va konversiyalarni belgilash | SEO + analitika | Indexing holati ma’lum; test muhitida success/error farqlanadi |
| 8–14-kun | Asosiy 3–5 appliance sahifasini tayyorlash | SEO + servis mutaxassisi | Noyob kontent, self-canonical, ichki havola va sitemap |
| 8–14-kun | Organization/Service entity va coverage mosligi | Dasturchi + SEO | Markup valid, faktlar ko‘rinadigan kontentga mos |
| 15–21-kun | 3–5 ustuvor lokal sahifa va haqiqiy case study | Kontent + biznes | Hududga xos foydali ma’lumot, sun’iy takror yo‘q |
| 15–21-kun | AC Repair LCP va rasm optimizatsiyasi | Dasturchi | Bir xil sharoitdagi bir necha o‘lchov yaxshilanishni ko‘rsatadi |
| 22–30-kun | GSC, ariza va qo‘ng‘iroq ma’lumotlarini ko‘rib chiqish | SEO + savdo | Landing→murojaat→malakali lead yo‘li ko‘rinadi |

Bu reja ish navbati; qidiruv trafikining 30 kunda aniq foizga oshishi va’dasi emas.

## 9. Natijani qanday o‘lchash kerak

- GSC: indekslangan canonical URLlar, query/page bo‘yicha impressions, clicks, CTR; service va hududlar kesimida.
- Organik trafikdan muvaffaqiyatli arizalar; qo‘ng‘iroq bosishlari alohida.
- CRM: haqiqiy xizmat hududidagi malakali leadlar, bog‘lanish vaqti, tashrifga va sotuvga aylanish.
- Sahifa bo‘yicha formani ochish → boshlash → muvaffaqiyatli yuborish nisbatlari.
- CrUX/RUM mavjud bo‘lsa mobil LCP, INP va CLS. Lab balini yagona KPI qilmaslik.

Auditda organik trafik, real ranking, konversiya foizi, backlink soni, reklama xarajati yoki daromad aniqlanmadi. Ular uchun tegishli hisoblar yoki eksport kerak; bu raqamlar taxmin qilinmadi.

## 10. Ilovalar

- `apex-sahifalar-va-kontent.md` — 20 sahifa inventari, metadata va kontent sarlavhalari.
- `apex-parsed-pages.json` — URLlar, metadata, headings, so‘z sonlari, linklar, rasm atributlari va JSON-LD.
- `apex-texnik-dalillar.json` — HTTP tekshiruvlari va barcha to‘rtta Lighthouse o‘lchovi.
- `home-desktop.png`, `home-mobile.png`, `booking-mobile.png`, `ac-repair-mobile.png` — audit paytidagi ekran tasvirlari.

Eng katta ustuvorlik: ishonch va biznes ma’lumotlarini aniqlashtirish, xizmat/hudud sahifalarini foydali kontent bilan rivojlantirish va kelayotgan murojaatlarni to‘g‘ri o‘lchash. Texnik SEO bazasi allaqachon yaxshi holatda.
