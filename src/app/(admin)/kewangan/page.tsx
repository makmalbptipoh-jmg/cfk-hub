'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, Plus, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan, formatRinggit, formatTarikh } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import { BtnLaporanLHDN } from '@/components/excel/BtnLaporanLHDN'

const BULAN_MS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
]

const gayaPilih: React.CSSProperties = {
  padding: '9px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: '10px',
  fontSize: '13.5px',
  color: 'var(--text)',
  background: 'var(--card)',
  outline: 'none',
  fontFamily: 'inherit',
  cursor: 'pointer',
}

type Transaksi = {
  tarikh: string
  jenisTxn: 'masuk' | 'keluar'
  jenis: string
  kategori: string
  penerangan: string
  jumlah: number
}

type DataKewangan = {
  pendapatan: number
  perbelanjaan: number
  pendapatanCawangan: Record<string, number>
  perbelanjaanCawangan: Record<string, number>
  pendapatanJenis: Record<string, number>
  perbelanjaanKategori: Record<string, number>
  transaksi: Transaksi[]
  bilResit: number
  bilPendapatanLain: number
  bilBelanja: number
}

export default function KewanganRingkasanPage() {
  const hariIni = new Date()
  const tahunSemasa = hariIni.getFullYear()
  const [tahun, setTahun] = useState(tahunSemasa)
  // '' = Semua Bulan (seluruh tahun); '1'-'12' = bulan tertentu
  const [bulanIdx, setBulanIdx] = useState(String(hariIni.getMonth() + 1))
  const [data, setData] = useState<DataKewangan | null>(null)
  const [loading, setLoading] = useState(true)

  const muatData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    let resitQuery = supabase
      .from('resit')
      .select('nombor_resit, jenis, jumlah, tarikh_bayar, pelajar:pelajar_id(nama_penuh, cawangan:cawangan_daftar_id(nama))')
      .eq('tahun_bayaran', tahun)
      .eq('status', 'Aktif')
    let belanjaQuery = supabase
      .from('kewangan_perbelanjaan')
      .select('tarikh, kategori, penerangan, jumlah, cawangan:cawangan_id(nama)')
    let pendapatanLainQuery = supabase
      .from('pendapatan_lain')
      .select('tarikh, sumber, kategori, nota, jumlah, cawangan:cawangan_id(nama)')

    if (bulanIdx) {
      const m = +bulanIdx
      const mula = `${tahun}-${String(m).padStart(2, '0')}-01`
      const akhir = akhirBulan(tahun, m)
      resitQuery = resitQuery.eq('bulan_bayaran', BULAN_MS[m - 1])
      belanjaQuery = belanjaQuery.gte('tarikh', mula).lte('tarikh', akhir)
      pendapatanLainQuery = pendapatanLainQuery.gte('tarikh', mula).lte('tarikh', akhir)
    } else {
      belanjaQuery = belanjaQuery.gte('tarikh', `${tahun}-01-01`).lte('tarikh', `${tahun}-12-31`)
      pendapatanLainQuery = pendapatanLainQuery.gte('tarikh', `${tahun}-01-01`).lte('tarikh', `${tahun}-12-31`)
    }

    const [{ data: resit }, { data: belanja }, { data: pendapatanLain }] = await Promise.all([
      resitQuery, belanjaQuery, pendapatanLainQuery,
    ])

    const pendapatan =
      (resit ?? []).reduce((s, r) => s + r.jumlah, 0) +
      (pendapatanLain ?? []).reduce((s, p) => s + p.jumlah, 0)
    const perbelanjaan = (belanja ?? []).reduce((s, p) => s + p.jumlah, 0)

    const pendapatanCawangan: Record<string, number> = {}
    for (const r of resit ?? []) {
      const key = (r.pelajar as unknown as { cawangan: { nama: string } | null } | null)?.cawangan?.nama ?? 'Lain-lain'
      pendapatanCawangan[key] = (pendapatanCawangan[key] ?? 0) + r.jumlah
    }
    for (const p of pendapatanLain ?? []) {
      const key = (p.cawangan as unknown as { nama: string } | null)?.nama ?? 'Umum'
      pendapatanCawangan[key] = (pendapatanCawangan[key] ?? 0) + p.jumlah
    }

    const perbelanjaanCawangan: Record<string, number> = {}
    for (const p of belanja ?? []) {
      const key = (p.cawangan as unknown as { nama: string } | null)?.nama ?? 'Umum'
      perbelanjaanCawangan[key] = (perbelanjaanCawangan[key] ?? 0) + p.jumlah
    }

    const pendapatanJenis: Record<string, number> = {}
    for (const r of resit ?? []) pendapatanJenis[r.jenis] = (pendapatanJenis[r.jenis] ?? 0) + r.jumlah
    for (const p of pendapatanLain ?? []) pendapatanJenis[p.kategori] = (pendapatanJenis[p.kategori] ?? 0) + p.jumlah

    const perbelanjaanKategori: Record<string, number> = {}
    for (const p of belanja ?? []) perbelanjaanKategori[p.kategori] = (perbelanjaanKategori[p.kategori] ?? 0) + p.jumlah

    const transaksi: Transaksi[] = [
      ...(resit ?? []).map((r): Transaksi => ({
        tarikh: r.tarikh_bayar,
        jenisTxn: 'masuk',
        jenis: 'Pendapatan',
        kategori: r.jenis,
        penerangan: `${r.nombor_resit} — ${(r.pelajar as unknown as { nama_penuh: string } | null)?.nama_penuh ?? ''}`,
        jumlah: r.jumlah,
      })),
      ...(pendapatanLain ?? []).map((p): Transaksi => ({
        tarikh: p.tarikh,
        jenisTxn: 'masuk',
        jenis: 'Pendapatan Lain',
        kategori: p.kategori,
        penerangan: p.nota ? `${p.sumber} — ${p.nota}` : p.sumber,
        jumlah: p.jumlah,
      })),
      ...(belanja ?? []).map((p): Transaksi => ({
        tarikh: p.tarikh,
        jenisTxn: 'keluar',
        jenis: 'Perbelanjaan',
        kategori: p.kategori,
        penerangan: p.penerangan,
        jumlah: p.jumlah,
      })),
    ].sort((a, b) => b.tarikh.localeCompare(a.tarikh))

    setData({
      pendapatan,
      perbelanjaan,
      pendapatanCawangan,
      perbelanjaanCawangan,
      pendapatanJenis,
      perbelanjaanKategori,
      transaksi,
      bilResit: (resit ?? []).length,
      bilPendapatanLain: (pendapatanLain ?? []).length,
      bilBelanja: (belanja ?? []).length,
    })
    setLoading(false)
  }, [tahun, bulanIdx])

  useEffect(() => {
    muatData()
  }, [muatData])

  const keuntungan = (data?.pendapatan ?? 0) - (data?.perbelanjaan ?? 0)
  const labelTempoh = bulanIdx ? `${BULAN_MS[+bulanIdx - 1]} ${tahun}` : `Tahun ${tahun}`

  const eksportCSV = () => {
    if (!data) return
    const headers = ['Tarikh', 'Jenis', 'Kategori', 'Penerangan', 'Pendapatan (RM)', 'Perbelanjaan (RM)']
    const rows = data.transaksi.map((t) => [
      t.tarikh,
      t.jenis,
      t.kategori,
      `"${t.penerangan.replace(/"/g, '""')}"`,
      t.jenisTxn === 'masuk' ? t.jumlah.toFixed(2) : '',
      t.jenisTxn === 'keluar' ? t.jumlah.toFixed(2) : '',
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LaporanKewangan_${labelTempoh.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV laporan kewangan dimuat turun — semak folder Downloads.')
  }

  return (
    <div>
      {/* Month picker */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '28px' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Pilih Tempoh
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={bulanIdx}
              onChange={(e) => setBulanIdx(e.target.value)}
              style={gayaPilih}
            >
              <option value="">Semua Bulan</option>
              {BULAN_MS.map((nama, i) => (
                <option key={nama} value={String(i + 1)}>{nama}</option>
              ))}
            </select>
            <select
              value={tahun}
              onChange={(e) => setTahun(+e.target.value)}
              style={gayaPilih}
            >
              {Array.from({ length: tahunSemasa - 2024 }, (_, i) => 2025 + i).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <Link
          href="/kewangan/perbelanjaan"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 14px',
            background: 'var(--bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text)',
            textDecoration: 'none',
          }}
        >
          <Plus size={13} /> Rekod Perbelanjaan
        </Link>
        <Link
          href="/kewangan/pendapatan"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 14px',
            background: 'var(--bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text)',
            textDecoration: 'none',
          }}
        >
          <Plus size={13} /> Rekod Pendapatan
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {!loading && (data?.transaksi.length ?? 0) > 0 && (
            <button
              onClick={eksportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Download size={13} /> Eksport CSV
            </button>
          )}
          <BtnLaporanLHDN />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Memuatkan...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
            <KadStat
              label="Pendapatan"
              jumlah={data!.pendapatan}
              sub={`${data!.bilResit} resit${data!.bilPendapatanLain > 0 ? ` + ${data!.bilPendapatanLain} lain` : ''}`}
              warna="#166534"
              bg="#F0FDF4"
              border="#86EFAC"
              Icon={TrendingUp}
            />
            <KadStat
              label="Perbelanjaan"
              jumlah={data!.perbelanjaan}
              sub={`${data!.bilBelanja} rekod`}
              warna="#9F1239"
              bg="#FFF1F2"
              border="#FECDD3"
              Icon={TrendingDown}
            />
            <KadStat
              label="Keuntungan Bersih"
              jumlah={keuntungan}
              sub={keuntungan >= 0 ? 'Untung' : 'Rugi'}
              warna={keuntungan >= 0 ? '#1E40AF' : '#9F1239'}
              bg={keuntungan >= 0 ? '#EFF6FF' : '#FFF1F2'}
              border={keuntungan >= 0 ? '#BFDBFE' : '#FECDD3'}
              Icon={Minus}
            />
          </div>

          {/* Pecahan per Cawangan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <KadPecahan
              judul="Pendapatan per Cawangan"
              data={data!.pendapatanCawangan}
              warnaBar="#84CC16"
            />
            <KadPecahan
              judul="Perbelanjaan per Cawangan"
              data={data!.perbelanjaanCawangan}
              warnaBar="#F87171"
            />
          </div>

          {/* Pecahan per Jenis / Kategori */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <KadPecahan judul="Pendapatan mengikut Jenis" data={data!.pendapatanJenis} warnaBar="#84CC16" />
            <KadPecahan judul="Perbelanjaan mengikut Kategori" data={data!.perbelanjaanKategori} warnaBar="#F87171" />
          </div>

          {/* Senarai Transaksi */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', marginTop: '24px' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
                Senarai Transaksi — {labelTempoh}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{data!.transaksi.length} rekod</span>
            </div>

            {data!.transaksi.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                Tiada transaksi untuk tempoh ini.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                      {['Tarikh', 'Jenis', 'Kategori', 'Penerangan', 'Jumlah'].map((h) => (
                        <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data!.transaksi.map((t, i) => (
                      <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatTarikh(t.tarikh)}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            fontSize: '11.5px', padding: '3px 9px', borderRadius: '20px', fontWeight: 600,
                            background: t.jenisTxn === 'masuk' ? 'var(--hadir-bg)' : '#FFF1F2',
                            color: t.jenisTxn === 'masuk' ? 'var(--hadir-text)' : '#9F1239',
                          }}>
                            {t.jenis}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>{t.kategori}</td>
                        <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text)' }}>{t.penerangan}</td>
                        <td style={{ padding: '10px 14px', fontSize: '13.5px', fontWeight: 700, color: t.jenisTxn === 'masuk' ? '#166534' : '#9F1239', whiteSpace: 'nowrap' }}>
                          {t.jenisTxn === 'masuk' ? '+' : '-'}{formatRinggit(t.jumlah)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function KadStat({
  label,
  jumlah,
  sub,
  warna,
  bg,
  border,
  Icon,
}: {
  label: string
  jumlah: number
  sub: string
  warna: string
  bg: string
  border: string
  Icon: React.ElementType
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '16px',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: warna,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          {label}
        </span>
        <Icon size={15} style={{ color: warna, opacity: 0.6 }} />
      </div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: warna, letterSpacing: '-0.5px', marginBottom: '4px' }}>
        {formatRinggit(jumlah)}
      </div>
      <div style={{ fontSize: '11.5px', color: warna, opacity: 0.65 }}>{sub}</div>
    </div>
  )
}

function KadPecahan({
  judul,
  data,
  warnaBar,
}: {
  judul: string
  data: Record<string, number>
  warnaBar: string
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const maxVal = Math.max(...entries.map((e) => e[1]), 1)

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '18px 20px',
      }}
    >
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: '16px',
        }}
      >
        {judul}
      </h3>

      {entries.length === 0 ? (
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
          Tiada data untuk bulan ini
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map(([nama, jumlah]) => (
            <div key={nama}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '5px',
                }}
              >
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text)' }}>{nama}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatRinggit(jumlah)}</span>
              </div>
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: '4px',
                  height: '6px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(jumlah / maxVal) * 100}%`,
                    height: '100%',
                    background: warnaBar,
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
