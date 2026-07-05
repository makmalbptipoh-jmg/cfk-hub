import { createClient } from '@/lib/supabase/server'
import { akhirBulan } from '@/lib/utils'
import { TabelJurulatih } from './_components/TabelJurulatih'

export const dynamic = 'force-dynamic'

export default async function JurulatihPage() {
  const supabase = await createClient()

  const sekarang = new Date()
  const bulanIni = sekarang.toLocaleString('ms-MY', { month: 'long' })
  const tahunIni = sekarang.getFullYear()
  const mulaB = `${tahunIni}-${String(sekarang.getMonth() + 1).padStart(2, '0')}-01`
  const akhirB = akhirBulan(tahunIni, sekarang.getMonth() + 1)

  const [{ data: raw }, { data: cawangan }, { data: bayaran }, { data: hadir }] = await Promise.all([
    supabase
      .from('jurulatih')
      .select('id, nama_penuh, no_telefon, kadar_bayaran, tarikh_mula, status, cawangan_ids')
      .order('nama_penuh'),
    supabase.from('cawangan').select('id, nama'),
    supabase.from('bayaran_jurulatih').select('jurulatih_id, jumlah, status, bulan_bayaran, tahun_bayaran'),
    supabase.from('kehadiran_jurulatih').select('jurulatih_id, tarikh').eq('status', 'Hadir'),
  ])

  const peta: Record<string, string> = {}
  for (const c of cawangan ?? []) peta[c.id] = c.nama

  // Agregat per jurulatih: gaji dibayar, sesi hadir bulan ini, point (1 point / sesi hadir)
  const gajiPerJurulatih: Record<string, number> = {}
  for (const b of bayaran ?? []) {
    if (b.status === 'Sudah Bayar') {
      gajiPerJurulatih[b.jurulatih_id] = (gajiPerJurulatih[b.jurulatih_id] ?? 0) + b.jumlah
    }
  }
  const pointPerJurulatih: Record<string, number> = {}
  const sesiBulanIniPerJurulatih: Record<string, number> = {}
  for (const k of hadir ?? []) {
    pointPerJurulatih[k.jurulatih_id] = (pointPerJurulatih[k.jurulatih_id] ?? 0) + 1
    if (k.tarikh >= mulaB && k.tarikh <= akhirB) {
      sesiBulanIniPerJurulatih[k.jurulatih_id] = (sesiBulanIniPerJurulatih[k.jurulatih_id] ?? 0) + 1
    }
  }

  const jurulatih = (raw ?? []).map((j: any) => ({
    id: j.id,
    nama_penuh: j.nama_penuh,
    no_telefon: j.no_telefon,
    kadar_bayaran: j.kadar_bayaran,
    tarikh_mula: j.tarikh_mula,
    status: j.status,
    cawangan_nama: (j.cawangan_ids ?? []).map((id: string) => peta[id] ?? '').filter(Boolean).join(', '),
    gaji_dibayar: gajiPerJurulatih[j.id] ?? 0,
    sesi_bulan_ini: sesiBulanIniPerJurulatih[j.id] ?? 0,
    point: pointPerJurulatih[j.id] ?? 0,
  }))

  // Statistik dashboard keseluruhan
  const totalGajiDibayar = Object.values(gajiPerJurulatih).reduce((s, n) => s + n, 0)
  const gajiBulanIni = (bayaran ?? [])
    .filter((b) => b.status === 'Sudah Bayar' && b.bulan_bayaran === bulanIni && b.tahun_bayaran === tahunIni)
    .reduce((s, b) => s + b.jumlah, 0)
  const sesiHadirBulanIni = Object.values(sesiBulanIniPerJurulatih).reduce((s, n) => s + n, 0)

  return (
    <TabelJurulatih
      jurulatih={jurulatih}
      stat={{
        totalGajiDibayar,
        gajiBulanIni,
        sesiHadirBulanIni,
        namaBulan: `${bulanIni} ${tahunIni}`,
      }}
    />
  )
}
