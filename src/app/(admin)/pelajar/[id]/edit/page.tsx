'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { kirYuranBulanan, formatRinggit } from '@/lib/utils'

type Cawangan = { id: string; nama: string }

const skema = z.object({
  nama_penuh: z.string().min(2, 'Nama sekurang-kurangnya 2 aksara'),
  tarikh_lahir: z.string().optional(),
  jenis_kelas: z.enum(['Kumpulan', 'Personal', 'Kumpulan+Personal']),
  nama_ibu_bapa: z.string().min(2, 'Nama ibu bapa wajib diisi'),
  no_telefon: z.string().min(9, 'Nombor telefon tidak sah'),
  emel_ibu_bapa: z.string().email('Format e-mel tidak sah').optional().or(z.literal('')),
  cawangan_daftar_id: z.string().min(1, 'Sila pilih cawangan'),
  status: z.enum(['Aktif', 'Tidak Aktif']),
})

type FormData = z.infer<typeof skema>

const labelInput = {
  display: 'block' as const,
  fontSize: '12px', fontWeight: 600 as const,
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
  fontSize: '13.5px', color: 'var(--text)',
  background: 'var(--card)', outline: 'none',
  fontFamily: 'inherit',
})

export default function EditPelajarPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [cawangan, setCawangan] = useState<Cawangan[]>([])
  const [loading, setLoading] = useState(false)
  const [muatData, setMuatData] = useState(true)
  const [ralat, setRalat] = useState<string | null>(null)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(skema),
  })

  const jenisKelas = watch('jenis_kelas')

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('pelajar').select('*').eq('id', id).single(),
      supabase.from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama'),
    ]).then(([{ data: p }, { data: c }]) => {
      if (p) {
        reset({
          nama_penuh: p.nama_penuh,
          tarikh_lahir: p.tarikh_lahir ?? '',
          jenis_kelas: p.jenis_kelas,
          nama_ibu_bapa: p.nama_ibu_bapa,
          no_telefon: p.no_telefon,
          emel_ibu_bapa: p.emel_ibu_bapa ?? '',
          cawangan_daftar_id: p.cawangan_daftar_id,
          status: p.status,
        })
      }
      setCawangan(c ?? [])
      setMuatData(false)
    })
  }, [id, reset])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setRalat(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('pelajar')
      .update({
        ...data,
        nama_penuh: data.nama_penuh.toUpperCase(),
        nama_ibu_bapa: data.nama_ibu_bapa.toUpperCase(),
        tarikh_lahir: data.tarikh_lahir || null,
        emel_ibu_bapa: data.emel_ibu_bapa || null,
        yuran_bulanan: kirYuranBulanan(data.jenis_kelas),
      })
      .eq('id', id)

    if (error) {
      setRalat('Gagal simpan perubahan. Sila cuba lagi.')
      setLoading(false)
      return
    }

    router.push(`/pelajar/${id}`)
    router.refresh()
  }

  if (muatData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Memuatkan...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <Link href={`/pelajar/${id}`} style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
          ← Profil Pelajar
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Edit Pelajar
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>Maklumat Pelajar</h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelInput}>Nama Penuh *</label>
            <input {...register('nama_penuh')} style={gayaInput(!!errors.nama_penuh)} />
            {errors.nama_penuh && <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{errors.nama_penuh.message}</p>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelInput}>Tarikh Lahir</label>
            <input type="date" {...register('tarikh_lahir')} style={gayaInput()} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelInput}>Jenis Kelas *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['Kumpulan', 'Personal', 'Kumpulan+Personal'] as const).map((j) => {
                const aktif = jenisKelas === j
                return (
                  <label key={j} style={{
                    flex: 1, padding: '10px 8px',
                    border: `2px solid ${aktif ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '10px',
                    background: aktif ? '#F7FEE7' : 'var(--card)',
                    cursor: 'pointer', textAlign: 'center',
                  }}>
                    <input type="radio" {...register('jenis_kelas')} value={j} style={{ display: 'none' }} />
                    <div style={{ fontSize: '12px', fontWeight: 700, color: aktif ? 'var(--accent-dark)' : 'var(--text)' }}>{j}</div>
                    <div style={{ fontSize: '11.5px', color: aktif ? 'var(--accent-dark)' : 'var(--text-muted)' }}>
                      {formatRinggit(kirYuranBulanan(j))}/bln
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: '0' }}>
            <label style={labelInput}>Status</label>
            <select {...register('status')} style={gayaInput()}>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>Maklumat Ibu Bapa & Cawangan</h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelInput}>Nama Ibu Bapa / Penjaga *</label>
            <input {...register('nama_ibu_bapa')} style={gayaInput(!!errors.nama_ibu_bapa)} />
            {errors.nama_ibu_bapa && <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{errors.nama_ibu_bapa.message}</p>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelInput}>No. Telefon *</label>
            <input {...register('no_telefon')} style={gayaInput(!!errors.no_telefon)} />
            {errors.no_telefon && <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{errors.no_telefon.message}</p>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelInput}>E-mel Ibu Bapa</label>
            <input type="email" {...register('emel_ibu_bapa')} style={gayaInput(!!errors.emel_ibu_bapa)} />
            {errors.emel_ibu_bapa && <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{errors.emel_ibu_bapa.message}</p>}
          </div>

          <div>
            <label style={labelInput}>Cawangan *</label>
            <select {...register('cawangan_daftar_id')} style={gayaInput(!!errors.cawangan_daftar_id)}>
              <option value="">— Pilih Cawangan —</option>
              {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
            {errors.cawangan_daftar_id && <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{errors.cawangan_daftar_id.message}</p>}
          </div>
        </div>

        {ralat && (
          <div style={{
            background: '#FFF1F2', border: '1px solid #FECDD3',
            borderRadius: '10px', padding: '10px 14px',
            fontSize: '13px', color: '#9F1239', marginBottom: '16px',
          }}>{ralat}</div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href={`/pelajar/${id}`}
            style={{
              flex: 1, padding: '12px', textAlign: 'center',
              background: 'var(--bg)', border: '1.5px solid var(--border)',
              borderRadius: '12px', fontSize: '13.5px', fontWeight: 600,
              color: 'var(--text)', textDecoration: 'none',
            }}
          >
            Batal
          </Link>
          <button type="submit" disabled={loading}
            style={{
              flex: 2, padding: '12px',
              background: loading ? '#94A3B8' : 'var(--accent)',
              border: 'none', borderRadius: '12px',
              fontSize: '13.5px', fontWeight: 700,
              color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  )
}
