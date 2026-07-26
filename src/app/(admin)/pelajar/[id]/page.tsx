import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { BukuRujukan, KategoriTopik, TopikPelajar } from '@/lib/progresPelajar'
import { ProfilPelajarKlient } from './_components/ProfilPelajarKlient'

export default async function ProfilPelajarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const bulanIni = new Date()
  const tahunBulan = `${bulanIni.getFullYear()}-${String(bulanIni.getMonth() + 1).padStart(2, '0')}`
  const bulanLabel = bulanIni.toLocaleString('ms-MY', { month: 'long' })
  const bulanBayaran = `${bulanLabel} ${bulanIni.getFullYear()}`

  const [
    { data: pelajarRaw, error },
    { data: kehadiran },
    { data: kehadiranSemua },
    { data: kehadiranBulanIni },
    { data: resit },
    { data: resitBulanIni },
    { data: topik },
    { data: kategoriTopik },
    { data: buku },
    { data: silibus },
  ] = await Promise.all([
    supabase
      .from('pelajar')
      .select('*, cawangan:cawangan_daftar_id(nama)')
      .eq('id', id)
      .single(),
    supabase
      .from('kehadiran')
      .select('id, tarikh, status, nota')
      .eq('pelajar_id', id)
      .order('tarikh', { ascending: false })
      .limit(50),
    supabase
      .from('kehadiran')
      .select('status')
      .eq('pelajar_id', id),
    supabase
      .from('kehadiran')
      .select('status')
      .eq('pelajar_id', id)
      .gte('tarikh', `${tahunBulan}-01`)
      .lt('tarikh', `${tahunBulan}-32`),
    supabase
      .from('resit')
      .select('id, nombor_resit, bulan_bayaran, jenis, jumlah, kaedah_bayaran, tarikh_bayar, status')
      .eq('pelajar_id', id)
      .order('tarikh_bayar', { ascending: false }),
    supabase
      .from('resit')
      .select('id')
      .eq('pelajar_id', id)
      .eq('bulan_bayaran', bulanBayaran)
      .eq('status', 'Aktif'),
    // Progress pembelajaran (kelas Personal). Jika migrasi progres-pelajar.sql
    // belum dijalankan, query gagal senyap → tab papar keadaan kosong.
    supabase
      .from('pelajar_topik')
      .select('id, kategori_id, tajuk, butiran, tahap, tarikh, tarikh_kuasai, buku_id, muka_surat')
      .eq('pelajar_id', id)
      .order('tarikh', { ascending: false }),
    supabase
      .from('topik_kategori')
      .select('id, nama, susunan, status')
      .order('susunan')
      .order('nama'),
    supabase
      .from('buku_rujukan')
      .select('id, nama, pengarang, fail_path')
      .eq('status', 'Aktif')
      .order('nama'),
    supabase
      .from('silibus')
      .select('id, tarikh, tajuk, muka_surat, nota')
      .eq('pelajar_id', id)
      .order('tarikh', { ascending: false }),
  ])

  if (error || !pelajarRaw) notFound()

  // `select('*, cawangan:...')` — Supabase tidak menjana jenis untuk relasi
  // bersarang, jadi bentuk baris ditakrifkan di sini.
  // Kekalkan jenis lajur yang dijana Supabase, cuma ganti relasi bersarang
  // `cawangan` yang tidak dapat ditaakul oleh penjana jenis.
  type BarisPelajar = Omit<NonNullable<typeof pelajarRaw>, 'cawangan'> & { cawangan: { nama: string } | null }
  const p = pelajarRaw as unknown as BarisPelajar
  const kiraStatus = (baris: { status: string }[] | null) => ({
    hadir: (baris ?? []).filter((k) => k.status === 'Hadir').length,
    tidak_hadir: (baris ?? []).filter((k) => k.status === 'Tidak Hadir').length,
    cuti: (baris ?? []).filter((k) => k.status === 'Cuti').length,
  })
  const stat = kiraStatus(kehadiranBulanIni)
  const total = kiraStatus(kehadiranSemua)

  return (
    <ProfilPelajarKlient
      pelajar={{
        id: p.id,
        nama_penuh: p.nama_penuh,
        tarikh_lahir: p.tarikh_lahir,
        nama_ibu_bapa: p.nama_ibu_bapa,
        no_telefon: p.no_telefon,
        emel_ibu_bapa: p.emel_ibu_bapa,
        alamat: p.alamat,
        jenis_kelas: p.jenis_kelas,
        yuran_bulanan: p.yuran_bulanan,
        status: p.status,
        tarikh_daftar: p.tarikh_daftar,
        cawangan_nama: p.cawangan?.nama ?? '—',
      }}
      stat={stat}
      total={total}
      sudahBayarBulanIni={(resitBulanIni ?? []).length > 0}
      kehadiran={kehadiran ?? []}
      resit={resit ?? []}
      progres={{
        topik: (topik ?? []) as TopikPelajar[],
        kategori: (kategoriTopik ?? []) as KategoriTopik[],
        buku: (buku ?? []) as BukuRujukan[],
        silibus: silibus ?? [],
      }}
    />
  )
}
