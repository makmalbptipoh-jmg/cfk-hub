'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, ChevronLeft, Check, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { kirYuranBulanan, formatRinggit } from '@/lib/utils'

type Cawangan = { id: string; nama: string }

const skema1 = z.object({
  nama_penuh: z.string().min(2, 'Nama sekurang-kurangnya 2 aksara'),
  tarikh_lahir: z.string().optional(),
  jenis_kelas: z.enum(['Kumpulan', 'Personal', 'Kumpulan+Personal']),
})

const skema2 = z.object({
  nama_ibu_bapa: z.string().min(2, 'Nama ibu bapa wajib diisi'),
  no_telefon: z.string().min(9, 'Nombor telefon tidak sah').regex(/^[0-9+\-\s]+$/, 'Format tidak sah'),
  emel_ibu_bapa: z.string().email('Format e-mel tidak sah').optional().or(z.literal('')),
  alamat: z.string().optional(),
  cawangan_daftar_id: z.string().min(1, 'Sila pilih cawangan'),
})

type Data1 = z.infer<typeof skema1>
type Data2 = z.infer<typeof skema2>

const labelInput = {
  display: 'block' as const,
  fontSize: '12px',
  fontWeight: 600 as const,
  color: 'var(--text-muted)',
  marginBottom: '6px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

const gayaInput = (ralat?: boolean) => ({
  width: '100%',
  padding: '10px 14px',
  border: `1.5px solid ${ralat ? '#EF4444' : 'var(--border)'}`,
  borderRadius: '12px',
  fontSize: '13.5px',
  color: 'var(--text)',
  background: 'var(--card)',
  outline: 'none',
  fontFamily: 'inherit',
})

export default function TambahPelajarPage() {
  const router = useRouter()
  const [langkah, setLangkah] = useState(1)
  const [data1, setData1] = useState<Data1 | null>(null)
  const [data2, setData2] = useState<Data2 | null>(null)
  const [cawangan, setCawangan] = useState<Cawangan[]>([])
  const [loading, setLoading] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)

  useEffect(() => {
    createClient()
      .from('cawangan')
      .select('id, nama')
      .eq('status', 'Aktif')
      .order('nama')
      .then(({ data }) => setCawangan(data ?? []))
  }, [])

  const form1 = useForm<Data1>({ resolver: zodResolver(skema1), defaultValues: { jenis_kelas: 'Kumpulan' } })
  const form2 = useForm<Data2>({ resolver: zodResolver(skema2) })

  // Notifikasi pendua: semak nama serupa dalam DB semasa menaip (debounce 500ms)
  const [pendua, setPendua] = useState<{ id: string; nama_penuh: string; status: string; cawangan: string }[]>([])
  const namaDitaip = form1.watch('nama_penuh')

  useEffect(() => {
    const nama = (namaDitaip ?? '').trim()
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
  }, [namaDitaip])

  const teruskanLangkah1 = form1.handleSubmit((data) => {
    setData1(data)
    setLangkah(2)
  })

  const teruskanLangkah2 = form2.handleSubmit((data) => {
    setData2(data)
    setLangkah(3)
  })

  const hantarBorang = async () => {
    if (!data1 || !data2) return
    setLoading(true)
    setRalat(null)

    const supabase = createClient()
    const yuran = kirYuranBulanan(data1.jenis_kelas)

    const { error } = await supabase.from('pelajar').insert({
      nama_penuh: data1.nama_penuh.toUpperCase(),
      tarikh_lahir: data1.tarikh_lahir || null,
      jenis_kelas: data1.jenis_kelas,
      nama_ibu_bapa: data2.nama_ibu_bapa.toUpperCase(),
      no_telefon: data2.no_telefon,
      emel_ibu_bapa: data2.emel_ibu_bapa || null,
      alamat: data2.alamat?.trim() || null,
      cawangan_daftar_id: data2.cawangan_daftar_id,
      yuran_bulanan: yuran,
      sumber_daftar: 'Manual',
    })

    if (error) {
      setRalat('Gagal daftar pelajar. Sila cuba lagi.')
      setLoading(false)
      return
    }

    router.push('/pelajar')
    router.refresh()
  }

  const cawanganPilihan = cawangan.find((c) => c.id === data2?.cawangan_daftar_id)
  const yuranKira = data1 ? kirYuranBulanan(data1.jenis_kelas) : 0

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <button
          onClick={() => langkah > 1 ? setLangkah(langkah - 1) : router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'inherit',
            marginBottom: '12px',
          }}
        >
          <ChevronLeft size={14} />
          {langkah > 1 ? 'Kembali' : 'Senarai Pelajar'}
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Daftar Pelajar Baharu
        </h1>
      </div>

      {/* Stepper */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0',
        marginBottom: '28px',
      }}>
        {[
          { n: 1, label: 'Maklumat Pelajar' },
          { n: 2, label: 'Ibu Bapa & Cawangan' },
          { n: 3, label: 'Semak & Sahkan' },
        ].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: langkah > s.n ? 'var(--accent)' : langkah === s.n ? 'var(--primary)' : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700,
                color: langkah > s.n ? 'var(--accent-text)' : langkah === s.n ? '#FFFFFF' : 'var(--text-muted)',
              }}>
                {langkah > s.n ? <Check size={14} /> : s.n}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: langkah === s.n ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div style={{
                flex: 1, height: '2px', margin: '0 8px', marginBottom: '18px',
                background: langkah > s.n + 1 ? 'var(--accent)' : langkah > s.n ? 'var(--primary)' : 'var(--border)',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Kad */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '28px',
      }}>

        {/* Langkah 1 */}
        {langkah === 1 && (
          <form onSubmit={teruskanLangkah1} noValidate>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              Maklumat Pelajar
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelInput}>Nama Penuh *</label>
              <input {...form1.register('nama_penuh')} placeholder="Contoh: Ahmad bin Ali" style={gayaInput(!!form1.formState.errors.nama_penuh)} />
              {form1.formState.errors.nama_penuh && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{form1.formState.errors.nama_penuh.message}</p>
              )}
              {pendua.length > 0 && (
                <div
                  style={{
                    background: '#FEF3C7', border: '1px solid #FDE68A',
                    borderRadius: '10px', padding: '10px 14px', marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <AlertTriangle size={13} style={{ color: '#92400E', flexShrink: 0 }} />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#92400E' }}>
                      Pelajar dengan nama serupa sudah wujud:
                    </span>
                  </div>
                  {pendua.map((p) => (
                    <div key={p.id} style={{ fontSize: '12.5px', color: '#92400E', marginBottom: '3px' }}>
                      •{' '}
                      <Link
                        href={`/pelajar/${p.id}`}
                        target="_blank"
                        style={{ fontWeight: 700, color: '#92400E', textDecoration: 'underline' }}
                      >
                        {p.nama_penuh}
                      </Link>
                      {' '}— {p.cawangan} · {p.status}
                    </div>
                  ))}
                  <p style={{ fontSize: '11.5px', color: '#92400E', opacity: 0.8, marginTop: '4px' }}>
                    Semak dulu profil di atas untuk elak daftar dua kali. Teruskan hanya jika ini pelajar berbeza.
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelInput}>Tarikh Lahir <span style={{ fontWeight: 400, textTransform: 'none' }}>(pilihan)</span></label>
              <input type="date" {...form1.register('tarikh_lahir')} style={gayaInput()} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelInput}>Jenis Kelas *</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {(['Kumpulan', 'Personal', 'Kumpulan+Personal'] as const).map((j) => {
                  const aktif = form1.watch('jenis_kelas') === j
                  return (
                    <button
                      type="button" key={j}
                      onClick={() => form1.setValue('jenis_kelas', j)}
                      style={{
                        flex: 1, padding: '10px 8px',
                        border: `2px solid ${aktif ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: '10px',
                        background: aktif ? '#F7FEE7' : 'var(--card)',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: aktif ? 'var(--accent-dark)' : 'var(--text)' }}>{j}</div>
                      <div style={{ fontSize: '12px', color: aktif ? 'var(--accent-dark)' : 'var(--text-muted)' }}>
                        {formatRinggit(kirYuranBulanan(j))}/bln
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <button type="submit" style={{
              width: '100%', padding: '12px',
              background: 'var(--accent)', border: 'none',
              borderRadius: '12px', fontSize: '14px', fontWeight: 700,
              color: 'var(--accent-text)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              fontFamily: 'inherit',
            }}>
              Seterusnya <ChevronRight size={15} />
            </button>
          </form>
        )}

        {/* Langkah 2 */}
        {langkah === 2 && (
          <form onSubmit={teruskanLangkah2} noValidate>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              Maklumat Ibu Bapa & Cawangan
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelInput}>Nama Ibu Bapa / Penjaga *</label>
              <input {...form2.register('nama_ibu_bapa')} placeholder="Nama penuh" style={gayaInput(!!form2.formState.errors.nama_ibu_bapa)} />
              {form2.formState.errors.nama_ibu_bapa && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{form2.formState.errors.nama_ibu_bapa.message}</p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelInput}>No. Telefon *</label>
              <input {...form2.register('no_telefon')} placeholder="Contoh: 011-23456789" style={gayaInput(!!form2.formState.errors.no_telefon)} />
              {form2.formState.errors.no_telefon && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{form2.formState.errors.no_telefon.message}</p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelInput}>E-mel Ibu Bapa <span style={{ fontWeight: 400, textTransform: 'none' }}>(pilihan)</span></label>
              <input type="email" {...form2.register('emel_ibu_bapa')} placeholder="nama@email.com" style={gayaInput(!!form2.formState.errors.emel_ibu_bapa)} />
              {form2.formState.errors.emel_ibu_bapa && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{form2.formState.errors.emel_ibu_bapa.message}</p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelInput}>Alamat <span style={{ fontWeight: 400, textTransform: 'none' }}>(pilihan)</span></label>
              <textarea
                {...form2.register('alamat')}
                placeholder="Contoh: No. 1, Jalan Klebang 2, 31200 Chemor, Perak"
                rows={2}
                style={{ ...gayaInput(), resize: 'vertical' as const }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelInput}>Cawangan Daftar *</label>
              <select {...form2.register('cawangan_daftar_id')} style={gayaInput(!!form2.formState.errors.cawangan_daftar_id)}>
                <option value="">— Pilih Cawangan —</option>
                {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
              {form2.formState.errors.cawangan_daftar_id && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{form2.formState.errors.cawangan_daftar_id.message}</p>
              )}
            </div>

            <button type="submit" style={{
              width: '100%', padding: '12px',
              background: 'var(--accent)', border: 'none',
              borderRadius: '12px', fontSize: '14px', fontWeight: 700,
              color: 'var(--accent-text)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              fontFamily: 'inherit',
            }}>
              Seterusnya <ChevronRight size={15} />
            </button>
          </form>
        )}

        {/* Langkah 3 */}
        {langkah === 3 && data1 && data2 && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              Semak & Sahkan
            </h2>

            {[
              { tajuk: 'Maklumat Pelajar', baris: [
                { label: 'Nama Penuh', nilai: data1.nama_penuh },
                { label: 'Tarikh Lahir', nilai: data1.tarikh_lahir || '—' },
                { label: 'Jenis Kelas', nilai: data1.jenis_kelas },
                { label: 'Yuran Bulanan', nilai: formatRinggit(yuranKira) },
              ]},
              { tajuk: 'Maklumat Ibu Bapa', baris: [
                { label: 'Nama Ibu Bapa', nilai: data2.nama_ibu_bapa },
                { label: 'No. Telefon', nilai: data2.no_telefon },
                { label: 'E-mel', nilai: data2.emel_ibu_bapa || '—' },
                { label: 'Alamat', nilai: data2.alamat?.trim() || '—' },
                { label: 'Cawangan', nilai: cawanganPilihan?.nama || '—' },
              ]},
            ].map((seksyen) => (
              <div key={seksyen.tajuk} style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  {seksyen.tajuk}
                </h3>
                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '4px 0', border: '1px solid var(--border)' }}>
                  {seksyen.baris.map((b, i) => (
                    <div key={b.label} style={{
                      display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
                      borderBottom: i < seksyen.baris.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{b.label}</span>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{b.nilai}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {ralat && (
              <div style={{
                background: '#FFF1F2', border: '1px solid #FECDD3',
                borderRadius: '10px', padding: '10px 14px',
                fontSize: '13px', color: '#9F1239', marginBottom: '16px',
              }}>
                {ralat}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setLangkah(2)}
                style={{
                  flex: 1, padding: '11px',
                  background: 'var(--bg)', border: '1.5px solid var(--border)',
                  borderRadius: '12px', fontSize: '13.5px', fontWeight: 600,
                  color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ← Kembali Edit
              </button>
              <button
                onClick={hantarBorang}
                disabled={loading}
                style={{
                  flex: 2, padding: '11px',
                  background: loading ? '#94A3B8' : 'var(--accent)',
                  border: 'none', borderRadius: '12px',
                  fontSize: '13.5px', fontWeight: 700,
                  color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {loading ? 'Menyimpan...' : 'Daftar Pelajar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
