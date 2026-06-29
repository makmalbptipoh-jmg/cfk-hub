# ADR-007: Bagaimana PWA dilaksanakan?

## Status
Diputuskan

## Konteks
CFK HUB perlu berfungsi sebagai Progressive Web App (PWA) untuk Jurulatih — boleh dipasang pada skrin utama telefon dan berfungsi walaupun sambungan internet lemah.

## Keputusan
**next-pwa** — plugin Next.js untuk PWA

## Butiran Teknikal

### Pasang & Konfigurasi
```bash
npm install next-pwa
```

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // konfigurasi Next.js lain
});
```

### Web App Manifest (`/public/manifest.json`)
```json
{
  "name": "CFK HUB",
  "short_name": "CFK HUB",
  "description": "Sistem Pengurusan Chess For Kids",
  "start_url": "/kehadiran",
  "display": "standalone",
  "background_color": "#1E293B",
  "theme_color": "#1E293B",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Fungsi PWA yang Disokong

| Fungsi | Disokong? | Nota |
|---|---|---|
| Pasang pada skrin utama (Add to Home Screen) | ✅ | iOS & Android |
| Berjalan dalam mod fullscreen | ✅ | Tiada bar pelayar |
| Cache halaman statik (offline) | ✅ | Via service worker |
| Kehadiran offline (simpan tempatan) | ⚠️ | Fasa 2 — perlu IndexedDB |
| Notifikasi push | ❌ | Tidak diperlukan |
| Background sync | ⚠️ | Fasa 2 jika diperlukan |

### Strategi Cache
- **Halaman utama:** Stale-while-revalidate
- **Aset statik (gambar, CSS, JS):** Cache-first
- **API calls (Supabase):** Network-first (data mesti segar)

### Paparan Berbeza: Admin vs Jurulatih
```
cfkhub.vercel.app/login  →  Log masuk

Jika Admin (is_admin=true):
  → Paparan desktop penuh (sidebar, jadual)
  → PWA tidak dioptimumkan untuk Admin

Jika Jurulatih (is_admin=false):
  → Paparan mobile (bottom tab bar)
  → Dioptimumkan untuk PWA
  → start_url: /kehadiran
```

## Sebab
1. `next-pwa` adalah plugin paling popular untuk Next.js
2. Zero konfigurasi lanjutan — berjalan dengan konfigurasi minimum
3. Automatik jana service worker dari Next.js build
4. Sesuai dengan keputusan DD-005 (navigasi bottom tab bar untuk Jurulatih)

## Kesan
- Ikon PWA perlu disediakan (192×192 dan 512×512 pixel)
- Jurulatih perlu diberi arahan cara pasang PWA pada telefon mereka
- Ujian perlu dilakukan pada iOS (Safari) dan Android (Chrome)
