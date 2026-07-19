'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, AlertTriangle, UserPlus, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { kirYuranBulanan, formatRinggit } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'

type Cawangan = { id: string; nama: string }
type JenisKelas = 'Kumpulan' | 'Personal' | 'Kumpulan+Personal'

interface Props {
  cawangan: Cawangan[]
  defaultCawanganId: string
}

const labelInput = {
  display: 'block' as const,
  fontSize: '11.5px',
  fontWeight: 600 as const,
  color: 'var(--text-muted)',
  marginBottom: '5px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}

const gayaInput = (ralat?: boolean) => ({
  width: '100%',
  padding: '10px 13px',
  border: `1.5px solid ${ralat ? '#EF4444' : 'var(--border)'}`,
  borderRadius: '11px',
  fontSize: '13.5px',
  color: 'var(--text)',
  background: 'var(--card)',
  outline: 'none',
  fontFamily: 'inherit',
})

export function BorangPelajarKlient({ cawangan, defaultCawanganId }: Props) {
  const router = useRouter()
  const [namaPenuh, setNamaPenuh] = useState('')
  const [namaIbuBapa, setNamaIbuBapa] = useState('')
  const [noTelefon, setNoTelefon] = useState('')
  const [jenisKelas, setJenisKelas] = useState<JenisKelas>('Kumpulan')
  const [cawanganId, setCawanganId] = useState(defaultCawanganId)
  const [tarikhLahir, setTarikhLahir] = useState('')
  const [alamat, setAlamat] = useState('')
  const [emel, setEmel] = useState('')

  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<Record<string, string>>({})
  const [ralatUmum, setRalatUmum] = useState<string | null>(null)

  // Amaran pendua: nama serupa dalam DB (debounce 500ms)
  const [pendua, setPendua] = useState<{ id: string; nama_penuh: string; status: string; cawangan: string }[]>([])

  useEffect(() => {
    const nama = namaPenuh.trim()
    if (nama.length < 4) { setPendua([]); return }
    const timer = setTimeout(async () => {
      const { data } = await createClient()
        .from('pelajar')
        .select('id, nama_penuh, status, cawangan:cawangan_daftar_id(nama)')
        .ilike('nama_penuh', `%${nama}%`)
        .limit(3)
      setPendua(
        ((data ?? []) as any[]).map((p) => ({
          id: p.id,
          nama_penuh: p.nama_penuh,
          status: p.status,
          cawangan: p.cawangan?.nama ?? '—',
        }))
      )
    }, 500)
    return () => clearTimeout(timer)
  }, [namaPenuh])

  const validasi = () => {
    const e: Record<string, string> = {}
    if (namaPenuh.trim().length < 2) e.nama_penuh = 'Nama sekurang-kurangnya 2 aksara'
    if (namaIbuBapa.trim().length < 2) e.nama_ibu_bapa = 'Nama ibu bapa wajib diisi'
    if (noTelefon.trim().length < 9 || !/^[0-9+\-\s]+$/.test(noTelefon.trim())) e.no_telefon = 'Nombor telefon tidak sah'
    if (emel.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emel.trim())) e.emel = 'Format e-mel tidak sah'
    if (!cawanganId) e.cawangan = 'Sila pilih cawangan'
    setRalat(e)
    return Object.keys(e).length === 0
  }

  const hantar = async () => {
    if (!validasi()) return
    setLoading(true)
    setRalatUmum(null)

    const { error } = await createClient().from('pelajar').insert({
      nama_penuh: namaPenuh.trim().toUpperCase(),
      tarikh_lahir: tarikhLahir || null,
      jenis_kelas: jenisKelas,
      nama_ibu_bapa: namaIbuBapa.trim().toUpperCase(),
      no_telefon: noTelefon.trim(),
      emel_ibu_bapa: emel.trim() || null,
      alamat: alamat.trim() || null,
      cawangan_daftar_id: cawanganId,
      yuran_bulanan: kirYuranBulanan(jenisKelas),
      sumber_daftar: 'Jurulatih',
    })

    setLoading(false)
    if (error) {
      setRalatUmum('Gagal daftar pelajar. Sila cuba lagi atau hubungi admin.')
      return
    }

    toast.success(`${namaPenuh.trim().toUpperCase()} berjaya didaftar.`)
    // Reset borang (kekalkan cawangan untuk pendaftaran seterusnya)
    setNamaPenuh(''); setNamaIbuBapa(''); setNoTelefon('')
    setJenisKelas('Kumpulan'); setTarikhLahir(''); setAlamat(''); setEmel('')
    setPendua([]); setRalat({})
    router.refresh()
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <Link
          href="/kehadiran"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontSize: '12.5px', color: 'var(--text-muted)', textDecoration: 'none',
            marginBottom: '10px',
          }}
        >
          <ChevronLeft size={14} /> Kehadiran
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <UserPlus size={19} style={{ color: 'var(--accent)' }} /> Daftar Pelajar Baru
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
          Isi maklumat asas pelajar. Pelajar terus aktif selepas daftar.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Nama Penuh */}
        <div>
          <label style={labelInput}>Nama Penuh Pelajar *</label>
          <input
            value={namaPenuh}
            onChange={(e) => setNamaPenuh(e.target.value)}
            placeholder="Contoh: Ahmad bin Ali"
            style={gayaInput(!!ralat.nama_penuh)}
          />
          {ralat.nama_penuh && <p style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '4px' }}>{ralat.nama_penuh}</p>}
          {pendua.length > 0 && (
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 13px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                <AlertTriangle size={13} style={{ color: '#92400E', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400E' }}>Nama serupa sudah wujud:</span>
              </div>
              {pendua.map((p) => (
                <div key={p.id} style={{ fontSize: '12px', color: '#92400E', marginBottom: '2px' }}>
                  •{' '}
                  <Link href={`/pelajar/${p.id}`} target="_blank" style={{ fontWeight: 700, color: '#92400E', textDecoration: 'underline' }}>
                    {p.nama_penuh}
                  </Link>
                  {' '}— {p.cawangan} · {p.status}
                </div>
              ))}
              <p style={{ fontSize: '11px', color: '#92400E', opacity: 0.8, marginTop: '4px' }}>
                Semak dulu. Teruskan hanya jika ini pelajar berbeza.
              </p>
            </div>
          )}
        </div>

        {/* Jenis Kelas */}
        <div>
          <label style={labelInput}>Jenis Kelas *</label>
          <div style={{ display: 'flex', gap: '7px' }}>
            {(['Kumpulan', 'Personal', 'Kumpulan+Personal'] as const).map((j) => {
              const aktif = jenisKelas === j
              return (
                <button
                  type="button" key={j}
                  onClick={() => setJenisKelas(j)}
                  style={{
                    flex: 1, padding: '9px 5px',
                    border: `2px solid ${aktif ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '10px',
                    background: aktif ? 'var(--hadir-bg)' : 'var(--card)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: aktif ? 'var(--accent)' : 'var(--text)' }}>{j}</div>
                  <div style={{ fontSize: '10.5px', color: aktif ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {formatRinggit(kirYuranBulanan(j))}/bln
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Cawangan */}
        <div>
          <label style={labelInput}>Cawangan Daftar *</label>
          <select value={cawanganId} onChange={(e) => setCawanganId(e.target.value)} style={gayaInput(!!ralat.cawangan)}>
            <option value="">— Pilih Cawangan —</option>
            {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
          {ralat.cawangan && <p style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '4px' }}>{ralat.cawangan}</p>}
        </div>

        {/* Nama Ibu Bapa */}
        <div>
          <label style={labelInput}>Nama Ibu Bapa / Penjaga *</label>
          <input
            value={namaIbuBapa}
            onChange={(e) => setNamaIbuBapa(e.target.value)}
            placeholder="Nama penuh"
            style={gayaInput(!!ralat.nama_ibu_bapa)}
          />
          {ralat.nama_ibu_bapa && <p style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '4px' }}>{ralat.nama_ibu_bapa}</p>}
        </div>

        {/* No Telefon */}
        <div>
          <label style={labelInput}>No. Telefon *</label>
          <input
            type="tel"
            value={noTelefon}
            onChange={(e) => setNoTelefon(e.target.value)}
            placeholder="Contoh: 011-23456789"
            style={gayaInput(!!ralat.no_telefon)}
          />
          {ralat.no_telefon && <p style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '4px' }}>{ralat.no_telefon}</p>}
        </div>

        {/* Tarikh Lahir (pilihan) */}
        <div>
          <label style={labelInput}>Tarikh Lahir <span style={{ fontWeight: 400, textTransform: 'none' }}>(pilihan)</span></label>
          <input type="date" value={tarikhLahir} onChange={(e) => setTarikhLahir(e.target.value)} style={gayaInput()} />
        </div>

        {/* E-mel (pilihan) */}
        <div>
          <label style={labelInput}>E-mel Ibu Bapa <span style={{ fontWeight: 400, textTransform: 'none' }}>(pilihan)</span></label>
          <input
            type="email"
            value={emel}
            onChange={(e) => setEmel(e.target.value)}
            placeholder="nama@email.com"
            style={{ ...gayaInput(!!ralat.emel), textTransform: 'none' }}
          />
          {ralat.emel && <p style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '4px' }}>{ralat.emel}</p>}
        </div>

        {/* Alamat (pilihan) */}
        <div>
          <label style={labelInput}>Alamat <span style={{ fontWeight: 400, textTransform: 'none' }}>(pilihan)</span></label>
          <textarea
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="No. rumah, jalan, poskod, bandar"
            rows={2}
            style={{ ...gayaInput(), resize: 'vertical' as const }}
          />
        </div>

        {ralatUmum && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '10px 13px', fontSize: '12.5px', color: '#9F1239' }}>
            {ralatUmum}
          </div>
        )}
      </div>

      {/* Save Bar */}
      <div style={{
        position: 'fixed', bottom: '70px', left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: '390px',
        padding: '12px 16px',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        zIndex: 90,
      }}>
        <button
          onClick={hantar}
          disabled={loading}
          style={{
            width: '100%', padding: '13px',
            background: loading ? '#94A3B8' : 'var(--accent)',
            border: 'none', borderRadius: '12px',
            fontSize: '14px', fontWeight: 700,
            color: 'var(--accent-text)',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          }}
        >
          {loading ? 'Menyimpan...' : <><CheckCircle2 size={16} /> Daftar Pelajar</>}
        </button>
      </div>
    </div>
  )
}
