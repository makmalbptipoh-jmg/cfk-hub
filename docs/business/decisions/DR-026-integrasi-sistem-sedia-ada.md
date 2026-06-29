# DR-026: Adakah sistem perlu diintegrasikan dengan mana-mana sistem sedia ada?

## Status
Diputuskan

## Soalan
Adakah CFK HUB perlu disambungkan atau diintegrasikan dengan sistem lain yang sedang digunakan (Google Sheets, sistem kewangan, dll.)?

## Konteks
Integrasi dengan sistem sedia ada boleh mengurangkan kerja pendua tetapi menambah kerumitan teknikal dan risiko kebergantungan pada sistem luar.

## Keputusan
**Ya** — satu integrasi diperlukan: **Google Forms → CFK HUB** untuk pendaftaran pelajar baharu.

Apabila ibu bapa mengisi borang pendaftaran dalam Google Forms, maklumat pelajar ditarik secara automatik ke dalam sistem CFK HUB sebagai profil pelajar baharu.

## Sebab
Ibu bapa sudah biasa mengisi Google Forms. Menggunakan Google Forms sebagai borang pendaftaran mengelakkan keperluan membangunkan portal ibu bapa (DR-014) sambil tetap mengautomatikkan aliran data masuk ke sistem.

## Kesan
- Google Forms perlu direka bentuk dengan medan yang sepadan dengan profil pelajar dalam sistem (nama, nombor telefon ibu bapa, cawangan, dll.)
- Integrasi boleh dibuat melalui salah satu cara berikut:
  - **Google Apps Script** — skrip automatik yang hantar data ke sistem apabila borang diisi (percuma)
  - **Google Sheets + webhook** — respons Forms disimpan dalam Sheets, sistem tarik data dari sana
  - **Zapier/Make** — automasi tanpa kod (mungkin ada kos)
- Data yang ditarik perlu disemak oleh Admin sebelum diaktifkan sebagai profil pelajar rasmi (cadangan)
- Ini adalah satu-satunya integrasi luar dalam sistem
