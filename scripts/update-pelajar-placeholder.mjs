// Kemaskini maklumat ibu bapa/telefon untuk pelajar placeholder.
// 1. Isi scripts/data/pelajar-placeholder.csv (baris yang masih '-' akan dilangkau)
// 2. Jalankan: node scripts/update-pelajar-placeholder.mjs          (pratonton sahaja)
//              node scripts/update-pelajar-placeholder.mjs --commit (tulis ke DB)
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const COMMIT = process.argv.includes('--commit');

const baris = readFileSync('scripts/data/pelajar-placeholder.csv', 'utf8')
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((l) => {
    // nama boleh mengandungi koma? Tidak — format: nama,ibu_bapa,telefon (split dari kanan)
    const p2 = l.lastIndexOf(',');
    const p1 = l.lastIndexOf(',', p2 - 1);
    return {
      nama_penuh: l.slice(0, p1).trim(),
      nama_ibu_bapa: l.slice(p1 + 1, p2).trim(),
      no_telefon: l.slice(p2 + 1).trim(),
    };
  });

let dikemaskini = 0, dilangkau = 0, gagal = 0;
for (const b of baris) {
  if (b.nama_ibu_bapa === '-' && b.no_telefon === '-') { dilangkau++; continue; }
  const patch = {};
  if (b.nama_ibu_bapa !== '-') patch.nama_ibu_bapa = b.nama_ibu_bapa;
  if (b.no_telefon !== '-') patch.no_telefon = b.no_telefon;

  if (!COMMIT) {
    console.log(`[PRATONTON] ${b.nama_penuh} ->`, patch);
    dikemaskini++;
    continue;
  }
  const res = await fetch(
    `${URL_}/rest/v1/pelajar?nama_penuh=eq.${encodeURIComponent(b.nama_penuh)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(patch),
    }
  );
  const data = await res.json();
  if (!res.ok || !Array.isArray(data) || data.length === 0) {
    console.error(`GAGAL: ${b.nama_penuh}`, res.status, JSON.stringify(data).slice(0, 200));
    gagal++;
  } else {
    console.log(`OK: ${b.nama_penuh}`);
    dikemaskini++;
  }
}
console.log(`\n${COMMIT ? 'Dikemaskini' : 'Akan dikemaskini'}: ${dikemaskini} | Dilangkau (masih '-'): ${dilangkau} | Gagal: ${gagal}`);
if (!COMMIT && dikemaskini > 0) console.log("Jalankan semula dengan --commit untuk tulis ke DB.");
