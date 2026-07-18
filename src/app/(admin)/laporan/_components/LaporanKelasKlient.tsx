'use client'

import { useState, useEffect } from 'react'
import { Users, Download, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { akhirBulan, tarikhTempatan, bulanTempatan, HARI, hariMinggu } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import type { BarisKelas } from '@/components/pdf/LaporanKelasPDF'

type Cawangan = { id: string; nama: string }
type Mod = 'harian' | 'bulanan'

function namaBulan(bulan1hingga12: number) {
  return new Date(2000, bulan1hingga12 - 1, 1).toLocaleString('ms-MY', { month: 'long' })
}
function tarikhPanjang(tarikh: string) {
  const [y, m, d] = tarikh.split('-').map(Number)
  return `${d} ${namaBulan(m)} ${y}`
}

type Hasil = {
  mod: Mod
  cawanganNama: string
  tempoh: string
  tarikhKolum: string[]
  tarikhPenuh: string[]
  baris: BarisKelas[]
}

type RekodMentah = {
  pelajar_id: string
  tarikh: string
  status: string
  nota: string | null
  pelajar: { nama_penuh: string; jenis_kelas: string } | null
}

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: '12px',
  fontSize: '13.5px', color: 'var(--text)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}

export function LaporanKelasKlient() {
  const [cawangan, setCawangan] = useState<Cawangan[]>([])
  const [cawId, setCawId] = useState('')
  const [mod, setMod] = useState<Mod>('harian')
  const [tarikhInput, setTarikhInput] = useState(tarikhTempatan())
  const [bulanInput, setBulanInput] = useState(bulanTempatan())
  const [hariInput, setHariInput] = useState('') // '' = semua hari
  const [hasil, setHasil] = useState<Hasil | null>(null)
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [xlsLoading, setXlsLoading] = useState(false)

  useEffect(() => {
    createClient().from('cawangan').select('id, nama').eq('status', 'Aktif').order('nama').then(({ data }) => setCawangan(data ?? []))
  }, [])

  const jana = async () => {
    if (!cawId) return
    setLoading(true)
    setHasil(null)

    const supabase = createClient()
    const cawanganNama = cawangan.find((c) => c.id === cawId)?.nama ?? '—'
    const [yr, mo] = bulanInput.split('-').map(Number)

    let q = supabase
      .from('kehadiran')
      .select('pelajar_id, tarikh, status, nota, pelajar:pelajar_id(nama_penuh, jenis_kelas)')
      .eq('cawangan_sesi_id', cawId)

    q = mod === 'harian'
      ? q.eq('tarikh', tarikhInput)
      : q.gte('tarikh', `${bulanInput}-01`).lte('tarikh', akhirBulan(yr, mo))

    const { data, error } = await q
    if (error) {
      console.error(error)
      toast.error('Gagal ambil rekod kehadiran. Cuba lagi.')
      setLoading(false)
      return
    }

    let rekod = ((data ?? []) as unknown as RekodMentah[]).filter((r) => r.pelajar)
    if (mod === 'bulanan' && hariInput !== '') {
      rekod = rekod.filter((r) => hariMinggu(r.tarikh) === Number(hariInput))
    }

    if (mod === 'harian') {
      const baris: BarisKelas[] = rekod
        .map((r) => ({
          nama_penuh: r.pelajar!.nama_penuh,
          jenis_kelas: r.pelajar!.jenis_kelas,
          status: r.status as BarisKelas['status'],
          nota: r.nota,
          hadir: r.status === 'Hadir' ? 1 : 0,
          tidakHadir: r.status === 'Tidak Hadir' ? 1 : 0,
          cuti: r.status === 'Cuti' ? 1 : 0,
          peratus: r.status === 'Hadir' ? 100 : 0,
        }))
        .sort((a, b) => a.nama_penuh.localeCompare(b.nama_penuh))

      setHasil({
        mod: 'harian',
        cawanganNama,
        tempoh: `${tarikhPanjang(tarikhInput)} (${HARI[hariMinggu(tarikhInput)]})`,
        tarikhKolum: [],
        tarikhPenuh: [tarikhInput],
        baris,
      })
      setLoading(false)
      return
    }

    // Bulanan — grid tarikh x nama
    const tarikhPenuh = [...new Set(rekod.map((r) => r.tarikh))].sort()
    const pelajarMap = new Map<string, { nama: string; jenis: string; tanda: Record<string, string> }>()
    for (const r of rekod) {
      const p = pelajarMap.get(r.pelajar_id) ?? { nama: r.pelajar!.nama_penuh, jenis: r.pelajar!.jenis_kelas, tanda: {} }
      p.tanda[r.tarikh] = r.status === 'Hadir' ? 'H' : r.status === 'Tidak Hadir' ? 'T' : 'C'
      pelajarMap.set(r.pelajar_id, p)
    }

    const baris: BarisKelas[] = [...pelajarMap.values()]
      .map((p) => {
        const tanda = tarikhPenuh.map((t) => p.tanda[t] ?? '-')
        const hadir = tanda.filter((t) => t === 'H').length
        const tidakHadir = tanda.filter((t) => t === 'T').length
        const cuti = tanda.filter((t) => t === 'C').length
        const jumlahSesi = hadir + tidakHadir + cuti
        return {
          nama_penuh: p.nama,
          jenis_kelas: p.jenis,
          tanda,
          hadir,
          tidakHadir,
          cuti,
          peratus: jumlahSesi > 0 ? Math.round((hadir / jumlahSesi) * 100) : 0,
        }
      })
      .sort((a, b) => a.nama_penuh.localeCompare(b.nama_penuh))

    setHasil({
      mod: 'bulanan',
      cawanganNama,
      tempoh: `${namaBulan(mo)} ${yr}${hariInput !== '' ? ` — Setiap ${HARI[Number(hariInput)]}` : ''}`,
      tarikhKolum: tarikhPenuh.map((t) => String(Number(t.split('-')[2]))),
      tarikhPenuh,
      baris,
    })
    setLoading(false)
  }

  const namaFail = (ext: string) => {
    const bersih = (s: string) => s.replace(/[\\/:*?"<>|—]/g, '-').replace(/\s+/g, '_')
    return `Laporan_Kelas_${bersih(hasil?.cawanganNama ?? '')}_${bersih(hasil?.tempoh ?? '')}.${ext}`
  }

  const unduhPDF = async () => {
    if (!hasil) return
    setPdfLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { LaporanKelasPDF } = await import('@/components/pdf/LaporanKelasPDF')
      const blob = await pdf(
        <LaporanKelasPDF
          cawangan={hasil.cawanganNama}
          tempoh={hasil.tempoh}
          mod={hasil.mod}
          tarikhKolum={hasil.tarikhKolum}
          baris={hasil.baris}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = namaFail('pdf'); a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF laporan kelas dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Refresh (Ctrl+Shift+R) dan cuba lagi.')
    } finally { setPdfLoading(false) }
  }

  const unduhExcel = async () => {
    if (!hasil) return
    setXlsLoading(true)
    try {
      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      wb.creator = 'CFK HUB'
      const ws = wb.addWorksheet('Kehadiran Kelas')

      const tajukKolum = hasil.mod === 'harian'
        ? ['No.', 'Nama Pelajar', 'Jenis', 'Status', 'Nota']
        : ['No.', 'Nama Pelajar', ...hasil.tarikhKolum, 'Hadir', 'T.Hadir', 'Cuti', '%']
      const lebar = hasil.mod === 'harian'
        ? [6, 34, 16, 14, 30]
        : [6, 34, ...hasil.tarikhKolum.map(() => 6), 9, 9, 8, 8]
      ws.columns = lebar.map((width) => ({ width }))

      const akhirHuruf = ws.getColumn(tajukKolum.length).letter
      ws.mergeCells(`A1:${akhirHuruf}1`)
      ws.getCell('A1').value = 'CHESS FOR KIDS (CFK)'
      ws.getCell('A1').font = { bold: true, size: 14 }
      ws.getCell('A1').alignment = { horizontal: 'center' }
      ws.mergeCells(`A2:${akhirHuruf}2`)
      ws.getCell('A2').value = `Laporan Kehadiran Kelas — ${hasil.cawanganNama} — ${hasil.tempoh}`
      ws.getCell('A2').font = { size: 10, italic: true }
      ws.getCell('A2').alignment = { horizontal: 'center' }

      const head = ws.getRow(4)
      tajukKolum.forEach((h, i) => {
        const cell = head.getCell(i + 1)
        cell.value = h
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
        cell.alignment = { horizontal: i >= 2 ? 'center' : 'left' }
      })

      let r = 5
      for (const [i, b] of hasil.baris.entries()) {
        const row = ws.getRow(r)
        row.getCell(1).value = i + 1
        row.getCell(2).value = b.nama_penuh
        if (hasil.mod === 'harian') {
          row.getCell(3).value = b.jenis_kelas
          row.getCell(4).value = b.status ?? '-'
          row.getCell(5).value = b.nota ?? ''
        } else {
          const tanda = b.tanda ?? []
          tanda.forEach((t, j) => {
            const cell = row.getCell(3 + j)
            cell.value = t
            cell.alignment = { horizontal: 'center' }
          })
          const asas = 3 + tanda.length
          row.getCell(asas).value = b.hadir
          row.getCell(asas + 1).value = b.tidakHadir
          row.getCell(asas + 2).value = b.cuti
          row.getCell(asas + 3).value = b.peratus / 100
          row.getCell(asas + 3).numFmt = '0%'
        }
        r++
      }

      const total = ws.getRow(r)
      total.getCell(2).value = 'JUMLAH'
      total.getCell(2).font = { bold: true }
      const jumHadir = hasil.baris.reduce((t, b) => t + b.hadir, 0)
      const jumTidak = hasil.baris.reduce((t, b) => t + b.tidakHadir, 0)
      const jumCuti = hasil.baris.reduce((t, b) => t + b.cuti, 0)
      if (hasil.mod === 'harian') {
        total.getCell(4).value = `Hadir ${jumHadir} · Tidak Hadir ${jumTidak} · Cuti ${jumCuti}`
        total.getCell(4).font = { bold: true }
      } else {
        const asas = 3 + hasil.tarikhKolum.length
        total.getCell(asas).value = jumHadir
        total.getCell(asas + 1).value = jumTidak
        total.getCell(asas + 2).value = jumCuti
        const purata = hasil.baris.length > 0 ? hasil.baris.reduce((t, b) => t + b.peratus, 0) / hasil.baris.length / 100 : 0
        total.getCell(asas + 3).value = purata
        total.getCell(asas + 3).numFmt = '0%'
        for (let c = asas; c <= asas + 3; c++) total.getCell(c).font = { bold: true }
      }

      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = namaFail('xlsx'); a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel laporan kelas dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana Excel. Cuba lagi.')
    } finally { setXlsLoading(false) }
  }

  const warnaTanda: Record<string, string> = { H: '#166534', T: '#9F1239', C: '#92400E', '-': '#CBD5E1' }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <Users size={16} style={{ color: 'var(--text)' }} />
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Laporan Per Kelas</h2>
      </div>
      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        Kelas = cawangan + hari (cth. Klebang &middot; Ahad). Pilih mod Harian untuk senarai kehadiran satu tarikh, atau Bulanan untuk rekod penuh sebulan — muat turun PDF atau Excel.
      </p>

      {/* Toggle mod */}
      <div style={{ display: 'inline-flex', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '3px', marginBottom: '16px' }}>
        {(['harian', 'bulanan'] as Mod[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMod(m); setHasil(null) }}
            style={{
              padding: '7px 18px', border: 'none', borderRadius: '9px', fontSize: '12.5px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              background: mod === m ? 'var(--primary)' : 'transparent',
              color: mod === m ? '#FFFFFF' : 'var(--text-muted)',
            }}
          >
            {m === 'harian' ? 'Harian (Satu Tarikh)' : 'Bulanan'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mod === 'bulanan' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '16px', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cawangan</label>
          <select value={cawId} onChange={(e) => { setCawId(e.target.value); setHasil(null) }} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">— Pilih cawangan —</option>
            {cawangan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
        </div>

        {mod === 'harian' ? (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tarikh Kelas</label>
            <input type="date" value={tarikhInput} onChange={(e) => { setTarikhInput(e.target.value); setHasil(null) }} style={inputStyle} />
          </div>
        ) : (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bulan</label>
              <input type="month" value={bulanInput} onChange={(e) => { setBulanInput(e.target.value); setHasil(null) }} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hari Kelas</label>
              <select value={hariInput} onChange={(e) => { setHariInput(e.target.value); setHasil(null) }} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Semua hari</option>
                {HARI.map((h, i) => <option key={h} value={i}>{h}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      <button
        onClick={jana}
        disabled={!cawId || loading}
        style={{ marginTop: '16px', padding: '11px 24px', background: !cawId || loading ? '#94A3B8' : 'var(--primary)', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF', cursor: !cawId || loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Users size={15} />
        {loading ? 'Memuatkan...' : 'Jana Laporan Kelas'}
      </button>

      {hasil && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text)' }}>{hasil.cawanganNama}</strong> · {hasil.tempoh} · {hasil.baris.length} pelajar
              {hasil.mod === 'bulanan' && hasil.tarikhKolum.length > 0 && ` · ${hasil.tarikhKolum.length} sesi`}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={unduhPDF} disabled={pdfLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: pdfLoading ? '#94A3B8' : 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: 'var(--accent-text)', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                <Download size={14} /> {pdfLoading ? 'Jana...' : 'PDF'}
              </button>
              <button onClick={unduhExcel} disabled={xlsLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: 'var(--text)', cursor: xlsLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                <FileSpreadsheet size={14} /> {xlsLoading ? 'Jana...' : 'Excel'}
              </button>
            </div>
          </div>

          {hasil.baris.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', border: '1px solid var(--border)', borderRadius: '12px' }}>
              Tiada rekod kehadiran untuk kelas ini pada tempoh tersebut.
            </div>
          ) : hasil.mod === 'harian' ? (
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                    {['Nama', 'Jenis', 'Status', 'Nota'].map((h) => (
                      <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hasil.baris.map((row, i) => {
                    const warna: Record<string, { bg: string; text: string }> = {
                      Hadir: { bg: 'var(--hadir-bg)', text: 'var(--hadir-text)' },
                      'Tidak Hadir': { bg: 'var(--tidak-hadir-bg)', text: 'var(--tidak-hadir-text)' },
                      Cuti: { bg: 'var(--cuti-bg)', text: 'var(--cuti-text)' },
                    }
                    const w = warna[row.status ?? ''] ?? { bg: 'var(--bg)', text: 'var(--text-muted)' }
                    return (
                      <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: i % 2 === 1 ? '#FAFBFC' : 'transparent' }}>
                        <td style={{ padding: '9px 14px', fontSize: '13px', color: 'var(--text)' }}>{row.nama_penuh}</td>
                        <td style={{ padding: '9px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>{row.jenis_kelas}</td>
                        <td style={{ padding: '9px 14px' }}>
                          <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600, background: w.bg, color: w.text }}>{row.status ?? '—'}</span>
                        </td>
                        <td style={{ padding: '9px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{row.nota || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nama</th>
                    {hasil.tarikhKolum.map((t, i) => (
                      <th key={i} title={hasil.tarikhPenuh[i]} style={{ padding: '9px 6px', textAlign: 'center', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)' }}>{t}</th>
                    ))}
                    {['H', 'T', 'C', '%'].map((h) => (
                      <th key={h} style={{ padding: '9px 8px', textAlign: 'center', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hasil.baris.map((row, i) => (
                    <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: i % 2 === 1 ? '#FAFBFC' : 'transparent' }}>
                      <td style={{ padding: '9px 14px', fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{row.nama_penuh}</td>
                      {(row.tanda ?? []).map((t, j) => (
                        <td key={j} style={{ padding: '9px 6px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: warnaTanda[t] }}>{t}</td>
                      ))}
                      <td style={{ padding: '9px 8px', textAlign: 'center', fontSize: '12.5px', fontWeight: 700, color: '#166534' }}>{row.hadir}</td>
                      <td style={{ padding: '9px 8px', textAlign: 'center', fontSize: '12.5px', color: '#9F1239' }}>{row.tidakHadir}</td>
                      <td style={{ padding: '9px 8px', textAlign: 'center', fontSize: '12.5px', color: '#92400E' }}>{row.cuti}</td>
                      <td style={{ padding: '9px 8px', textAlign: 'center', fontSize: '12.5px', fontWeight: 700, color: '#1E40AF' }}>{row.peratus}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hasil.mod === 'bulanan' && hasil.baris.length > 0 && (
            <p style={{ marginTop: '10px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              H = Hadir · T = Tidak Hadir · C = Cuti · — = tiada rekod. Nombor kolum = tarikh sesi dalam bulan tersebut.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
