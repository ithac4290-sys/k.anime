# AnimeKO.uz — O‘zbekcha Manga va Manxvalar Portali

**AnimeKO.uz** — zamonaviy, toza interfeysli, qizil neon uslubidagi, o‘zbek tilidagi manga, manxva hamda komikslarni qulay o‘qish imkonini beruvchi to‘liq veb-platforma.

## 🚀 Texnologik Stack
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Dark OLED manga mavzusi)
- **Ma'lumotlar bazasi:** [SQLite (better-sqlite3)](https://github.com/WiseLibs/better-sqlite3) (Lokal fayl bazasi, WAL rejimi, yuqori tezlik)
- **Ikonkalar:** [Lucide React](https://lucide.dev/)
- **Til:** TypeScript

---

## 🌟 Asosiy Imkoniyatlar
1. **Bosh Sahifa (`/`)**:
   - Tavsiya etilgan eng sara mangalar karuseli (Featured Hero Banner)
   - Janrlar bo'yicha tezkor filtrlar
   - So'nggi yangilangan boblar va eng ko'p o'qilganlar ro'yxati
2. **Katalog & Qidiruv (`/catalog`)**:
   - Tezkor matnli qidiruv (nomi, asl nomi, muallif)
   - Janr, manga turi (manga, manhwa, manhua) va holati (ongoing, completed) bo'yicha saralash
   - Reyting, ko'rishlar va sanaga ko'ra tartiblash
3. **Manga Sahifasi (`/manga/[slug]`)**:
   - Muqova, to'liq tavsif, muallif/rassom, chiqarilgan yili va reyting
   - Boblar ro'yxati va sanalari
   - "Boshidan o'qish" va "So'nggi bob" tugmalari
   - Xatcho'plarga saqlash (Bookmark)
4. **Interaktiv O‘quvchi (`/manga/[slug]/read/[chapterNumber]`)**:
   - **Vebtun (Scroll) rejimi:** Uzluksiz vertikal scroll orqali o'qish (Manxvalar uchun juda qulay)
   - **Sahifa rejimi:** Klaviaturadagi tugmalar (`←` / `→`) va swipe orqali birma-bir o'qish
   - Kenglik sozlamasi (Normal, Wide, Full)
   - To'liq ekran (Fullscreen) rejimi
   - Boblar o'rtasida tezkor o'tish menyusi
5. **Xatcho‘plar (`/bookmarks`)**:
   - Foydalanuvchi saqlab qo'ygan sevimli mangalar ro'yxati (LocalStorage)
6. **Tarjimon & Admin Paneli (`/admin`)**:
   - Platforma statistikasi (Mangalar soni, boblar soni, jami ko'rishlar)
   - Yangi manga/manxva kiritish formasi
   - Yangi boblarni yuklash (rasmlar URL ro'yxatini kiritish)
   - Mangalarni tahrirlash va o'chirish

---

## 🛠 Loyihani Ishga Tushirish

### 1. Dastur kutubxonalari o'rnatilgan bo'lsa:
```bash
npm run dev
```
So'ng brauzerda oching: [http://localhost:3000](http://localhost:3000)

### 2. Ishlab chiqarish (Production build) uchun:
```bash
npm run build
npm run start
```
