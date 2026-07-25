import {
  Cloud, Database, GitBranch, LogIn, CreditCard, Bug, MessageCircle, Type,
  type LucideIcon,
} from 'lucide-react'

export type Tahap = 'Kritikal' | 'Penting' | 'Sokongan'

export type Prosedur = {
  tajuk: string
  langkah: string[]
  amaran?: string
}

export type Perkhidmatan = {
  id: string
  nama: string
  ikon: LucideIcon
  tahap: Tahap
  untukApa: string
  akaun: string
  akaunBelumDirekod?: boolean
  butiran: { label: string; nilai: string }[]
  pautan: { label: string; url: string }[]
  kos: string
  jikaGagal: string
  env: string[]
  prosedur: Prosedur[]
}

export const TAHAP_GAYA: Record<Tahap, { bg: string; teks: string; sempadan: string; nota: string }> = {
  Kritikal: { bg: '#FFF1F2', teks: '#9F1239', sempadan: '#FECDD3', nota: 'App mati kalau ini mati' },
  Penting: { bg: '#FFFBEB', teks: '#92400E', sempadan: '#FDE68A', nota: 'Sebahagian ciri terjejas' },
  Sokongan: { bg: '#F0F9FF', teks: '#075985', sempadan: '#BAE6FD', nota: 'App tetap jalan tanpa ini' },
}

export const PERKHIDMATAN: Perkhidmatan[] = [
  // ─────────────────────────────────────────────────────────────
  {
    id: 'vercel',
    nama: 'Vercel',
    ikon: Cloud,
    tahap: 'Kritikal',
    untukApa: 'Tempat app ini dihoskan (server). Juga simpan semua kunci rahsia (env vars) dan buat deploy automatik setiap kali kod dikemas kini.',
    akaun: 'chessforkids80@gmail.com (username: chessforkids80-3573)',
    butiran: [
      { label: 'Nama projek', nilai: 'cfk-hub' },
      { label: 'Alamat app', nilai: 'https://cfk-hub.vercel.app' },
      { label: 'Server', nilai: 'Singapura (sin1)' },
    ],
    pautan: [
      { label: 'Papan pemuka Vercel', url: 'https://vercel.com/dashboard' },
      { label: 'Buka app', url: 'https://cfk-hub.vercel.app' },
    ],
    kos: 'Pelan Hobby — PERCUMA. Cukup untuk saiz semasa.',
    jikaGagal: 'App langsung tak boleh dibuka oleh sesiapa. Data TIDAK hilang (data ada dalam Supabase).',
    env: ['SEMUA env var disimpan di sini'],
    prosedur: [
      {
        tajuk: 'Semak app hidup atau tidak',
        langkah: [
          'Buka https://cfk-hub.vercel.app dalam browser.',
          'Kalau tak naik: pergi vercel.com → log masuk → klik projek cfk-hub.',
          'Tab Deployments → tengok deploy paling atas. Hijau "Ready" = sihat. Merah "Error" = build gagal, hubungi pembangun.',
        ],
      },
      {
        tajuk: 'Tukar atau tambah kunci rahsia (env var)',
        langkah: [
          'Vercel → projek cfk-hub → Settings → Environment Variables.',
          'Klik Add New (baharu) atau tiga titik ⋯ → Edit (tukar yang sedia ada).',
          'Pilih environment: Production (wajib), Preview & Development (pilihan).',
          'Klik Save.',
          'PENTING: pergi tab Deployments → deploy paling atas → ⋯ → Redeploy. Tanpa langkah ini, kunci baharu TIDAK aktif.',
        ],
        amaran: 'Jangan pernah paste kunci rahsia dalam WhatsApp, e-mel atau chat. Taip terus dalam Vercel.',
      },
      {
        tajuk: 'Undur ke versi sebelum (rollback) bila deploy baharu rosak',
        langkah: [
          'Vercel → projek cfk-hub → Deployments.',
          'Cari deploy LAMA yang statusnya Ready dan anda tahu ia elok.',
          'Klik tiga titik ⋯ di sebelah kanan → Promote to Production.',
          'Sahkan. Dalam ~30 saat app kembali ke versi lama itu.',
        ],
      },
      {
        tajuk: 'Lihat log ralat pelayan',
        langkah: [
          'Vercel → projek cfk-hub → tab Logs (atau Deployments → klik satu deploy → Runtime Logs).',
          'Tapis ikut masa kejadian. Salin mesej ralat dan hantar kepada pembangun.',
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'supabase',
    nama: 'Supabase',
    ikon: Database,
    tahap: 'Kritikal',
    untukApa: 'Pangkalan data (SEMUA data: pelajar, kehadiran, resit, gaji, jadual), sistem log masuk pengguna, dan storan fail (gambar jurulatih, bukti perbelanjaan/pendapatan).',
    akaun: 'Belum direkod',
    akaunBelumDirekod: true,
    butiran: [
      { label: 'ID projek', nilai: 'jfkmfmjsqbwcgzxiyees' },
      { label: 'Bucket storan', nilai: 'gambar-jurulatih, bukti-perbelanjaan, bukti-pendapatan' },
      { label: 'Jumlah jadual', nilai: '21+ jadual (rujukan penuh: supabase/schema.sql)' },
    ],
    pautan: [
      { label: 'Papan pemuka Supabase', url: 'https://supabase.com/dashboard' },
    ],
    kos: 'Pelan Free — PERCUMA (~500MB database, backup 7 hari). Naik taraf ke Pro (~USD25/bulan) bila data dah besar.',
    jikaGagal: 'App boleh dibuka tapi tiada data langsung — semua senarai kosong, tak boleh log masuk, tak boleh simpan apa-apa.',
    env: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    prosedur: [
      {
        tajuk: 'Jalankan fail SQL yang pembangun beri (WAJIB sebelum ciri baharu guna)',
        langkah: [
          'Buka fail SQL yang pembangun beritahu (dalam folder scripts/sql/ di GitHub).',
          'Salin SEMUA isi fail itu.',
          'Supabase → projek CFK → menu kiri SQL Editor → New query.',
          'Paste → klik Run (atau Ctrl+Enter).',
          'Tunggu mesej Success. Kalau ada mesej merah, salin dan hantar pada pembangun — JANGAN teruskan deploy.',
        ],
        amaran: 'Semua fail SQL dalam projek ini selamat dijalankan berulang kali (idempotent). Tetapi jangan run fail supabase/schema.sql — itu rujukan sahaja.',
      },
      {
        tajuk: 'Semak penggunaan supaya tak terlebih had percuma',
        langkah: [
          'Supabase → projek → Settings → Usage.',
          'Tengok Database size dan Storage. Kalau dah dekat 80% had, beritahu pembangun untuk rancang naik taraf Pro.',
          'Buat sebulan sekali (~2 minit).',
        ],
      },
      {
        tajuk: 'Urus siapa boleh log masuk app',
        langkah: [
          'Supabase → Authentication → Users: senarai semua akaun. Boleh padam akaun yang dah tak berkhidmat.',
          'Untuk tambah pengguna baharu, guna app sendiri: Tetapan → Pengguna → Tambah Pengguna (lebih selamat, profil terus betul).',
        ],
        amaran: 'PALING PENTING: Authentication → Sign In / Providers → "Allow new users to sign up" mesti kekal OFF. Kalau ON, sesiapa yang ada akaun Google boleh masuk dan baca data CFK.',
      },
      {
        tajuk: 'Lihat atau muat turun data mentah',
        langkah: [
          'Supabase → Table Editor → pilih jadual (contoh: pelajar, resit, kehadiran).',
          'Butang Export → Download as CSV untuk muat turun.',
        ],
      },
      {
        tajuk: 'Dapatkan sambungan database untuk backup',
        langkah: [
          'Supabase → butang Connect (atas) → tab Session pooler.',
          'Salin URI penuh. Ini yang diletak sebagai secret DATABASE_URL di GitHub.',
        ],
        amaran: 'URI ini mengandungi kata laluan database. Rahsia besar — jangan kongsi.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'github',
    nama: 'GitHub',
    ikon: GitBranch,
    tahap: 'Penting',
    untukApa: 'Simpan kod app (sejarah penuh), jalankan backup database mingguan automatik, dan uji kod setiap kali ada perubahan (CI).',
    akaun: 'makmalbptipoh-jmg (organisasi)',
    butiran: [
      { label: 'Repositori', nilai: 'github.com/makmalbptipoh-jmg/cfk-hub' },
      { label: 'Backup automatik', nilai: 'Setiap Ahad 10:00 pagi (waktu Malaysia)' },
      { label: 'Backup disimpan', nilai: '90 hari dalam Artifacts' },
      { label: 'Secret diperlukan', nilai: 'DATABASE_URL (sudah diset)' },
    ],
    pautan: [
      { label: 'Repositori kod', url: 'https://github.com/makmalbptipoh-jmg/cfk-hub' },
      { label: 'Backup & Actions', url: 'https://github.com/makmalbptipoh-jmg/cfk-hub/actions' },
    ],
    kos: 'PERCUMA untuk repositori peribadi.',
    jikaGagal: 'App yang sedang jalan TIDAK terjejas. Tetapi backup mingguan berhenti dan pembangun tak boleh deploy versi baharu.',
    env: [],
    prosedur: [
      {
        tajuk: 'Semak backup mingguan masih berjaya (buat sebulan sekali)',
        langkah: [
          'GitHub → repo cfk-hub → tab Actions.',
          'Klik "Backup Database Mingguan" di senarai kiri.',
          'Tengok run paling atas. Tanda ✅ hijau = berjaya. ❌ merah = gagal, beritahu pembangun.',
        ],
      },
      {
        tajuk: 'Buat backup manual (bila-bila masa)',
        langkah: [
          'GitHub → repo cfk-hub → Actions → "Backup Database Mingguan".',
          'Klik butang Run workflow (kanan) → Run workflow.',
          'Tunggu ~2 minit sampai jadi ✅ hijau.',
          'Klik run itu → skrol bawah → bahagian Artifacts → klik untuk muat turun fail .sql.',
        ],
      },
      {
        tajuk: 'Simpan backup luar talian untuk rekod LHDN (7 tahun)',
        langkah: [
          'Ikut langkah muat turun di atas.',
          'Simpan fail .sql dalam Google Drive / hard disk luar, namakan ikut tarikh.',
          'Buat sekurang-kurangnya sekali sebulan — Artifacts GitHub hanya simpan 90 hari.',
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'google',
    nama: 'Google Cloud Console',
    ikon: LogIn,
    tahap: 'Penting',
    untukApa: 'Membolehkan butang "Log Masuk dengan Google" di halaman login — pengguna pilih e-mel terus masuk, tak perlu ingat kata laluan.',
    akaun: 'Belum direkod',
    akaunBelumDirekod: true,
    butiran: [
      { label: 'Nama projek', nilai: 'CFK HUB' },
      { label: 'Jenis', nilai: 'OAuth 2.0 Client ID (Web application)' },
      { label: 'Redirect URI', nilai: 'URL callback Supabase (jangan ubah)' },
      { label: 'Kebenaran diminta', nilai: 'Asas sahaja — nama, e-mel, gambar profil' },
    ],
    pautan: [
      { label: 'Google Cloud Console', url: 'https://console.cloud.google.com' },
      { label: 'Halaman kelayakan (Credentials)', url: 'https://console.cloud.google.com/apis/credentials' },
    ],
    kos: 'PERCUMA.',
    jikaGagal: 'Butang "Log Masuk dengan Google" gagal. Pengguna MASIH boleh masuk guna e-mel + kata laluan (toggle di halaman login).',
    env: [],
    prosedur: [
      {
        tajuk: 'Kalau butang Google tiba-tiba gagal',
        langkah: [
          'Cuba log masuk guna kata laluan dahulu (toggle "Log masuk dengan kata laluan") — pastikan app sendiri sihat.',
          'Google Cloud Console → APIs & Services → Credentials → klik OAuth client CFK HUB.',
          'Semak Authorized redirect URIs masih ada URL Supabase (bentuk https://<id-projek>.supabase.co/auth/v1/callback).',
          'Kalau masih gagal, hantar mesej ralat pada pembangun.',
        ],
      },
      {
        tajuk: 'Kalau app tukar alamat (domain baharu)',
        langkah: [
          'Google Cloud Console → Credentials → OAuth client → tambah alamat baharu dalam Authorized JavaScript origins.',
          'Supabase → Authentication → URL Configuration → kemas kini Site URL + Redirect URLs.',
          'Vercel → Settings → Environment Variables → kemas kini NEXT_PUBLIC_APP_URL → Redeploy.',
        ],
        amaran: 'Ketiga-tiga tempat mesti dikemas kini serentak, kalau tidak log masuk akan gagal.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'toyyibpay',
    nama: 'ToyyibPay',
    ikon: CreditCard,
    tahap: 'Sokongan',
    untukApa: 'Bayaran online. Admin jana link bayaran → hantar WhatsApp kepada ibu bapa → ibu bapa bayar FPX/DuitNow → resit CFK auto-jana dalam sistem.',
    akaun: 'Belum direkod',
    akaunBelumDirekod: true,
    butiran: [
      { label: 'Mod semasa', nilai: 'Ikut env TOYYIBPAY_MODE (sandbox = ujian, production = duit sebenar)' },
      { label: 'Alamat ujian', nilai: 'dev.toyyibpay.com' },
      { label: 'Alamat sebenar', nilai: 'toyyibpay.com' },
      { label: 'Kategori bil', nilai: 'Yuran CFK' },
    ],
    pautan: [
      { label: 'ToyyibPay (sebenar)', url: 'https://toyyibpay.com' },
      { label: 'ToyyibPay Sandbox (ujian)', url: 'https://dev.toyyibpay.com' },
      { label: 'Senarai permintaan bayaran dalam app', url: '/bayaran/permintaan' },
    ],
    kos: 'RM1.00 sekali transaksi FPX (ditanggung CFK). Tiada yuran bulanan.',
    jikaGagal: 'Link bayaran online tak boleh dijana. Kutipan tunai/transfer manual TIDAK terjejas — rekod macam biasa di Rekod Bayaran.',
    env: ['TOYYIBPAY_SECRET_KEY', 'TOYYIBPAY_CATEGORY_CODE', 'TOYYIBPAY_MODE'],
    prosedur: [
      {
        tajuk: 'Semak duit sudah masuk atau belum',
        langkah: [
          'Log masuk toyyibpay.com → menu Transaction / Bill.',
          'Banding dengan app: Bayaran → Permintaan Online.',
          'Kalau ToyyibPay tunjuk sudah bayar tapi app belum, klik butang Semak Status pada baris itu dalam app — resit akan dijana.',
        ],
      },
      {
        tajuk: 'Tukar dari mod ujian (sandbox) ke duit sebenar (production)',
        langkah: [
          'Daftar / log masuk akaun sebenar di toyyibpay.com (bukan dev.toyyibpay.com).',
          'User Profile → salin Secret Key.',
          'Menu Category → cipta kategori "Yuran CFK" → salin Category Code.',
          'Vercel → Settings → Environment Variables → kemas kini TOYYIBPAY_SECRET_KEY, TOYYIBPAY_CATEGORY_CODE, dan tukar TOYYIBPAY_MODE kepada production.',
          'Deployments → ⋯ → Redeploy.',
          'Uji sekali dengan jumlah kecil (contoh RM1) dan sahkan resit auto-jana dalam app.',
        ],
        amaran: 'Kunci sandbox dan kunci production TIDAK sama. Kalau tersilap campur, bayaran akan gagal.',
      },
      {
        tajuk: 'Ibu bapa kata dah bayar tapi tiada resit',
        langkah: [
          'App → Bayaran → Permintaan Online → cari nama pelajar.',
          'Klik Semak Status. Sistem akan tanya ToyyibPay semula dan jana resit kalau memang sudah dibayar.',
          'Kalau masih Menunggu, minta bukti/rujukan transaksi dari ibu bapa dan semak di papan pemuka ToyyibPay.',
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'sentry',
    nama: 'Sentry',
    ikon: Bug,
    tahap: 'Sokongan',
    untukApa: 'Pemantau ralat. Bila app tersasar (error) pada mana-mana pengguna, Sentry rekod butiran teknikal dan hantar e-mel — supaya masalah dijumpai sebelum pengguna komplen.',
    akaun: 'Belum direkod',
    akaunBelumDirekod: true,
    butiran: [
      { label: 'Jenis projek', nilai: 'Next.js' },
      { label: 'Status', nilai: 'Aktif (DSN diset di Vercel)' },
    ],
    pautan: [
      { label: 'Sentry', url: 'https://sentry.io' },
    ],
    kos: 'Pelan Developer — PERCUMA.',
    jikaGagal: 'App berjalan macam biasa. Cuma kita hilang amaran awal bila ada ralat.',
    env: ['NEXT_PUBLIC_SENTRY_DSN'],
    prosedur: [
      {
        tajuk: 'Bila dapat e-mel amaran dari Sentry',
        langkah: [
          'Baca tajuk e-mel — ia beritahu skrin mana yang bermasalah.',
          'Forward e-mel itu kepada pembangun. Anda tak perlu buat apa-apa teknikal.',
          'Kalau ramai pengguna terjejas (app tak boleh guna), beritahu segera.',
        ],
      },
      {
        tajuk: 'Semak sendiri senarai ralat',
        langkah: [
          'Log masuk sentry.io → pilih projek CFK.',
          'Menu Issues → senarai ralat, disusun ikut kekerapan.',
          'Klik satu isu → salin pautan → hantar pada pembangun.',
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'whatsapp',
    nama: 'WhatsApp',
    ikon: MessageCircle,
    tahap: 'Sokongan',
    untukApa: 'Butang WhatsApp dalam app (peringatan tunggakan, link bayaran, pakej personal habis) hanya BUKA WhatsApp anda dengan mesej sudah siap ditaip. Anda yang tekan hantar.',
    akaun: 'Tiada — guna WhatsApp anda sendiri',
    butiran: [
      { label: 'Jenis', nilai: 'Pautan wa.me (tiada API, tiada kos, tiada pendaftaran)' },
      { label: 'Hantar automatik?', nilai: 'TIDAK — mesej perlu ditekan hantar secara manual' },
    ],
    pautan: [
      { label: 'WhatsApp Web', url: 'https://web.whatsapp.com' },
    ],
    kos: 'PERCUMA.',
    jikaGagal: 'Tiada kesan pada data. Salin nombor dan mesej secara manual.',
    env: [],
    prosedur: [
      {
        tajuk: 'Butang WhatsApp tak buka apa-apa',
        langkah: [
          'Pastikan WhatsApp Desktop dipasang, atau log masuk web.whatsapp.com dahulu.',
          'Semak nombor telefon pelajar/ibu bapa ada dalam profil dan bermula 60 (contoh 60123456789), bukan 0123456789.',
          'Betulkan di Pelajar → profil → Edit.',
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'google-fonts',
    nama: 'Google Fonts',
    ikon: Type,
    tahap: 'Sokongan',
    untukApa: 'Membekalkan font paparan app (Plus Jakarta Sans).',
    akaun: 'Tiada — perkhidmatan terbuka',
    butiran: [
      { label: 'Font', nilai: 'Plus Jakarta Sans' },
    ],
    pautan: [
      { label: 'Google Fonts', url: 'https://fonts.google.com' },
    ],
    kos: 'PERCUMA.',
    jikaGagal: 'App tetap berfungsi penuh, cuma tulisan bertukar kepada font lalai komputer.',
    env: [],
    prosedur: [],
  },
]

// ─────────────────────────────────────────────────────────────
export const CHECKLIST: { tempoh: string; nota: string; item: string[] }[] = [
  {
    tempoh: 'Automatik — anda tak perlu buat apa-apa',
    nota: 'Berjalan sendiri',
    item: [
      'Hosting & server (Vercel) — tiada server untuk dijaga',
      'Pangkalan data (Supabase) — dikendali penuh oleh Supabase',
      'Backup database — setiap Ahad 10:00 pagi',
      'Pemantauan ralat (Sentry) — e-mel dihantar bila ada masalah',
      'Deploy & ujian automatik bila kod dikemas kini',
    ],
  },
  {
    tempoh: 'Bila dapat e-mel Sentry',
    nota: 'Ikut kejadian',
    item: [
      'Baca e-mel dan forward kepada pembangun',
      'Beritahu segera kalau ramai pengguna tak boleh guna app',
    ],
  },
  {
    tempoh: 'Sebulan sekali (~5 minit)',
    nota: 'Semakan ringan',
    item: [
      'GitHub → Actions → "Backup Database Mingguan" → pastikan run terkini ✅ hijau',
      'Muat turun 1 fail backup dan simpan luar talian (rekod LHDN 7 tahun)',
      'Supabase → Settings → Usage → pastikan belum hampir had percuma',
      'Supabase → Authentication → Providers → sahkan "Allow new users to sign up" masih OFF',
    ],
  },
  {
    tempoh: 'Beberapa bulan sekali',
    nota: 'Kebersihan',
    item: [
      'Minta pembangun update library (tampung keselamatan)',
      'Semak senarai pengguna app — buang akaun yang dah tak berkhidmat',
      'Semak sama ada perlu naik taraf Supabase Pro (kalau data dah besar)',
    ],
  },
]

// ─────────────────────────────────────────────────────────────
export const KECEMASAN: Prosedur[] = [
  {
    tajuk: 'App tak boleh dibuka langsung',
    langkah: [
      'Cuba buka di telefon guna data mudah alih — untuk pastikan bukan masalah internet pejabat.',
      'Buka vercel.com → projek cfk-hub → Deployments. Kalau deploy terkini merah "Error", app sedang rosak.',
      'Penyelesaian pantas: cari deploy lama yang Ready → ⋯ → Promote to Production (rollback).',
      'Beritahu pembangun dengan screenshot skrin ralat.',
    ],
  },
  {
    tajuk: 'App buka tapi semua data kosong / tak boleh log masuk',
    langkah: [
      'Ini biasanya masalah Supabase, bukan app.',
      'Buka status.supabase.com — semak ada gangguan global atau tidak.',
      'Supabase → papan pemuka projek → pastikan projek tidak Paused.',
      'Kalau Paused, klik Restore/Resume dan tunggu beberapa minit.',
    ],
  },
  {
    tajuk: 'Data penting terpadam',
    langkah: [
      'JANGAN buat apa-apa perubahan lagi dalam app — elak tulis atas data.',
      'Beritahu pembangun SEGERA (masa penting).',
      'Backup mingguan ada di GitHub → Actions → Artifacts (90 hari). Supabase Free pula simpan backup 7 hari.',
      'Pembangun akan pulihkan dari backup terdekat.',
    ],
  },
  {
    tajuk: 'Syak akaun dimasuki orang luar',
    langkah: [
      'Supabase → Authentication → Users → padam akaun yang tak dikenali.',
      'Supabase → Authentication → Providers → sahkan "Allow new users to sign up" = OFF.',
      'Tukar kata laluan akaun Google/Vercel/Supabase anda.',
      'App → Notifikasi → tab Log Aktiviti — semak siapa buat apa dan bila.',
      'Beritahu pembangun untuk pusing (rotate) kunci rahsia di Vercel.',
    ],
  },
]

// ─────────────────────────────────────────────────────────────
export const ENV_VARS: { nama: string; untuk: string; rahsia: boolean }[] = [
  { nama: 'NEXT_PUBLIC_SUPABASE_URL', untuk: 'Alamat pangkalan data Supabase', rahsia: false },
  { nama: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', untuk: 'Kunci awam Supabase (dilindungi RLS)', rahsia: false },
  { nama: 'SUPABASE_SERVICE_ROLE_KEY', untuk: 'Kunci penuh Supabase — pintas semua kawalan', rahsia: true },
  { nama: 'NEXT_PUBLIC_APP_URL', untuk: 'Alamat app (untuk link bayaran & redirect)', rahsia: false },
  { nama: 'NEXT_PUBLIC_SENTRY_DSN', untuk: 'Alamat hantar laporan ralat ke Sentry', rahsia: false },
  { nama: 'TOYYIBPAY_SECRET_KEY', untuk: 'Kunci akaun ToyyibPay', rahsia: true },
  { nama: 'TOYYIBPAY_CATEGORY_CODE', untuk: 'Kod kategori bil "Yuran CFK"', rahsia: false },
  { nama: 'TOYYIBPAY_MODE', untuk: 'sandbox (ujian) atau production (duit sebenar)', rahsia: false },
]
