'use server'

import { createClient } from '@/lib/supabase/server'
import { akhirBulan, tarikhTempatan, hariMinggu, HARI, formatMasa, NAMA_BULAN } from '@/lib/utils'
import { perluBayarBulan } from '@/lib/tunggakan'
import { tapisSesiDibatalkan, SELECT_SESI_GAJI, SELECT_SLOT_GAJI, type SlotUntukGaji } from '@/lib/gajiSesi'

export type Notifikasi = {
  id: string
  jenis: string
  tajuk: string
  mesej: string
  pautan: string | null
  dibaca: boolean
  created_at: string
}

async function sahAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase
    .from('pengguna_profil')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  return data?.is_admin === true
}

// Jana amaran operasi semasa (pelajar belum bayar) lalu pulangkan senarai
// notifikasi terkini + bilangan belum dibaca. Nyahduplikat ikut `kunci`
// (satu notifikasi per pelajar per bulan); auto-selesai bila sudah dibayar.
export async function janaDanMuatNotifikasi(): Promise<{ senarai: Notifikasi[]; belumDibaca: number }> {
  const supabase = await createClient()
  if (!(await sahAdmin(supabase))) return { senarai: [], belumDibaca: 0 }

  // Bulan semasa waktu Malaysia (UTC+8)
  const myt = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const tahun = myt.getUTCFullYear()
  const bulanNombor = myt.getUTCMonth() + 1
  const bulanKunci = `${tahun}-${String(bulanNombor).padStart(2, '0')}`
  const namaBulan = NAMA_BULAN[bulanNombor - 1]
  const mulaB = `${bulanKunci}-01`
  const akhirB = akhirBulan(tahun, bulanNombor)

  const [{ data: pelajarAktif }, { data: kehadiranBulan }, { data: resitBulan }] = await Promise.all([
    supabase.from('pelajar').select('id, nama_penuh').eq('status', 'Aktif'),
    supabase.from('kehadiran').select('pelajar_id, status').eq('status', 'Hadir').gte('tarikh', mulaB).lte('tarikh', akhirB),
    supabase.from('resit').select('pelajar_id').eq('bulan_bayaran', namaBulan).eq('tahun_bayaran', tahun).eq('status', 'Aktif'),
  ])

  const idDgnResit = new Set((resitBulan ?? []).map((r) => r.pelajar_id))
  const kiraHadir: Record<string, number> = {}
  for (const k of kehadiranBulan ?? []) {
    kiraHadir[k.pelajar_id] = (kiraHadir[k.pelajar_id] ?? 0) + 1
  }

  const belumBayar = (pelajarAktif ?? []).filter(
    (p) => perluBayarBulan(kiraHadir[p.id] ?? 0, idDgnResit.has(p.id))
  )
  const idBelumBayar = new Set(belumBayar.map((p) => p.id))

  // Sisip notifikasi baharu (abai jika kunci sudah wujud)
  if (belumBayar.length > 0) {
    const baris = belumBayar.map((p) => ({
      jenis: 'belum_bayar',
      tajuk: 'Pelajar belum bayar',
      mesej: `${p.nama_penuh} sudah ${kiraHadir[p.id]} kali hadir bulan ${namaBulan} tetapi belum ada resit.`,
      pautan: `/pelajar/${p.id}`,
      kunci: `belum_bayar:${p.id}:${bulanKunci}`,
      rujukan_id: p.id,
    }))
    await supabase.from('notifikasi').upsert(baris, { onConflict: 'kunci', ignoreDuplicates: true })
  }

  // Auto-selesai: tandai dibaca notifikasi belum_bayar bulan ini yang pelajarnya
  // kini sudah membayar (tiada lagi dalam senarai belum bayar).
  const { data: belumBayarSemasa } = await supabase
    .from('notifikasi')
    .select('id, rujukan_id')
    .eq('jenis', 'belum_bayar')
    .eq('dibaca', false)
    .like('kunci', `%:${bulanKunci}`)

  const idSelesai = (belumBayarSemasa ?? [])
    .filter((n) => n.rujukan_id && !idBelumBayar.has(n.rujukan_id))
    .map((n) => n.id)
  if (idSelesai.length > 0) {
    await supabase
      .from('notifikasi')
      .update({ dibaca: true, dibaca_pada: new Date().toISOString() })
      .in('id', idSelesai)
  }

  // ---- Peringatan jadual: kelas/aktiviti hari ini + aktiviti esok ----
  const tarikhHariIni = tarikhTempatan()
  const hariIni = hariMinggu(tarikhHariIni)
  // Tarikh esok dikira dari nombor tarikh (Date.UTC) — bebas zon masa pelayan.
  const [ty, tm, td] = tarikhHariIni.split('-').map(Number)
  const tarikhEsok = new Date(Date.UTC(ty, tm - 1, td + 1)).toISOString().split('T')[0]

  const [{ data: slotHariIni }, { data: aktivitiDua }, { data: batalHariIni }] = await Promise.all([
    supabase
      .from('jadual_slot')
      .select('id, jenis')
      .eq('status', 'Aktif')
      .eq('hari_minggu', hariIni),
    supabase
      .from('aktiviti')
      .select('id, nama, tarikh, masa_mula, lokasi')
      .eq('status', 'Aktif')
      .in('tarikh', [tarikhHariIni, tarikhEsok]),
    supabase.from('jadual_slot_batal').select('slot_id').eq('tarikh', tarikhHariIni),
  ])

  const aktivitiHariIni = (aktivitiDua ?? []).filter((a) => a.tarikh === tarikhHariIni)
  const aktivitiEsok = (aktivitiDua ?? []).filter((a) => a.tarikh === tarikhEsok)

  // SATU notifikasi agregat sehari jika ada apa-apa dalam jadual hari ini
  // (slot yang dibatalkan untuk tarikh hari ini tidak dikira)
  const idSlotBatal = new Set((batalHariIni ?? []).map((b) => b.slot_id))
  const slotAktifHariIni = (slotHariIni ?? []).filter((s) => !idSlotBatal.has(s.id))
  const bilKumpulan = slotAktifHariIni.filter((s) => s.jenis === 'Kumpulan').length
  const bilPersonal = slotAktifHariIni.filter((s) => s.jenis === 'Personal').length
  if (bilKumpulan + bilPersonal + aktivitiHariIni.length > 0) {
    const bahagian: string[] = []
    if (bilKumpulan > 0) bahagian.push(`${bilKumpulan} kelas kumpulan`)
    if (bilPersonal > 0) bahagian.push(`${bilPersonal} kelas personal`)
    if (aktivitiHariIni.length > 0) {
      bahagian.push(`${aktivitiHariIni.length} aktiviti (${aktivitiHariIni[0].nama}${aktivitiHariIni.length > 1 ? ', ...' : ''})`)
    }
    await supabase.from('notifikasi').upsert(
      [{
        jenis: 'jadual_hari_ini',
        tajuk: 'Jadual hari ini',
        mesej: `${HARI[hariIni]} ini: ${bahagian.join(', ')}.`,
        pautan: '/jadual',
        kunci: `jadual_hari_ini:${tarikhHariIni}`,
        rujukan_id: null,
      }],
      { onConflict: 'kunci', ignoreDuplicates: true }
    )
  }

  // SATU notifikasi per aktiviti esok — aktiviti bertarikh mudah dilupakan
  if (aktivitiEsok.length > 0) {
    const barisEsok = aktivitiEsok.map((a) => ({
      jenis: 'aktiviti_esok',
      tajuk: 'Aktiviti esok',
      mesej: `${a.nama} pada ${tarikhEsok.split('-').reverse().join('/')}${a.masa_mula ? ` ${formatMasa(a.masa_mula)}` : ''}${a.lokasi ? ` di ${a.lokasi}` : ''}.`,
      pautan: '/jadual',
      kunci: `aktiviti_esok:${a.id}`,
      rujukan_id: a.id,
    }))
    await supabase.from('notifikasi').upsert(barisEsok, { onConflict: 'kunci', ignoreDuplicates: true })
  }

  // Auto-selesai peringatan jadual yang sudah luput:
  // - 'jadual_hari_ini' hari sebelumnya
  // - 'aktiviti_esok' yang aktivitinya dibatal/dipadam atau tarikhnya berlalu
  // - 'kelas_dibatalkan' yang tarikhnya (suffix kunci) sudah berlalu
  const { data: notifJadual } = await supabase
    .from('notifikasi')
    .select('id, jenis, kunci, rujukan_id')
    .in('jenis', ['jadual_hari_ini', 'aktiviti_esok', 'kelas_dibatalkan'])
    .eq('dibaca', false)
  const idAktivitiEsok = new Set(aktivitiEsok.map((a) => a.id))
  const idLuput = (notifJadual ?? [])
    .filter((n) => {
      if (n.jenis === 'jadual_hari_ini') return n.kunci !== `jadual_hari_ini:${tarikhHariIni}`
      if (n.jenis === 'kelas_dibatalkan') {
        const tarikhBatal = n.kunci?.split(':')[2]
        return !tarikhBatal || tarikhBatal < tarikhHariIni
      }
      return !n.rujukan_id || !idAktivitiEsok.has(n.rujukan_id)
    })
    .map((n) => n.id)
  if (idLuput.length > 0) {
    await supabase
      .from('notifikasi')
      .update({ dibaca: true, dibaca_pada: new Date().toISOString() })
      .in('id', idLuput)
  }

  // ---- Peringatan gaji jurulatih: hari gaji 30hb setiap bulan ----
  // Dari 27hb hingga akhir bulan, satu notifikasi per jurulatih Aktif yang ada
  // sesi Hadir bulan ini tetapi belum ada rekod gaji 'Sudah Bayar' bulan ini.
  const hariBulanMyt = myt.getUTCDate()
  const hariAkhirBulan = Number(akhirB.split('-')[2])
  const hariGaji = Math.min(30, hariAkhirBulan) // Februari tiada 30hb — guna hari akhir bulan

  const [{ data: jurulatihAktif }, { data: hadirJurulatih }, { data: gajiBulanIni }, { data: slotGaji }, { data: batalBulan }] = await Promise.all([
    supabase.from('jurulatih').select('id, nama_penuh, kadar_bayaran').eq('status', 'Aktif'),
    supabase.from('kehadiran_jurulatih').select(SELECT_SESI_GAJI).eq('status', 'Hadir').gte('tarikh', mulaB).lte('tarikh', akhirB),
    supabase.from('bayaran_jurulatih').select('jurulatih_id').eq('bulan_bayaran', namaBulan).eq('tahun_bayaran', tahun).eq('status', 'Sudah Bayar'),
    supabase.from('jadual_slot').select(SELECT_SLOT_GAJI),
    supabase.from('jadual_slot_batal').select('slot_id, tarikh').gte('tarikh', mulaB).lte('tarikh', akhirB),
  ])

  // Sesi pada kelas DIBATALKAN tidak dikira dalam gaji
  const { sah: hadirJurulatihSah } = tapisSesiDibatalkan(hadirJurulatih ?? [], (slotGaji ?? []) as SlotUntukGaji[], batalBulan ?? [])
  const kiraSesiJurulatih: Record<string, number> = {}
  for (const k of hadirJurulatihSah) {
    kiraSesiJurulatih[k.jurulatih_id] = (kiraSesiJurulatih[k.jurulatih_id] ?? 0) + 1
  }
  const idSudahGaji = new Set((gajiBulanIni ?? []).map((b) => b.jurulatih_id))
  const belumGaji = (jurulatihAktif ?? []).filter(
    (j) => (kiraSesiJurulatih[j.id] ?? 0) > 0 && !idSudahGaji.has(j.id)
  )
  const idBelumGaji = new Set(belumGaji.map((j) => j.id))

  if (hariBulanMyt >= 27 && belumGaji.length > 0) {
    const barisGaji = belumGaji.map((j) => {
      const sesi = kiraSesiJurulatih[j.id] ?? 0
      const kadar = j.kadar_bayaran ?? 0
      const anggaran = sesi * kadar
      return {
        jenis: 'gaji_jurulatih',
        tajuk: 'Gaji jurulatih belum dibayar',
        mesej: `${j.nama_penuh} — ${sesi} sesi × RM${kadar.toFixed(2)} = RM${anggaran.toFixed(2)} untuk ${namaBulan}. Bayar sebelum ${hariGaji}hb.`,
        pautan: `/jurulatih/${j.id}/bayaran`,
        kunci: `gaji_jurulatih:${j.id}:${bulanKunci}`,
        rujukan_id: j.id,
      }
    })
    await supabase.from('notifikasi').upsert(barisGaji, { onConflict: 'kunci', ignoreDuplicates: true })
  }

  // Auto-selesai: gaji sudah dibayar, jurulatih tiada lagi dalam senarai,
  // atau notifikasi bulan lama.
  const { data: notifGaji } = await supabase
    .from('notifikasi')
    .select('id, kunci, rujukan_id')
    .eq('jenis', 'gaji_jurulatih')
    .eq('dibaca', false)
  const idGajiSelesai = (notifGaji ?? [])
    .filter((n) =>
      !n.kunci?.endsWith(`:${bulanKunci}`) || !n.rujukan_id || !idBelumGaji.has(n.rujukan_id)
    )
    .map((n) => n.id)
  if (idGajiSelesai.length > 0) {
    await supabase
      .from('notifikasi')
      .update({ dibaca: true, dibaca_pada: new Date().toISOString() })
      .in('id', idGajiSelesai)
  }

  const [{ data: senarai }, { count }] = await Promise.all([
    supabase
      .from('notifikasi')
      .select('id, jenis, tajuk, mesej, pautan, dibaca, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase.from('notifikasi').select('id', { count: 'exact', head: true }).eq('dibaca', false),
  ])

  return { senarai: (senarai ?? []) as Notifikasi[], belumDibaca: count ?? 0 }
}

export async function tandaDibaca(id: string): Promise<void> {
  const supabase = await createClient()
  if (!(await sahAdmin(supabase))) return
  await supabase
    .from('notifikasi')
    .update({ dibaca: true, dibaca_pada: new Date().toISOString() })
    .eq('id', id)
}

export async function tandaSemuaDibaca(): Promise<void> {
  const supabase = await createClient()
  if (!(await sahAdmin(supabase))) return
  await supabase
    .from('notifikasi')
    .update({ dibaca: true, dibaca_pada: new Date().toISOString() })
    .eq('dibaca', false)
}
