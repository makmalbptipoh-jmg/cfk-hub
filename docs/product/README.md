# Dokumen Produk — CFK HUB

Folder ini mengandungi dokumen produk yang disediakan pada **24 Oktober 2026**, berdasarkan kod sebenar dalam repo (bukan rancangan asal sahaja). Dokumen perniagaan dan keputusan reka bentuk terdahulu kekal di `docs/business/` dan `docs/design/`. Dokumen di sini merujuk kepadanya, bukan menyalin semula.

## Semakan relevan: 10 jenis dokumen

CFK HUB ialah **sistem operasi dalaman** untuk satu akademi catur (Admin + Jurulatih, rujuk DR-003, DR-004). Ia tidak dijual dan tidak dimuat turun oleh orang awam. Itu yang menentukan dokumen mana yang berguna.

| # | Dokumen | Relevan? | Tindakan |
|---|---|---|---|
| 1 | Market & Opportunity Research | **Tidak** | Tiada pasaran untuk dibuktikan. Masalah sebenar (rekod manual, resit, yuran tertunggak) sudah direkod dalam DR-002 dan BRD §1.2. Hanya perlu jika CFK HUB mahu dijual kepada akademi lain. |
| 2 | Product Roadmap | **Ya** | [01-product-roadmap.md](01-product-roadmap.md) |
| 3 | Design System | **Ya** | [02-design-system.md](02-design-system.md): kumpulkan DD-001 hingga DD-010 dan token `globals.css` dalam satu dokumen |
| 4 | Art Direction | **Sebahagian** | Digabungkan sebagai §8 dalam Design System. Sistem dalaman tidak perlu dokumen art direction berasingan. |
| 5 | PRD | **Ya (versi as-built)** | [03-prd-as-built.md](03-prd-as-built.md). `implementation-plan.md` ialah spec pra-binaan, manakala dokumen ini merekod apa yang sebenarnya wujud. |
| 6 | Content Spec | **Ya** | [04-content-spec.md](04-content-spec.md): silibus, Little Pawn, gred, templat WhatsApp, yuran |
| 7 | Onboarding & Activation Plan | **Ya (dalaman)** | [05-onboarding-activation.md](05-onboarding-activation.md): untuk jurulatih/admin baharu, bukan pelanggan |
| 8 | UI Kit / Component Library | **Ya** | [06-ui-kit-component-library.md](06-ui-kit-component-library.md): dijejak ikut apa yang betul-betul dibina |
| 9 | Growth & Distribution Strategy | **Tidak** | Sistem dalaman (DR-004). Pengguna dicipta oleh Admin, bukan "ditemui". |
| 10 | QA & Testing Plan | **Ya, paling mendesak** | [07-qa-testing-plan.md](07-qa-testing-plan.md). Banyak modul berstatus "BELUM diuji browser". |
