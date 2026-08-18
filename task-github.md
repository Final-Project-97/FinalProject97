# RAC AI — Task Backlog (GitHub)

Backlog issue per role untuk MVP Lite **7 hari**. Setiap baris = **1 GitHub Issue** = **1 branch** = **1 PR ke `dev`**.

| Field | Value |
|-------|-------|
| **Produk** | RAC (Recommendation Auto Car) AI — MVP Lite |
| **Sumber** | [`PRD.md`](./PRD.md) · [`ERD.md`](./ERD.md) · [`git-workflow.md`](./git-workflow.md) |
| **Prioritas** | **P0 wajib DoD** · P1 jika sempat |

---

## 1. Tim, kode, label

| Kode | Assignee | Role | Label GitHub |
|------|----------|------|----------------|
| **SH** | semua / Mail | Shared setup | `role:shared` |
| **ML** | Mail | Fullstack (lebih BE) — auth, models, wishlist, showroom, Midtrans, E2E | `role:mail` |
| **AL** | Althaf | Backend — cars, **LangChain + Groq**, token gate | `role:althaf` |
| **BR** | Brian | Fullstack (lebih FE) — API client, AI UI, wishlist, paywall | `role:brian` |
| **NB** | Nabhan | Frontend — shell, homepage, detail, polish | `role:nabhan` |

**Label tambahan (buat sekali di repo):**

```
p0
p1
type:feat
type:chore
type:fix
area:backend
area:frontend
area:ai
area:infra
```

**Cara buka issue:** judul = `[KODE] ringkasan` (contoh `[AL-04] GET /api/cars read-only`). Body copy-paste blok di bawah. Di akhir body tulis `Closes` setelah issue nomor diketahui, atau link PRD ID (`HP-01`, `CT-06`, …).

---

## 2. Shared

### SH-01 — Monorepo + branch `main`/`dev` + proteksi
**Labels:** `role:shared` `type:chore` `area:infra` `p0`  
**Hari:** D1 pagi · **Assignee:** Mail (eksekusi), semua clone setelahnya

- [ ] Struktur `backend/` + `frontend/` + `docs/` sesuai git-workflow §3
- [ ] Branch `dev` dibuat dari `main`; proteksi: no direct push, require PR
- [ ] `README.md` clone + `npm install` (atau setara) untuk BE & FE
- [ ] Siapa merge `dev → main`: **Mail**

---

### SH-02 — `.env.example` + daftar env PRD §13
**Labels:** `role:shared` `type:chore` `area:infra` `p0`  
**Hari:** D1 · **Assignee:** Mail append dulu; AL tambah `GROQ_API_KEY` / `OPENAI_API_KEY`; BR/NB hanya **tambah baris** miliknya

Minimal ada: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_*`, `GOOGLE_PLACES_API_KEY`, `CARAPI_*`, `SYNC_SECRET`, `GROQ_API_KEY`, `MIDTRANS_*`, `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_MIDTRANS_CLIENT_KEY`.

---

## 3. Althaf — Backend + LangChain

Wilayah: `backend/src/cars`, `backend/src/ai`, `backend/config/car-enrichment.json`, `backend/scripts/`.

### AL-01 — Bootstrap Express + Mongo + Mongoloquent
**Labels:** `role:althaf` `type:chore` `area:backend` `p0`  
**Hari:** D1 · **Depends:** SH-01

- [ ] Server Express di `PORT`, health `GET /health`
- [ ] Koneksi MongoDB (Atlas atau local)
- [ ] Zod di pipeline request (siap dipakai modul lain)
- [ ] Script `npm run dev`

---

### AL-02 — CarAPI sync POC + model `cars`
**Labels:** `role:althaf` `type:feat` `area:backend` `p0`  
**Hari:** D1–D2 · **PRD:** CT-01 · **ERD:** `cars`

- [ ] Model `cars` sesuai ERD §4.2 + index `slug`, `brand+type`, `isTopProduct`, `externalSource+externalId`
- [ ] Login/fetch CarAPI (demo 2015–2020 cukup) **server-side only**
- [ ] Upsert by `slug`; set `externalSource=carapi`, `syncedAt`
- [ ] `npm run sync:cars` jalan (boleh masih tanpa enrichment lengkap)

---

### AL-03 — Mapper + merge `config/car-enrichment.json`
**Labels:** `role:althaf` `type:feat` `area:backend` `p0`  
**Hari:** D2 · **PRD:** CT-02–CT-05 · **Depends:** AL-02

- [ ] Map make/model/trim/body/engine → schema `cars` (MSRP **bukan** `basePrice`)
- [ ] Merge enrichment: `basePrice`, `colors[]`, `thumbnailUrl`, `image360Url`, `isTopProduct`
- [ ] Tepat **1** mobil `isTopProduct: true`
- [ ] Log created / updated / skipped
- [ ] **5–10 mobil** ter-enrich di Mongo setelah sync

---

### AL-04 — `GET /api/cars`, `/top`, `/:id` (read-only)
**Labels:** `role:althaf` `type:feat` `area:backend` `p0`  
**Hari:** D2 · **PRD:** CT-06 · **Depends:** AL-03

- [ ] List (filter ringan brand/type opsional)
- [ ] `/top` → satu Top Product (404/null jelas jika belum di-set)
- [ ] `/:id` → detail + `colors[]` + availability
- [ ] Hanya `status: active`
- [ ] Contoh JSON di komentar issue untuk FE (NB/BR)

**Bonus D2:** `POST /api/internal/sync/cars` guard `SYNC_SECRET` (CT-07).

---

### AL-05 — LangChain + Groq/OpenAI POC
**Labels:** `role:althaf` `type:chore` `area:ai` `p0`  
**Hari:** D1 · **PRD:** §5 AI

- [ ] Satu call Groq (primary) berhasil dari server
- [ ] Fallback error graceful (NFR AI Fallback)
- [ ] Belum perlu endpoint produk — cukup service helper di `backend/src/ai/`
- [ ] Env: `GROQ_API_KEY` (append di `.env.example`)

---

### AL-06 — Helper akses AI (premium vs free vs block)
**Labels:** `role:althaf` `type:feat` `area:ai` `p0`  
**Hari:** D3 (dipakai AL-07) · **PRD:** §4 + SU-08 · **Depends:** ML-01 (baca `users` / `subscriptions`)

Satu middleware/helper di `ai/` dipakai ketiga endpoint AI:

| Kondisi | Hasil |
|---------|--------|
| `expiresAt > now` | lolos, unlimited |
| no sub / expired + token > 0 | lolos, decrement |
| else | `403 TOKEN_EXHAUSTED` |

- [ ] Jangan duplikasi di tiap controller
- [ ] Mail cron (ML-08) hanya set token=0; **blok tetap di helper ini**

---

### AL-07 — `POST /api/ai/recommend`
**Labels:** `role:althaf` `type:feat` `area:ai` `p0`  
**Hari:** D3 · **PRD:** HP-03, HP-04, SU-02 · **Depends:** ML-02, AL-04, AL-05, AL-06

- [ ] Input: budget, kebutuhan, penumpang, prioritas, warna opsional
- [ ] Output: tipe/mobil dari katalog DB + warna + alasan singkat
- [ ] ≥ 1 rekomendasi valid bila katalog ada
- [ ] Free: −1 token + log `ai_usage_logs.feature=recommend`
- [ ] Premium (`expiresAt > now`): unlimited, tetap log
- [ ] Habis/expired → `403 TOKEN_EXHAUSTED`

---

### AL-08 — `POST /api/ai/chat` (stateless)
**Labels:** `role:althaf` `type:feat` `area:ai` `p0`  
**Hari:** D4 · **PRD:** CB-02–CB-05 · **Depends:** AL-07 (reuse gate)

- [ ] Context katalog dari Mongo (jangan hallucinate ID palsu)
- [ ] Tidak persist riwayat
- [ ] Token gate sama dengan recommend
- [ ] Groq down → error JSON jelas (bukan 500 kosong)

---

### AL-09 — `POST /api/ai/credit-simulate`
**Labels:** `role:althaf` `type:feat` `area:ai` `p0`  
**Hari:** D5 · **PRD:** CR-01–CR-03 · **Depends:** AL-06

- [ ] Input: harga, DP, tenor 12–60, suku bunga
- [ ] Output deterministik: cicilan, total bunga, total bayar
- [ ] Insight AI singkat (CR-03 = P1, boleh stub 1 kalimat)
- [ ] Hitung angka **jangan** diserahkan 100% ke LLM (salah hitung = bug)
- [ ] Token gate: insight AI = 1 token; kalau mau hemat, hitung angka gratis + insight ber-token — **tulis keputusan di issue**, default PRD: tiap call AI = 1 token

---

### AL-10 — E2E sync + deploy backend
**Labels:** `role:althaf` `type:chore` `area:infra` `p0`  
**Hari:** D7 · **Depends:** AL-04, AL-07

- [ ] `npm run sync:cars` didokumentasikan di README
- [ ] BE ter-deploy (Railway/Render/Fly — pilih satu) — koordinasi webhook Midtrans dengan Mail (ML-07)
- [ ] Health check hidup
- [ ] 3 endpoint AI hidup di URL publik ( Groq key di env host)

---

## 4. Mail — Fullstack (lebih Backend)

Wilayah: `backend/src/models/{users,subscriptions,ai_usage_logs,wishlists}`, `auth/`, `wishlist/`, `showrooms/`, `subscription/`. Lead merge `dev → main`.

> Model `cars` milik Althaf. Model `wishlists` milik Mail. Jangan berdua edit file model yang sama di jam yang sama.

### ML-01 — Models ERD: `users`, `subscriptions`, `ai_usage_logs`, `wishlists`
**Labels:** `role:mail` `type:feat` `area:backend` `p0`  
**Hari:** D1 · **ERD:** §4.1, §4.3, §4.4, §4.5

- [ ] `users`: googleId/email unique, `role=buyer`, `aiTokensRemaining` default 5, `location` opsional
- [ ] `subscriptions`: unique `userId`, unique `orderId`, index `expiresAt`
- [ ] `ai_usage_logs`: `feature` enum `recommend | chat | credit` (Althaf yang nulis log dari `ai/`)
- [ ] `wishlists`: unique `{ userId, carId }`
- [ ] Index sesuai ERD

---

### ML-02 — Google OAuth + JWT 24h
**Labels:** `role:mail` `type:feat` `area:backend` `p0`  
**Hari:** D2 · **PRD:** AU-01–AU-03 · **Depends:** ML-01

```
POST /api/auth/google
POST /api/auth/logout
```

- [ ] Sign in Google → upsert user buyer
- [ ] User baru: `aiTokensRemaining=5`, belum ada `subscriptions` (SU-01)
- [ ] JWT 24h (httpOnly cookie **atau** Bearer — pilih satu, tulis di issue untuk BR)
- [ ] Logout: invalidate di client (MVP)

---

### ML-03 — `GET /api/auth/me` (+ subscription ringkas)
**Labels:** `role:mail` `type:feat` `area:backend` `p0`  
**Hari:** D2 atau D6 · **PRD:** AU-04

- [ ] User + `aiTokensRemaining` + `expiresAt` / days remaining
- [ ] 401 jika token invalid

---

### ML-04 — Wishlist CRUD
**Labels:** `role:mail` `type:feat` `area:backend` `p0`  
**Hari:** D3 · **PRD:** WL-01–WL-04 · **ERD:** `wishlists` · **Depends:** ML-02 (JWT)

```
GET    /api/wishlist
POST   /api/wishlist
PUT    /api/wishlist/:id
DELETE /api/wishlist/:id
```

- [ ] Auth wajib; `userId` dari JWT
- [ ] Unique `{ userId, carId }`; field `selectedColor`, `notes`, `source`, `matchScore`, `aiReason`
- [ ] Delete menghapus milik user itu saja
- [ ] Update notes/warna (WL-03 = P1, boleh ikut di endpoint yang sama)

---

### ML-05 — `GET /api/showrooms/nearby` Opsi A
**Labels:** `role:mail` `type:feat` `area:backend` `p0`  
**Hari:** D4 · **PRD:** SH-03, SH-04

- [ ] Query `lat`, `lng` (Zod)
- [ ] Coba Google Places (car dealer, ~10 km) → `{ source: "google_places", data }`
- [ ] Gagal/kosong → seed, sort jarak → `{ source: "seed", data }`
- [ ] Item: nama, alamat, jarak, link Google Maps
- [ ] Backend **stateless** (tidak simpan ke Mongo)

---

### ML-06 — `config/showrooms.seed.json` (min. 3, Jakarta)
**Labels:** `role:mail` `type:chore` `area:backend` `p0`  
**Hari:** D4 · **PRD:** SH seed · **Depends:** ML-05 (bisa paralel)

- [ ] ≥ 3 showroom lat/lng Jakarta
- [ ] Dipakai fallback ML-05
- [ ] Bukan collection MongoDB

---

### ML-07 — Subscription checkout + webhook Midtrans
**Labels:** `role:mail` `type:feat` `area:backend` `p0`  
**Hari:** D5 · **PRD:** SU-03–SU-05, SU-09 · **ERD:** `subscriptions` · **Depends:** ML-01

```
GET  /api/subscription/status
POST /api/subscription/checkout     # premium_monthly
POST /api/subscription/webhook
```

- [ ] Snap sandbox; `paymentType: premium_monthly`
- [ ] Webhook sukses: upsert by `userId` → `expiresAt = now+30d`, `paymentStatus=success`, `paidAt`
- [ ] Re-subscribe: perpanjang +30 hari dari pembayaran baru
- [ ] Status: `expiresAt`, tokens, days remaining (tokens dari `users` — baca, jangan logic gate AI di sini; gate milik AL-06)

---

### ML-08 — Cron expiry premium
**Labels:** `role:mail` `type:feat` `area:backend` `p0`  
**Hari:** D6 · **PRD:** SU-07 · **Depends:** ML-07

- [ ] Job: jika `expiresAt <= now` → `users.aiTokensRemaining = 0`
- [ ] Dokumentasi cara jalan (node-cron / script)

Althaf tetap owner **blok endpoint AI** (AL-06); cron hanya set token = 0.

---

### ML-09 — Integration test auth + AI + subscription
**Labels:** `role:mail` `type:chore` `area:backend` `p0`  
**Hari:** D6 · **Depends:** ML-02, ML-07, AL-07

- [ ] Login Google (dev token / mock) → me
- [ ] 5x AI → token 0 → 403 + body siap dikonsumsi FE upgrade
- [ ] Webhook sandbox (atau POST internal simulasi) → premium → AI lolos
- [ ] Expired (ubah `expiresAt` di DB) → AI diblok

---

### ML-10 — E2E + merge `main` + dampingi deploy
**Labels:** `role:mail` `type:chore` `area:infra` `p0`  
**Hari:** D7

- [ ] Checklist DoD PRD §12 ditick bareng tim
- [ ] `dev` hijau → merge ke `main`
- [ ] FE+BE URL demo di README
- [ ] Webhook Midtrans mengarah ke URL publik sandbox (koordinasi AL-10)
- [ ] Tidak ada P0 terbuka tanpa alasan tertulis di channel

---

## 5. Brian — Fullstack (lebih Frontend)

Wilayah: `frontend/src/api/`, `context/`, pages Recommend/Chat/Credit/Wishlist/Upgrade, shared Toast/Swal.

### BR-01 — API client + AuthContext
**Labels:** `role:brian` `type:chore` `area:frontend` `p0`  
**Hari:** D1 · **Depends:** SH-01 · **Kontrak JWT:** ML-02 (boleh mock dulu)

- [ ] Axios/fetch wrapper + `VITE_API_URL`
- [ ] Simpan/kirim token sesuai keputusan ML (cookie vs Bearer)
- [ ] File per domain: `auth.js`, `cars.js`, `ai.js`, `wishlist.js`, `showrooms.js`, `subscription.js`
- [ ] Mock response berbentuk sama dengan API nanti

---

### BR-02 — ShowroomProvider + GPS 1x/session
**Labels:** `role:brian` `type:feat` `area:frontend` `p0`  
**Hari:** D2 · **PRD:** SH-01, SH-02, SH-06 · **API:** ML-05 (mock dulu)

- [ ] Minta GPS **1x** per session
- [ ] `GET /api/showrooms/nearby` **1x**; simpan Context + `sessionStorage`
- [ ] Semua CTA “Showroom Terdekat” **baca state**, tanpa fetch ulang
- [ ] GPS ditolak → default Jakarta → tetap fetch 1x (P1, kerjakan jika sempat D2/D4)

---

### BR-03 — UI daftar showroom (dari session)
**Labels:** `role:brian` `type:feat` `area:frontend` `p0`  
**Hari:** D4 · **PRD:** SH-05 · **Depends:** BR-02

- [ ] Nama, alamat, jarak, link Maps
- [ ] Tampilkan `source` (places vs seed) opsional untuk debug
- [ ] Dipakai dari home, hasil rekomendasi, dan detail (CTA)

---

### BR-04 — Form rekomendasi + hasil
**Labels:** `role:brian` `type:feat` `area:frontend` `p0`  
**Hari:** D3–D4 · **PRD:** HP-03, HP-04 · **API:** AL-07

- [ ] Field: budget min–max, tipe kebutuhan, penumpang, prioritas, warna opsional
- [ ] Loading skeleton
- [ ] Hasil: tipe/mobil, warna, CTA ke detail + showroom (session)
- [ ] Guest: 1x trial **atau** prompt login (ikut flow PRD §9.1 — pilih satu, default: prompt login)
- [ ] `403` → modal upgrade (BR-10)

---

### BR-05 — Chatbot UI
**Labels:** `role:brian` `type:feat` `area:frontend` `p0`  
**Hari:** D4–D5 · **PRD:** CB-01, CB-04 · **API:** AL-08

- [ ] Widget floating **atau** halaman dedicated (mobile-first; dedicated lebih aman bentrok NB)
- [ ] Stateless: tidak reload history dari server
- [ ] Token habis → prompt upgrade, input disabled

---

### BR-06 — Form simulasi kredit
**Labels:** `role:brian` `type:feat` `area:frontend` `p0`  
**Hari:** D5 · **PRD:** CR-01, CR-02, CR-04 · **API:** AL-09

- [ ] Harga, DP, tenor 12–60, bunga
- [ ] Output: cicilan, total bunga, total bayar + insight
- [ ] Pre-fill harga dari detail (P1, query param / location state)
- [ ] Toast error jika API gagal

---

### BR-07 — Wishlist list + add/update/delete
**Labels:** `role:brian` `type:feat` `area:frontend` `p0`  
**Hari:** D6 · **PRD:** WL-01–WL-05 · **API:** ML-04 · **Depends:** BR-08 (protected)

- [ ] List milik user
- [ ] Add dari detail / hasil rekomendasi (warna opsional)
- [ ] Delete: SweetAlert2 confirm
- [ ] Toast success/error (React-Toastify)
- [ ] Update catatan/warna (P1)

---

### BR-08 — Login Google + protected routes
**Labels:** `role:brian` `type:feat` `area:frontend` `p0`  
**Hari:** D6 (UI bisa mulai D2) · **PRD:** AU-01, AU-04 · **API:** ML-02, ML-03

- [ ] Tombol Sign in with Google
- [ ] Protected: wishlist, subscription/upgrade status
- [ ] Setelah login, restore session showroom tidak di-reset (jangan hapus `sessionStorage` showroom)

---

### BR-09 — Halaman upgrade + Midtrans Snap
**Labels:** `role:brian` `type:feat` `area:frontend` `p0`  
**Hari:** D5 · **PRD:** SU-03, SU-04 · **API:** ML-07

- [ ] Harga premium monthly + CTA bayar
- [ ] Snap sandbox (`VITE_MIDTRANS_CLIENT_KEY`)
- [ ] Sukses → refresh `/auth/me` atau `/subscription/status` → toast
- [ ] Gagal → toast error

---

### BR-10 — Prompt token habis / premium expired
**Labels:** `role:brian` `type:feat` `area:frontend` `p0`  
**Hari:** D7 · **PRD:** SU-08, flow §9.2

- [ ] Satu komponen reuse di recommend, chat, credit
- [ ] Copy jelas: subscribe ulang (bukan “token refill gratis”)
- [ ] CTA ke BR-09

---

## 6. Nabhan — Frontend

Wilayah: `pages/Home`, `CarDetail`, `Profile`, `components/layout`, `components/product` (CI360, ColorPicker).

### NB-01 — React + Tailwind + DaisyUI + router
**Labels:** `role:nabhan` `type:chore` `area:frontend` `p0`  
**Hari:** D1 · **Depends:** SH-01

- [x] Vite React SPA
- [x] Tailwind + DaisyUI
- [x] Router: `/`, `/cars/:id`, plus placeholder route untuk halaman Brian (jangan isi logic)
- [x] Breakpoints: 375 / 768 / 1024
- [x] Merge ke `dev` **D1 sore** supaya Brian mulai dari shell yang sama

---

### NB-02 — App shell (header + bottom nav)
**Labels:** `role:nabhan` `type:feat` `area:frontend` `p0`  
**Hari:** D1–D2 · **PRD:** HP-06

- [x] Header: logo, wishlist icon, avatar placeholder
- [x] Bottom nav mobile: Home, AI Chat, Wishlist, Profile (link ke route Brian/NB)
- [x] Sticky, touch target ≥ 44px
- [x] Semantic landmarks

---

### NB-03 — Homepage Top Product + CI360
**Labels:** `role:nabhan` `type:feat` `area:frontend` `p0`  
**Hari:** D2 · **PRD:** HP-01, HP-02 · **API:** AL-04 `/cars/top` (mock dulu)

- [?] 1 hero Top Product: nama, harga, badge
- [x] cloudimage-360-view; load < 5s di 4G (best effort)
- [x] **Fallback gambar statis** jika CI360 gagal / URL kosong
- [] CTA Lihat Detail → `/cars/:id`

---

### NB-04 — Detail produk + color picker
**Labels:** `role:nabhan` `type:feat` `area:frontend` `p0`  
**Hari:** D3 · **PRD:** PD-01–PD-03 · **API:** AL-04 `/:id`

- [X] Nama, brand, harga, specs, deskripsi
- [X] Color picker: **1 image per warna**, swap on select
- [X] Availability: available / limited / out
- [X] Slot tombol Wishlist + link kredit + CTA showroom (Brian yang wiring onClick; NB taruh button/disabled placeholder dengan `data-*` atau callback props)

---

### NB-05 — Profil: badge premium + `expiresAt` (P1)
**Labels:** `role:nabhan` `type:feat` `area:frontend` `p1`  
**Hari:** D5 · **PRD:** SU-06 · **API:** ML-03 / ML-07 status

- [ ] Nama + avatar Google
- [ ] Sisa token (free) atau badge premium + tanggal expired
- [ ] Link upgrade

Kalau P0 belum closed, **tunda**. Jangan blok D7.

---

### NB-06 — Polish mobile 375px + a11y best effort
**Labels:** `role:nabhan` `type:chore` `area:frontend` `p0`  
**Hari:** D7 · **PRD:** NFR + DoD viewport 375px

- [ ] Home + detail lulus 375px tanpa horizontal scroll
- [ ] FCP best effort; gambar hero lazy/fallback
- [ ] Contrast WCAG AA best effort
- [ ] Pakai Toast/Swal dari `components/shared` (punya Brian) — jangan buat library kedua

---

### NB-07 — CTA homepage: chatbot, auth, wishlist, showroom
**Labels:** `role:nabhan` `type:feat` `area:frontend` `p1`  
**Hari:** D4 · **PRD:** HP-05, HP-06

- [ ] Nav/CTA mengarah ke route yang sudah ada
- [ ] Showroom CTA memanggil data dari ShowroomContext (import context Brian; jangan fetch sendiri)

---

## 7. Peta dependensi (buat GitHub Milestone)

```
SH-01 ─┬─ NB-01 ─ NB-02 ─ NB-03 ─ NB-04 ─ NB-06
       │              └─ NB-07
       ├─ BR-01 ─ BR-02 ─ BR-03
       │       ├─ BR-04 ─ BR-10
       │       ├─ BR-05
       │       ├─ BR-06
       │       ├─ BR-08 ─ BR-07
       │       └─ BR-09
       ├─ AL-01 ─ AL-02 ─ AL-03 ─ AL-04
       │       └─ AL-05 ─ AL-06 ─ AL-07 ─ AL-08 ─ AL-09 ─ AL-10
       └─ ML-01 ─ ML-02 ─ ML-03
              ├─ ML-04
              ├─ ML-05 ─ ML-06
              └─ ML-07 ─ ML-08 ─ ML-09 ─ ML-10
```

**Milestone GitHub (opsional):** `D1 Setup` · `D2 Katalog+Home` · `D3 Detail+Recommend` · `D4 Chat+Showroom` · `D5 Pay+Credit` · `D6 Integrasi` · `D7 Demo`.

---

## 8. Template body issue

```markdown
## Konteks
PRD: <ID> · ERD: <collection> · Hari: D#

## Scope
-

## Out of scope
-

## Acceptance
- [ ]

## Kontrak / catatan
- Branch: `feat/<KODE>-...`
- Reviewer: <role pasangan>
```

**Reviewer default:** AL ↔ ML (cars/AI ↔ auth/wishlist/pay) · NB ↔ BR (FE). PR lintas folder wajib di-CC owner folder.

---

## 9. Definition of Done (syarat close milestone D7)

Salin dari PRD §12 — issue tidak “done” kalau item ini gagal:

- [ ] Semua P0 terimplementasi
- [ ] Mobile 375px (home + detail)
- [ ] Auth Google + JWT
- [ ] AI token decrement + block saat habis
- [ ] Midtrans sandbox → premium 30 hari
- [ ] Premium expired → AI blocked + prompt re-subscribe
- [ ] Wishlist CRUD + toast + confirm delete
- [ ] CarAPI sync + enrichment → **5–10 mobil**
- [ ] 1 Top Product + CI360 + `colors[]`
- [ ] **3 showroom** di seed JSON
- [ ] Places 1x/session + fallback seed
- [ ] `npm run sync:cars` di README
- [ ] README setup local + env

---

*Jangan buka issue di luar tabel ini tanpa sepakat di channel — sprint 7 hari, P0 dulu.*
