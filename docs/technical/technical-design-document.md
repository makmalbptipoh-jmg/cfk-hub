# Dokumen Reka Bentuk Teknikal (Technical Design Document) — CFK HUB

**Versi:** 1.0  
**Tarikh:** 27 Jun 2026  
**Stack:** Next.js 14 + TypeScript + Supabase + Vercel

---

## 1. Gambaran Keseluruhan Seni Bina

```
┌─────────────────────────────────────────────────────────────┐
│                        PENGGUNA                             │
│        Admin (Desktop)          Jurulatih (Mobile PWA)      │
└──────────────────┬──────────────────────────┬──────────────┘
                   │                          │
                   ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERCEL (CDN Global)                       │
│              Next.js 14 Application                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  App Router │  │  Middleware  │  │  API Routes      │   │
│  │  /app/*     │  │  (auth gate) │  │  /api/*          │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE (Singapore)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │  Auth (JWT)  │  │  Storage (PDF*)  │  │
│  │  Database    │  │              │  │  *tidak digunakan │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE APPS SCRIPT (Percuma)                   │
│  Google Forms → onFormSubmit → POST ke Supabase REST API    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Projek

```
cfk-hub/
├── src/
│   ├── app/                        ← Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx        ← S-01: Log Masuk
│   │   ├── (admin)/                ← Kumpulan route Admin
│   │   │   ├── layout.tsx          ← Layout dengan Sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        ← S-02: Dashboard Admin
│   │   │   ├── pelajar/
│   │   │   │   ├── page.tsx        ← S-03: Senarai Pelajar
│   │   │   │   ├── baharu/
│   │   │   │   │   └── page.tsx    ← S-05: Tambah Pelajar
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    ← S-04: Profil Pelajar
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx ← S-06: Edit Pelajar
│   │   │   ├── kehadiran/
│   │   │   │   ├── page.tsx        ← S-07: Kehadiran Admin
│   │   │   │   └── import/
│   │   │   │       └── page.tsx    ← S-09: Import GForms
│   │   │   ├── bayaran/
│   │   │   │   ├── page.tsx        ← S-11: Senarai Resit
│   │   │   │   └── baharu/
│   │   │   │       └── page.tsx    ← S-12: Rekod Bayaran
│   │   │   ├── laporan/
│   │   │   │   └── page.tsx        ← S-13: Laporan
│   │   │   ├── jurulatih/
│   │   │   │   ├── page.tsx        ← S-24: Senarai Jurulatih
│   │   │   │   ├── baharu/
│   │   │   │   │   └── page.tsx    ← S-26: Tambah Jurulatih
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    ← S-25: Profil Jurulatih
│   │   │   │       ├── kehadiran/
│   │   │   │       │   └── page.tsx ← S-27: Kehadiran Jurulatih
│   │   │   │       └── bayaran/
│   │   │   │           └── page.tsx ← S-28: Bayaran Jurulatih
│   │   │   ├── kewangan/
│   │   │   │   └── page.tsx        ← S-14, S-15
│   │   │   ├── aset/
│   │   │   │   └── page.tsx        ← S-18, S-19
│   │   │   ├── makluman/
│   │   │   │   └── page.tsx        ← S-16
│   │   │   └── tetapan/
│   │   │       ├── pengguna/
│   │   │       │   └── page.tsx    ← S-21
│   │   │       └── cawangan/
│   │   │           └── page.tsx    ← S-22
│   │   └── (jurulatih)/            ← Kumpulan route Jurulatih
│   │       ├── layout.tsx          ← Layout dengan Bottom Tab Bar
│   │       ├── kehadiran/
│   │       │   └── page.tsx        ← S-08: Rekod Kehadiran (J)
│   │       ├── pelajar/
│   │       │   └── page.tsx        ← S-03 (view Jurulatih)
│   │       ├── makluman/
│   │       │   └── page.tsx        ← S-16 (view Jurulatih)
│   │       └── dashboard/
│   │           └── page.tsx        ← S-23: Dashboard Jurulatih
│   ├── components/
│   │   ├── ui/                     ← Komponen asas
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Form/
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   └── Stepper.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         ← Navigasi Admin
│   │   │   ├── BottomTabBar.tsx    ← Navigasi Jurulatih
│   │   │   └── Topbar.tsx
│   │   ├── pdf/
│   │   │   └── ResitPDF.tsx        ← Komponen PDF resit
│   │   └── features/               ← Komponen domain
│   │       ├── pelajar/
│   │       ├── kehadiran/
│   │       ├── bayaran/
│   │       └── jurulatih/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           ← Supabase browser client
│   │   │   ├── server.ts           ← Supabase server client
│   │   │   └── middleware.ts       ← Supabase middleware helper
│   │   └── utils.ts                ← Helper functions
│   ├── types/
│   │   └── database.ts             ← TypeScript types dari Supabase
│   └── middleware.ts               ← Next.js middleware (auth guard)
├── public/
│   ├── manifest.json               ← PWA manifest
│   ├── sw.js                       ← Service worker (auto-gen by next-pwa)
│   ├── icon-192.png
│   └── icon-512.png
├── .env.local                      ← Kunci Supabase (tidak di-commit)
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 3. Skema Pangkalan Data (PostgreSQL)

### 3.1 Jadual Utama

```sql
-- Cawangan
CREATE TABLE cawangan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  alamat TEXT,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profil Pengguna (sambungan dari auth.users Supabase)
CREATE TABLE pengguna_profil (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nama TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  cawangan_id UUID REFERENCES cawangan(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pelajar
CREATE TABLE pelajar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_penuh TEXT NOT NULL,
  tarikh_lahir DATE,
  nama_ibu_bapa TEXT NOT NULL,
  no_telefon TEXT NOT NULL,
  emel_ibu_bapa TEXT,
  cawangan_daftar_id UUID REFERENCES cawangan(id) NOT NULL,
  jenis_kelas TEXT DEFAULT 'Kumpulan' CHECK (jenis_kelas IN ('Kumpulan', 'Personal', 'Kumpulan+Personal')),
  yuran_bulanan DECIMAL(8,2) NOT NULL,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  tarikh_daftar DATE DEFAULT CURRENT_DATE,
  sumber_daftar TEXT DEFAULT 'GoogleForms' CHECK (sumber_daftar IN ('GoogleForms', 'Manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kehadiran Pelajar
CREATE TABLE kehadiran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pelajar_id UUID REFERENCES pelajar(id) NOT NULL,
  tarikh DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Tidak Hadir', 'Cuti')),
  nota TEXT,
  cawangan_daftar_id UUID REFERENCES cawangan(id) NOT NULL,
  cawangan_sesi_id UUID REFERENCES cawangan(id) NOT NULL,  -- One-Price Policy (PD-006)
  jurulatih_id UUID REFERENCES pengguna_profil(id),
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pelajar_id, tarikh)  -- Satu rekod per pelajar per tarikh
);

-- Resit Nombor Sequence
CREATE SEQUENCE resit_seq START 1;

-- Resit
CREATE TABLE resit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombor_resit TEXT UNIQUE DEFAULT jana_nombor_resit(),
  pelajar_id UUID REFERENCES pelajar(id) NOT NULL,
  bulan_bayaran TEXT NOT NULL,  -- "Jun 2026"
  tahun_bayaran INTEGER NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('Kumpulan', 'Personal', 'Pendaftaran')),
  jumlah DECIMAL(8,2) NOT NULL,
  kaedah_bayaran TEXT CHECK (kaedah_bayaran IN ('Tunai', 'Transfer')),
  tarikh_bayar DATE NOT NULL,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Dibatalkan')),
  sebab_batal TEXT,
  tarikh_batal TIMESTAMPTZ,
  dibatal_oleh UUID REFERENCES pengguna_profil(id),
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jurulatih
CREATE TABLE jurulatih (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pengguna_id UUID REFERENCES pengguna_profil(id),  -- null jika tiada akaun sistem
  nama_penuh TEXT NOT NULL,
  no_ic TEXT UNIQUE,
  no_telefon TEXT,
  emel TEXT,
  cawangan_ids UUID[] DEFAULT '{}',  -- Array cawangan yang diajar
  kadar_bayaran DECIMAL(8,2),  -- RM per sesi
  tarikh_mula DATE,
  pengalaman_ringkas TEXT,
  kelayakan TEXT,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kehadiran Jurulatih
CREATE TABLE kehadiran_jurulatih (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jurulatih_id UUID REFERENCES jurulatih(id) NOT NULL,
  tarikh DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Tidak Hadir', 'Cuti')),
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jurulatih_id, tarikh)
);

-- Bayaran Jurulatih
CREATE TABLE bayaran_jurulatih (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jurulatih_id UUID REFERENCES jurulatih(id) NOT NULL,
  bulan_bayaran TEXT NOT NULL,   -- "Jun 2026"
  tahun_bayaran INTEGER NOT NULL,
  bilangan_sesi INTEGER NOT NULL,
  kadar_per_sesi DECIMAL(8,2) NOT NULL,
  jumlah DECIMAL(8,2) GENERATED ALWAYS AS (bilangan_sesi * kadar_per_sesi) STORED,
  tarikh_bayar DATE,
  status TEXT DEFAULT 'Belum Bayar' CHECK (status IN ('Sudah Bayar', 'Belum Bayar')),
  nota TEXT,
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kewangan Perbelanjaan
CREATE TABLE kewangan_perbelanjaan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarikh DATE NOT NULL,
  kategori TEXT NOT NULL,
  penerangan TEXT NOT NULL,
  jumlah DECIMAL(8,2) NOT NULL,
  cawangan_id UUID REFERENCES cawangan(id),  -- null = Umum
  direkod_oleh UUID REFERENCES pengguna_profil(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aset
CREATE TABLE aset (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT,
  nilai_asal DECIMAL(8,2),
  tarikh_beli DATE,
  cawangan_id UUID REFERENCES cawangan(id),
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Lupus')),
  sebab_lupus TEXT,
  tarikh_lupus DATE,
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Import Antrian (dari Google Forms)
CREATE TABLE import_antrian (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_penuh TEXT NOT NULL,
  tarikh_lahir TEXT,
  nama_ibu_bapa TEXT,
  no_telefon TEXT,
  cawangan_pilihan TEXT,
  adalah_pendua BOOLEAN DEFAULT FALSE,  -- auto-detect
  status TEXT DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Diimport', 'Ditolak')),
  tarikh_submit TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Fungsi & Trigger

```sql
-- Jana nombor resit auto
CREATE OR REPLACE FUNCTION jana_nombor_resit()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CFK-' || EXTRACT(YEAR FROM NOW())::TEXT ||
         '-' || LPAD(nextval('resit_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Detect pendua dalam import
CREATE OR REPLACE FUNCTION detect_import_pendua()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pelajar
    WHERE nama_penuh ILIKE NEW.nama_penuh
      AND no_telefon = NEW.no_telefon
  ) THEN
    NEW.adalah_pendua := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_detect_pendua
  BEFORE INSERT ON import_antrian
  FOR EACH ROW EXECUTE FUNCTION detect_import_pendua();
```

---

## 4. Row Level Security (RLS)

```sql
-- Aktifkan RLS pada semua jadual
ALTER TABLE pelajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE kehadiran ENABLE ROW LEVEL SECURITY;
ALTER TABLE resit ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurulatih ENABLE ROW LEVEL SECURITY;

-- Helper: semak is_admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT is_admin FROM pengguna_profil WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Policy: Admin boleh buat apa sahaja
CREATE POLICY "admin_all_pelajar" ON pelajar
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Policy: Jurulatih boleh LIHAT semua pelajar aktif (One-Price Policy)
CREATE POLICY "jurulatih_view_pelajar" ON pelajar
  FOR SELECT TO authenticated
  USING (NOT is_admin(auth.uid()) AND status = 'Aktif');

-- Policy: Jurulatih boleh INSERT kehadiran
CREATE POLICY "jurulatih_insert_kehadiran" ON kehadiran
  FOR INSERT TO authenticated
  WITH CHECK (NOT is_admin(auth.uid()) AND jurulatih_id = auth.uid());

-- Policy: Jurulatih boleh lihat kehadiran yang mereka rekod sahaja
CREATE POLICY "jurulatih_view_kehadiran" ON kehadiran
  FOR SELECT TO authenticated
  USING (NOT is_admin(auth.uid()) AND jurulatih_id = auth.uid());
```

---

## 5. Middleware Pengesahan (Next.js)

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* ... */ } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Jika tidak log masuk, redirect ke /login
  if (!user && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Semak is_admin untuk akses halaman Admin
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const { data: profil } = await supabase
      .from('pengguna_profil')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profil?.is_admin) {
      return NextResponse.redirect(new URL('/kehadiran', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon-|sw.js|manifest).*)']
}
```

---

## 6. Komponen Utama

### 6.1 Supabase Client

```typescript
// src/lib/supabase/client.ts  — untuk komponen Client
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts  — untuk Server Components & Route Handlers
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* cookie handlers */ } }
  )
}
```

### 6.2 Contoh Query — Pelajar Belum Bayar

```typescript
// Pelajar dengan ≥4 kehadiran bulan ini tapi belum bayar (PD-009, DR-036)
const { data } = await supabase
  .from('pelajar')
  .select(`
    *,
    kehadiran!inner(count),
    resit(*)
  `)
  .eq('status', 'Aktif')
  .gte('kehadiran.count', 4)
  .is('resit', null)  -- tiada resit bulan ini
```

---

## 7. Environment Variables

```bash
# .env.local (JANGAN commit ke GitHub)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]  # Hanya untuk server-side

# App
NEXT_PUBLIC_APP_URL=https://cfkhub.vercel.app
```

---

## 8. Pakej Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.4.0",
    "tailwindcss": "^3.0.0",
    "zustand": "^4.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "@hookform/resolvers": "^3.0.0",
    "@react-pdf/renderer": "^3.0.0",
    "lucide-react": "^0.400.0",
    "next-pwa": "^5.6.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

---

## 9. Pelan Pembangunan Teknikal

Selaras dengan fasa dalam Screen Inventory:

### Fasa 1 — 30 Jun 2026 (Operasi Asas)
- [ ] Setup projek Next.js + Supabase + Tailwind
- [ ] Buat skema DB (semua jadual utama)
- [ ] Setup auth + middleware
- [ ] S-01: Log Masuk
- [ ] S-02: Dashboard Admin (widget asas)
- [ ] S-03: Senarai Pelajar
- [ ] S-05: Tambah Pelajar (borang stepper)
- [ ] S-08: Rekod Kehadiran (Jurulatih)
- [ ] S-09: Import Google Forms
- [ ] S-21: Pengurusan Pengguna (Jurulatih)
- [ ] S-22: Pengurusan Cawangan
- [ ] S-23: Dashboard Jurulatih
- [ ] S-24: Senarai Jurulatih
- [ ] S-25: Profil Jurulatih
- [ ] S-26: Tambah/Edit Jurulatih
- [ ] PWA setup (next-pwa, manifest, ikon)

### Fasa 2 — 7 Jul 2026 (Kewangan & Laporan)
- [ ] S-12: Rekod Bayaran (PDF resit)
- [ ] S-11: Senarai Resit
- [ ] S-13: Laporan Kehadiran Pelajar
- [ ] S-14, S-15: Kewangan (pendapatan & perbelanjaan)
- [ ] S-16: Makluman WhatsApp
- [ ] S-27: Kehadiran Jurulatih
- [ ] S-28: Bayaran Jurulatih

### Fasa 3 — 14 Jul 2026 (Pelengkap)
- [ ] S-17: Kelas Personal
- [ ] S-18, S-19: Pengurusan Aset
- [ ] S-20: Laporan Kewangan lengkap
- [ ] Setup backup GitHub Actions
- [ ] Ujian PWA pada iOS dan Android
- [ ] Ujian keseluruhan & pelancaran

---

## 10. Keselamatan

| Aspek | Pelaksanaan |
|---|---|
| Pengesahan | Supabase Auth (JWT httpOnly cookie) |
| Kawalan akses data | Row Level Security (RLS) di peringkat DB |
| Kunci rahsia | Vercel Environment Variables (tidak dalam kod) |
| HTTPS | Automatik via Vercel |
| Injection SQL | Tidak mungkin — Supabase JS client guna parameterized queries |
| XSS | Next.js escape HTML secara automatik |
| Backup | GitHub Actions mingguan + manual bulanan |
| Audit trail | Semua rekod ada `created_at` + `direkod_oleh` |

---

*Dokumen ini digunakan bersama: ADR-001 hingga ADR-009, PRD, DRD, dan Screen Inventory.*
