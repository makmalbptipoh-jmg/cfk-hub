# 🛠️ Panduan Selenggara — CFK HUB

> **Ringkasnya:** App ini "managed" (Vercel + Supabase). **Tiada selenggara harian.**
> Anda cuma **guna** app. Senarai di bawah cuma semakan ringan sekali-sekala.

---

## ✅ Berjalan automatik — anda TAK perlu buat apa-apa
- [x] Hosting (Vercel) — tiada server nak jaga
- [x] Database (Supabase) — dikendali penuh oleh Supabase
- [x] Backup mingguan — setiap Ahad 10:00 pagi (GitHub Actions)
- [x] Pemantauan ralat (Sentry) — e-mel anda bila ada masalah
- [x] Deploy automatik bila kod dikemas kini
- [x] Ujian automatik (CI) setiap perubahan

---

## 📅 Checklist ikut kekerapan

### Bila dapat E-MEL dari Sentry (pantau sahaja)
- [ ] Baca e-mel — ada ralat berlaku dalam app
- [ ] Forward / beritahu pembangun untuk baiki
- [ ] Anda tak perlu buat apa-apa teknikal

### Sebulan sekali (~5 minit)
- [ ] Semak backup masih hijau: **GitHub → repo → Actions → "Backup Database Mingguan"** → run terkini ✅
- [ ] (Pilihan) Semak penggunaan Supabase: **Supabase → Settings → Usage** — pastikan belum hampir had percuma
- [ ] Muat turun 1 backup untuk simpanan luar talian (Actions → run → Artifacts) — untuk keperluan LHDN 7 tahun

### Beberapa bulan sekali
- [ ] Minta pembangun **update library** (tampung keselamatan) — bukan segera, cuma kebersihan
- [ ] Semak sama ada perlu naik taraf Supabase Pro (jika data dah besar)

---

## 🔗 Papan pemuka penting (simpan pautan ini)

| Perkhidmatan | Untuk apa | Pautan |
|---|---|---|
| **Vercel** | Hosting, deploy, env vars | vercel.com (akaun `chessforkids80`) |
| **Supabase** | Database, backup, penggunaan | supabase.com (projek `jfkmfmjsqbwcgzxiyees`) |
| **Sentry** | Ralat production | sentry.io |
| **GitHub** | Kod + backup + Actions | github.com/makmalbptipoh-jmg/cfk-hub |
| **App** | Aplikasi sebenar | cfk-hub.vercel.app |

---

## 💰 Had percuma & bila perlu bayar
- **Supabase Free:** ~500MB DB, backup 7 hari. Bila data membesar (banyak tahun), naik **Pro (~USD25/bulan)** untuk lebih storan + backup lama. *(Belum perlu sekarang.)*
- **Vercel Free & Sentry Free:** cukup untuk saiz semasa.
- App diguna setiap hari → Supabase takkan "tidur" (free tier pause selepas 7 hari tak guna).

---

## 🆘 Backup manual (bila-bila perlu)
1. **GitHub → repo → Actions → "Backup Database Mingguan"**
2. Klik **Run workflow → Run workflow**
3. Tunggu hijau ✅ → fail backup dalam **Artifacts**

---

## 📞 Bila panggil pembangun
- Nak ciri baharu / ubah sesuatu dalam app
- Ada ralat yang Sentry beritahu
- Update keselamatan library (beberapa bulan sekali)
- App tak boleh dibuka / masalah teknikal

> **Nota:** Sesetengah ciri baharu perlu **fail SQL dijalankan di Supabase** (Supabase → SQL Editor → paste → Run) SEBELUM ciri itu boleh guna. Pembangun akan beritahu bila perlu. Fail SQL disimpan dalam `scripts/sql/`. Selamat dijalankan berulang kali.

---

## ⚠️ Kredential penting (JANGAN kongsi / hilang)
- Kata laluan login admin app
- Kata laluan database Supabase
- Akses akaun Vercel, Supabase, Sentry, GitHub
- Fail `.env.local` (jika ada di komputer) — mengandungi kunci rahsia

> Simpan semua kata laluan di tempat selamat (password manager / nota berkunci).

---

*Dikemas kini: 8 Julai 2026. Untuk butiran teknikal penuh, lihat `docs/planning/implementation-status.md` & `README.md`.*
