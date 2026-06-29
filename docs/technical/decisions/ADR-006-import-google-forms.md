# ADR-006: Bagaimana import Google Forms dilaksanakan secara teknikal?

## Status
Diputuskan (asal: DR-026, PD-021)

## Konteks
CFK menggunakan Google Forms untuk pendaftaran pelajar baharu. Data perlu masuk ke dalam CFK HUB. Keputusan perniagaan (DR-026, PD-021): Google Forms adalah sumber utama, manual entry sebagai sandaran.

## Keputusan
**Google Apps Script Webhook → Supabase REST API**

Apabila borang Google Forms diisi, Google Apps Script secara automatik hantar data ke CFK HUB.

## Butiran Teknikal

### Aliran Data
```
Ibu bapa isi Google Form (pautan: bit.ly/CFK2026)
         ↓
Google Forms simpan respons dalam Google Sheets
         ↓
Google Apps Script trigger (onFormSubmit)
         ↓
Apps Script format data + hantar ke Supabase via HTTP POST
         ↓
Supabase simpan dalam jadual `import_antrian`
         ↓
Admin semak & sahkan import dalam CFK HUB (M-05)
         ↓
Data dipindahkan ke jadual `pelajar`
```

### Kenapa Ada Jadual `import_antrian`?
Data dari Google Forms TIDAK terus masuk ke jadual `pelajar`. Ia perlu disemak oleh Admin dahulu untuk:
- Kesan pendua (nama + telefon yang sama sudah wujud)
- Semak maklumat tidak lengkap
- Sahkan cawangan yang dipilih

### Kod Google Apps Script
```javascript
function onFormSubmit(e) {
  const responses = e.values;
  const payload = {
    nama_penuh: responses[1],
    tarikh_lahir: responses[2],
    nama_ibu_bapa: responses[3],
    no_telefon: responses[4],
    cawangan_pilihan: responses[5],
    tarikh_submit: new Date().toISOString()
  };

  const url = 'https://[project].supabase.co/rest/v1/import_antrian';
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'apikey': PropertiesService.getScriptProperties().getProperty('SUPABASE_KEY'),
      'Authorization': 'Bearer ' + PropertiesService.getScriptProperties().getProperty('SUPABASE_KEY')
    },
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, options);
}
```

### Halaman Import dalam CFK HUB (S-09)
- Admin pergi ke halaman Import
- Senarai rekod dalam `import_antrian` dipaparkan
- Rekod pendua ditandakan merah (semak nama + telefon)
- Admin boleh nyahtanda rekod yang tidak mahu diimport
- Klik [Sahkan Import] → M-05 (modal) → data pindah ke jadual `pelajar`

### Pendaftaran Manual (Sandaran — PD-021)
Jika Google Forms tidak tersedia atau untuk kes khas:
- Admin guna borang S-05 (Tambah Pelajar Manual) dalam CFK HUB
- Sistem semak pendua sebelum simpan (nama + telefon)

## Sebab
1. Google Apps Script percuma dan berjalan di Google's server — tiada kos
2. Tidak perlu pengguna buat apa-apa — automatik apabila borang diisi
3. Lapisan semakan Admin mencegah data salah atau pendua masuk ke sistem
4. Selaras dengan keputusan DR-026 dan PD-021

## Kesan
- Jadual `import_antrian` perlu dicipta dalam Supabase
- Google Apps Script perlu dikonfigurasi sekali oleh Admin
- Kunci Supabase Service Role disimpan dalam Google Apps Script Properties (bukan anon key)
- Pelaksanaan: Fasa 1 (perlu untuk operasi asas CFK)
