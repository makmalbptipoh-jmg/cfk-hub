import { createClient } from '@/lib/supabase/server'
import { akhirBulan, bulanTempatan, NAMA_BULAN } from '@/lib/utils'
import { tapisSesiDibatalkan, SELECT_SLOT_GAJI, type SlotUntukGaji } from '@/lib/gajiSesi'
import { TabelJurulatih } from './_components/TabelJurulatih'

export const dynamic = 'force-dynamic'

export default async function JurulatihPage() {
  const supabase = await createClient()

  // Bulan semasa waktu Malaysia — bukan zon pelayan
  const [tahunIni, bulanNum] = bulanTempatan().split('-').map(Number)
  const bulanIni = NAMA_BULAN[bulanNum - 1]
  const mulaB = `${tahunIni}-${String(bulanNum).padStart(2, '0')}-01`
  const akhirB = akhirBulan(tahunIni, bulanNum)

  const [{ data: raw }, { data: cawangan }, { data: bayaran }, { data: hadir }, { data: slotGaji }, { data: batalBulan }] = await Promise.all([
    supabase
      .from('jurulatih')
      .select('id, nama_penuh, no_telefon, kadar_bayaran, tarikh_mula, status, cawangan_ids')
      .order('nama_penuh'),
    supabase.from('cawangan').select('id, nama'),
    supabase.from('bayaran_jurulatih').select('jurulatih_id, jumlah, status, bulan_bayaran, tahun_bayaran, tarikh_bayar, created_at'),
    supabase.from('kehadiran_jurulatih').select('jurulatih_id, tarikh, cawangan_id, jenis_kelas').eq('status', 'Hadir'),
    supabase.from('jadual_slot').select(SELECT_SLOT_GAJI),
    supabase.from('jadual_slot_batal').select('slot_id, tarikh').gte('tarikh', mulaB).lte('tarikh', akhirB),
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
  // Bayaran 'Sudah Bayar' terkini per jurulatih (ikut tarikh_bayar, fallback created_at)
  type BayaranTerkini = { bulan_bayaran: string; tahun_bayaran: number; jumlah: number; tarikh_bayar: string | null }
  const terkiniPerJurulatih: Record<string, BayaranTerkini & { kunci: string }> = {}
  for (const b of bayaran ?? []) {
    if (b.status !== 'Sudah Bayar') continue
    const kunci = b.tarikh_bayar ?? b.created_at ?? ''
    const sedia = terkiniPerJurulatih[b.jurulatih_id]
    if (!sedia || kunci > sedia.kunci) {
      terkiniPerJurulatih[b.jurulatih_id] = {
        bulan_bayaran: b.bulan_bayaran,
        tahun_bayaran: b.tahun_bayaran,
        jumlah: b.jumlah,
        tarikh_bayar: b.tarikh_bayar,
        kunci,
      }
    }
  }

  const pointPerJurulatih: Record<string, number> = {}
  for (const k of hadir ?? []) {
    pointPerJurulatih[k.jurulatih_id] = (pointPerJurulatih[k.jurulatih_id] ?? 0) + 1
  }
  // Sesi bulan ini untuk kiraan gaji — sesi pada kelas DIBATALKAN tidak dikira
  const hadirBulanIni = (hadir ?? []).filter((k) => k.tarikh >= mulaB && k.tarikh <= akhirB)
  const { sah: hadirBulanIniSah } = tapisSesiDibatalkan(hadirBulanIni, (slotGaji ?? []) as SlotUntukGaji[], batalBulan ?? [])
  const sesiBulanIniPerJurulatih: Record<string, number> = {}
  for (const k of hadirBulanIniSah) {
    sesiBulanIniPerJurulatih[k.jurulatih_id] = (sesiBulanIniPerJurulatih[k.jurulatih_id] ?? 0) + 1
  }

  // Dibayar bulan ini per jurulatih (untuk kiraan gaji belum bayar)
  const dibayarBulanIniPerJurulatih: Record<string, number> = {}
  for (const b of bayaran ?? []) {
    if (b.status === 'Sudah Bayar' && b.bulan_bayaran === bulanIni && b.tahun_bayaran === tahunIni) {
      dibayarBulanIniPerJurulatih[b.jurulatih_id] = (dibayarBulanIniPerJurulatih[b.jurulatih_id] ?? 0) + b.jumlah
    }
  }

  const jurulatih = (raw ?? []).map((j: any) => {
    const sesiBulanIni = sesiBulanIniPerJurulatih[j.id] ?? 0
    return {
      id: j.id,
      nama_penuh: j.nama_penuh,
      no_telefon: j.no_telefon,
      kadar_bayaran: j.kadar_bayaran,
      tarikh_mula: j.tarikh_mula,
      status: j.status,
      cawangan_nama: (j.cawangan_ids ?? []).map((id: string) => peta[id] ?? '').filter(Boolean).join(', '),
      gaji_dibayar: gajiPerJurulatih[j.id] ?? 0,
      sesi_bulan_ini: sesiBulanIni,
      // Gaji belum bayar bulan ini = sesi Hadir × kadar − sudah dibayar (clamp ≥ 0)
      gaji_belum_bayar: Math.max(0, sesiBulanIni * (j.kadar_bayaran ?? 0) - (dibayarBulanIniPerJurulatih[j.id] ?? 0)),
      point: pointPerJurulatih[j.id] ?? 0,
      bayaran_terkini: terkiniPerJurulatih[j.id]
        ? {
            bulan_bayaran: terkiniPerJurulatih[j.id].bulan_bayaran,
            tahun_bayaran: terkiniPerJurulatih[j.id].tahun_bayaran,
            jumlah: terkiniPerJurulatih[j.id].jumlah,
            tarikh_bayar: terkiniPerJurulatih[j.id].tarikh_bayar,
          }
        : null,
    }
  })

  // Statistik dashboard keseluruhan
  const totalGajiDibayar = Object.values(gajiPerJurulatih).reduce((s, n) => s + n, 0)
  const gajiBulanIni = (bayaran ?? [])
    .filter((b) => b.status === 'Sudah Bayar' && b.bulan_bayaran === bulanIni && b.tahun_bayaran === tahunIni)
    .reduce((s, b) => s + b.jumlah, 0)
  const sesiHadirBulanIni = Object.values(sesiBulanIniPerJurulatih).reduce((s, n) => s + n, 0)
  const totalBelumBayar = jurulatih
    .filter((j) => j.status === 'Aktif')
    .reduce((s, j) => s + j.gaji_belum_bayar, 0)

  return (
    <TabelJurulatih
      jurulatih={jurulatih}
      stat={{
        totalGajiDibayar,
        gajiBulanIni,
        sesiHadirBulanIni,
        totalBelumBayar,
        namaBulan: `${bulanIni} ${tahunIni}`,
      }}
    />
  )
}
