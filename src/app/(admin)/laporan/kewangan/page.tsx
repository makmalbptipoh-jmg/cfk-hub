'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan, formatRinggit, formatTarikh, bulanTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'

function bulanInfo(bm: string) {
  const [y, m] = bm.split('-')
  const d = new Date(+y, +m - 1, 1)
  return {
    nama: d.toLocaleString('ms-MY', { month: 'long' }),
    tahun: +y,
    mula: `${y}-${m}-01`,
    akhir: akhirBulan(+y, +m),
  }
}

type Transaksi = {
  tarikh: string
  jenisTxn: 'masuk' | 'keluar'
  jenis: string
  kategori: string
  penerangan: string
  jumlah: number
}

export default function LaporanKewanganPage() {
  const bulanDefault = bulanTempatan()
  const [bulan, setBulan] = useState(bulanDefault)
  const [loading, setLoading] = useState(true)
  const [pendapatan, setPendapatan] = useState(0)
  const [perbelanjaan, setPerbelanjaan] = useState(0)
  const [pendapatanByJenis, setPendapatanByJenis] = useState<Record<string, number>>({})
  const [perbelanjaanByKat, setPerbelanjaanByKat] = useState<Record<string, number>>({})
  const [transaksi, setTransaksi] = useState<Transaksi[]>([])

  const muatData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { nama, tahun, mula, akhir } = bulanInfo(bulan)

    const [{ data: resit }, { data: belanja }, { data: pendapatanLain }] = await Promise.all([
      supabase
        .from('resit')
        .select('id, nombor_resit, jenis, jumlah, tarikh_bayar, kaedah_bayaran, pelajar:pelajar_id(nama_penuh)')
        .eq('bulan_bayaran', nama)
        .eq('tahun_bayaran', tahun)
        .eq('status', 'Aktif')
        .order('tarikh_bayar'),
      supabase
        .from('kewangan_perbelanjaan')
        .select('id, tarikh, kategori, penerangan, jumlah, cawangan:cawangan_id(nama)')
        .gte('tarikh', mula)
        .lte('tarikh', akhir)
        .order('tarikh'),
      supabase
        .from('pendapatan_lain')
        .select('id, tarikh, sumber, kategori, jumlah, nota')
        .gte('tarikh', mula)
        .lte('tarikh', akhir)
        .order('tarikh'),
    ])

    const jumlahPendapatan =
      (resit ?? []).reduce((s, r) => s + r.jumlah, 0) +
      (pendapatanLain ?? []).reduce((s, p) => s + p.jumlah, 0)
    const jumlahBelanja = (belanja ?? []).reduce((s, p) => s + p.jumlah, 0)

    const byJenis: Record<string, number> = {}
    for (const r of resit ?? []) {
      byJenis[r.jenis] = (byJenis[r.jenis] ?? 0) + r.jumlah
    }
    for (const p of pendapatanLain ?? []) {
      byJenis[p.kategori] = (byJenis[p.kategori] ?? 0) + p.jumlah
    }

    const byKat: Record<string, number> = {}
    for (const p of belanja ?? []) {
      byKat[p.kategori] = (byKat[p.kategori] ?? 0) + p.jumlah
    }

    const txnResit: Transaksi[] = (resit ?? []).map((r) => ({
      tarikh: r.tarikh_bayar,
      jenisTxn: 'masuk',
      jenis: 'Pendapatan',
      kategori: r.jenis,
      penerangan: `${r.nombor_resit} — ${(r.pelajar as any)?.nama_penuh ?? ''}`,
      jumlah: r.jumlah,
    }))

    const txnBelanja: Transaksi[] = (belanja ?? []).map((p) => ({
      tarikh: p.tarikh,
      jenisTxn: 'keluar',
      jenis: 'Perbelanjaan',
      kategori: p.kategori,
      penerangan: p.penerangan,
      jumlah: p.jumlah,
    }))

    const txnPendapatanLain: Transaksi[] = (pendapatanLain ?? []).map((p) => ({
      tarikh: p.tarikh,
      jenisTxn: 'masuk',
      jenis: 'Pendapatan Lain',
      kategori: p.kategori,
      penerangan: p.nota ? `${p.sumber} — ${p.nota}` : p.sumber,
      jumlah: p.jumlah,
    }))

    const gabung = [...txnResit, ...txnPendapatanLain, ...txnBelanja].sort((a, b) => b.tarikh.localeCompare(a.tarikh))

    setPendapatan(jumlahPendapatan)
    setPerbelanjaan(jumlahBelanja)
    setPendapatanByJenis(byJenis)
    setPerbelanjaanByKat(byKat)
    setTransaksi(gabung)
    setLoading(false)
  }, [bulan])

  useEffect(() => {
    muatData()
  }, [muatData])

  const keuntungan = pendapatan - perbelanjaan
  const { nama, tahun } = bulanInfo(bulan)

  const eksportCSV = () => {
    const headers = ['Tarikh', 'Jenis', 'Kategori', 'Penerangan', 'Pendapatan (RM)', 'Perbelanjaan (RM)']
    const rows = transaksi.map((t) => [
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
    a.download = `LaporanKewangan_${nama}_${tahun}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV laporan kewangan dimuat turun — semak folder Downloads.')
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Laporan Kewangan
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Pendapatan vs perbelanjaan — {nama} {tahun}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Bulan
            </label>
            <input
              type="month"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              style={{
                padding: '9px 12px',
                border: '1.5px solid var(--border)',
                borderRadius: '10px',
                fontSize: '13.5px',
                color: 'var(--text)',
                background: 'var(--card)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
          {!loading && transaksi.length > 0 && (
            <button
              onClick={eksportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
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
              <Download size={14} /> Eksport CSV
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Memuatkan...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
            <KadStat label="Pendapatan" jumlah={pendapatan} warna="#166534" bg="#F0FDF4" border="#86EFAC" Icon={TrendingUp} />
            <KadStat label="Perbelanjaan" jumlah={perbelanjaan} warna="#9F1239" bg="#FFF1F2" border="#FECDD3" Icon={TrendingDown} />
            <KadStat
              label="Keuntungan Bersih"
              jumlah={keuntungan}
              warna={keuntungan >= 0 ? '#1E40AF' : '#9F1239'}
              bg={keuntungan >= 0 ? '#EFF6FF' : '#FFF1F2'}
              border={keuntungan >= 0 ? '#BFDBFE' : '#FECDD3'}
              Icon={Minus}
            />
          </div>

          {/* Pecahan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <KadPecahan judul="Pendapatan mengikut Jenis" data={pendapatanByJenis} warnaBar="#84CC16" />
            <KadPecahan judul="Perbelanjaan mengikut Kategori" data={perbelanjaanByKat} warnaBar="#F87171" />
          </div>

          {/* Senarai Transaksi */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
                Senarai Transaksi — {nama} {tahun}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{transaksi.length} rekod</span>
            </div>

            {transaksi.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                Tiada transaksi untuk bulan ini.
              </div>
            ) : (
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
                  {transaksi.map((t, i) => (
                    <tr
                      key={i}
                      style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
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
            )}
          </div>
        </>
      )}
    </div>
  )
}

function KadStat({ label, jumlah, warna, bg, border, Icon }: {
  label: string; jumlah: number; warna: string; bg: string; border: string; Icon: React.ElementType
}) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: warna, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        <Icon size={15} style={{ color: warna, opacity: 0.6 }} />
      </div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: warna, letterSpacing: '-0.5px' }}>{formatRinggit(jumlah)}</div>
    </div>
  )
}

function KadPecahan({ judul, data, warnaBar }: { judul: string; data: Record<string, number>; warnaBar: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const maxVal = Math.max(...entries.map((e) => e[1]), 1)
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>{judul}</h3>
      {entries.length === 0 ? (
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>Tiada data</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map(([nama, jumlah]) => (
            <div key={nama}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text)' }}>{nama}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatRinggit(jumlah)}</span>
              </div>
              <div style={{ background: '#F1F5F9', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${(jumlah / maxVal) * 100}%`, height: '100%', background: warnaBar, borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
