# Indeks Rekod Keputusan Teknikal (ADR) — CFK HUB

Dokumen ini menyenaraikan semua Architectural Decision Records (ADR) untuk **CFK HUB (Chess For Kids)**.

ADR merekodkan keputusan teknikal seni bina — **bagaimana** sistem ini dibina.

**Status:**
- `Diputuskan` — Keputusan telah dibuat dan direkodkan
- `Belum Diputuskan` — Masih perlu perbincangan

---

## Kumpulan 1 — Asas Teknikal

| ID | Soalan | Status |
|---|---|---|
| [ADR-001](ADR-001-stack-frontend.md) | Apakah stack frontend (framework, bahasa)? | Diputuskan |
| [ADR-002](ADR-002-backend-database.md) | Apakah backend & pangkalan data? | Diputuskan |
| [ADR-003](ADR-003-hosting-deployment.md) | Di mana sistem di-host dan bagaimana di-deploy? | Diputuskan |
| [ADR-004](ADR-004-pengesahan-identiti.md) | Bagaimana pengesahan identiti pengguna dilakukan? | Diputuskan |

---

## Kumpulan 2 — Integrasi & Ciri Penting

| ID | Soalan | Status |
|---|---|---|
| [ADR-005](ADR-005-jana-pdf-resit.md) | Bagaimana PDF resit dijana? | Diputuskan |
| [ADR-006](ADR-006-import-google-forms.md) | Bagaimana import Google Forms dilaksanakan? | Diputuskan |
| [ADR-007](ADR-007-pwa-implementation.md) | Bagaimana PWA dilaksanakan? | Diputuskan |

---

## Kumpulan 3 — Data & Keselamatan

| ID | Soalan | Status |
|---|---|---|
| [ADR-008](ADR-008-penyimpanan-pdf.md) | Di mana fail PDF resit disimpan? | Diputuskan |
| [ADR-009](ADR-009-strategi-backup.md) | Bagaimana strategi backup data? | Diputuskan |

---

## Ringkasan Stack Teknikal

| Lapisan | Teknologi | Versi |
|---|---|---|
| Frontend Framework | Next.js | 14+ (App Router) |
| Bahasa | TypeScript | 5+ |
| Styling | Tailwind CSS | 3+ |
| State Management | Zustand + TanStack Query | Terkini |
| Pengesahan Borang | React Hook Form + Zod | Terkini |
| Backend / Database | Supabase (PostgreSQL) | PostgreSQL 15+ |
| Authentication | Supabase Auth | via @supabase/ssr |
| PWA | next-pwa | Terkini |
| PDF Generation | @react-pdf/renderer | Terkini |
| Hosting (Frontend) | Vercel | Hobby (percuma) |
| Hosting (Backend) | Supabase | Free tier |
| Repositori Kod | GitHub | Peribadi |
| CI/CD | Vercel auto-deploy | dari GitHub main branch |
| Backup | GitHub Actions + Manual | Mingguan + Bulanan |

---

*Jumlah ADR: 9 | Diputuskan: 9 | Belum Diputuskan: 0*  
*Tarikh dicipta: 27 Jun 2026*
