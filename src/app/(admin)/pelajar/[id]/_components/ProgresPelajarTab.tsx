'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Printer, Target, BookOpen, ArrowRight, Library } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatTarikh, tarikhTempatan } from '@/lib/utils'
import { toast } from '@/lib/stores/toast-store'
import {
  TAHAP,
  WARNA_TAHAP,
  kiraRingkasan,
  kumpulIkutKategori,
  type BukuRujukan,
  type KategoriTopik,
  type Tahap,
  type TopikPelajar,
} from '@/lib/progresPelajar'
import { ModalTopik } from './ModalTopik'

export type RekodSilibus = {
  id: string
  tarikh: string
  tajuk: string
  muka_surat: string | null
  nota: string | null
}

type Props = {
  pelajar: { id: string; nama_penuh: string; cawangan_nama: string; jenis_kelas: string }
  topikAwal: TopikPelajar[]
  kategoriAwal: KategoriTopik[]
  bukuAwal: BukuRujukan[]
  silibus: RekodSilibus[]
}

const SELECT_TOPIK =
  'id, kategori_id, tajuk, butiran, tahap, tarikh, tarikh_kuasai, buku_id, muka_surat'

// 'YYYY-MM-DD' → 'DD/MM/YYYY' (untuk PDF)
const tarikhRingkas = (t: string) => t.split('-').reverse().join('/')

export function ProgresPelajarTab({ pelajar, topikAwal, kategoriAwal, bukuAwal, silibus }: Props) {
  const [topik, setTopik] = useState<TopikPelajar[]>(topikAwal)
  const [kategori, setKategori] = useState<KategoriTopik[]>(kategoriAwal)
  const [buku] = useState<BukuRujukan[]>(bukuAwal)
  const [tapisTahap, setTapisTahap] = useState<Tahap | ''>('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [mengemaskini, setMengemaskini] = useState<string | null>(null)
  const [modal, setModal] = useState<{
    buka: boolean
    edit: TopikPelajar | null
    awalan?: { tajuk?: string; muka_surat?: string | null; tarikh?: string; butiran?: string | null }
  }>({ buka: false, edit: null })

  const muatSemula = useCallback(async () => {
    const supabase = createClient()
    const [{ data: t, error }, { data: k }] = await Promise.all([
      supabase
        .from('pelajar_topik')
        .select(SELECT_TOPIK)
        .eq('pelajar_id', pelajar.id)
        .order('tarikh', { ascending: false }),
      supabase.from('topik_kategori').select('id, nama, susunan, status').order('susunan').order('nama'),
    ])
    if (error) { console.error(error); toast.error('Gagal muat semula progress.'); return }
    setTopik((t ?? []) as TopikPelajar[])
    setKategori((k ?? []) as KategoriTopik[])
  }, [pelajar.id])

  // Buang tapisan yang tiada hasil selepas rekod berubah
  useEffect(() => {
    if (tapisTahap && !topik.some((t) => t.tahap === tapisTahap)) setTapisTahap('')
  }, [topik, tapisTahap])

  const ringkasan = kiraRingkasan(topik)
  const dipapar = tapisTahap ? topik.filter((t) => t.tahap === tapisTahap) : topik
  const kumpulan = kumpulIkutKategori(dipapar, kategori)
  const petaBuku = new Map(buku.map((b) => [b.id, b]))

  // Tajuk silibus yang belum ada dalam progress (padanan tajuk, abaikan huruf besar/kecil)
  const tajukSediaAda = new Set(topik.map((t) => t.tajuk.trim().toUpperCase()))
  const silibusBelumMasuk = silibus.filter((s) => !tajukSediaAda.has(s.tajuk.trim().toUpperCase()))

  const tukarTahap = async (t: TopikPelajar, tahapBaharu: Tahap) => {
    setMengemaskini(t.id)
    const { error } = await createClient()
      .from('pelajar_topik')
      .update({
        tahap: tahapBaharu,
        tarikh_kuasai: tahapBaharu === 'Sudah Kuasai' ? (t.tarikh_kuasai ?? tarikhTempatan()) : null,
        dikemaskini_pada: new Date().toISOString(),
      })
      .eq('id', t.id)
    setMengemaskini(null)
    if (error) { console.error(error); toast.error('Gagal tukar tahap. Cuba lagi.'); return }
    toast.success(`"${t.tajuk}" → ${tahapBaharu}`)
    muatSemula()
  }

  const unduhPDF = async () => {
    setPdfLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { LaporanProgresPDF } = await import('@/components/pdf/LaporanProgresPDF')
      // PDF sentiasa penuh (tidak ikut tapisan skrin) supaya laporan lengkap.
      const semua = kumpulIkutKategori(topik, kategori).map((k) => ({
        kategori: k.nama,
        baris: k.topik.map((t) => {
          const b = t.buku_id ? petaBuku.get(t.buku_id) : undefined
          return {
            tarikh: tarikhRingkas(t.tarikh),
            tajuk: t.tajuk,
            butiran: t.butiran ?? '',
            buku: [b?.nama, t.muka_surat].filter(Boolean).join(' · '),
            tahap: t.tahap,
          }
        }),
      }))
      const blob = await pdf(
        <LaporanProgresPDF
          namaPelajar={pelajar.nama_penuh}
          cawangan={pelajar.cawangan_nama}
          jenisKelas={pelajar.jenis_kelas}
          ringkasan={ringkasan}
          kumpulan={semua}
          tarikhJana={tarikhRingkas(tarikhTempatan())}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const bersih = (s: string) => s.replace(/[\\/:*?"<>|—]/g, '-').replace(/\s+/g, '_')
      a.href = url
      a.download = `Progress_${bersih(pelajar.nama_penuh)}_${tarikhTempatan()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF progress dimuat turun.')
    } catch (e) {
      console.error(e)
      toast.error('Gagal jana PDF. Refresh (Ctrl+Shift+R) dan cuba lagi.')
    } finally {
      setPdfLoading(false)
    }
  }

  const btnKecil = {
    display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px',
    background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px',
    fontSize: '12px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Ringkasan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Jumlah Tajuk', nilai: ringkasan.jumlah, bg: 'var(--bg)', text: 'var(--text)' },
          { label: 'Baru Diajar', nilai: ringkasan.baruDiajar, bg: WARNA_TAHAP['Baru Diajar'].bg, text: WARNA_TAHAP['Baru Diajar'].text },
          { label: 'Sedang Latih', nilai: ringkasan.sedangLatih, bg: WARNA_TAHAP['Sedang Latih'].bg, text: WARNA_TAHAP['Sedang Latih'].text },
          { label: 'Sudah Kuasai', nilai: ringkasan.sudahKuasai, bg: WARNA_TAHAP['Sudah Kuasai'].bg, text: WARNA_TAHAP['Sudah Kuasai'].text },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '12px 14px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: s.text }}>{s.nilai}</div>
            <div style={{ fontSize: '11px', color: s.text, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {ringkasan.jumlah > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ background: '#F1F5F9', borderRadius: '6px', height: '8px', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{ width: `${ringkasan.peratusKuasai}%`, height: '100%', background: WARNA_TAHAP['Sudah Kuasai'].text, borderRadius: '6px' }} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>{ringkasan.peratusKuasai}%</strong> tajuk sudah dikuasai
            {' '}({ringkasan.sudahKuasai}/{ringkasan.jumlah}) · {ringkasan.bilKategori} kategori
            {ringkasan.topikTerakhir && <> · terakhir diajar {formatTarikh(ringkasan.topikTerakhir.tarikh)}: <strong style={{ color: 'var(--text)' }}>{ringkasan.topikTerakhir.tajuk}</strong></>}
          </div>
        </div>
      )}

      {/* Tindakan + tapisan */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
        <button
          onClick={() => setModal({ buka: true, edit: null })}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--accent)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <Plus size={15} /> Tambah Topik
        </button>
        {ringkasan.jumlah > 0 && (
          <button onClick={unduhPDF} disabled={pdfLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: pdfLoading ? '#94A3B8' : 'var(--primary)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            <Printer size={14} /> {pdfLoading ? 'Menjana...' : 'Muat Turun PDF'}
          </button>
        )}
        <Link href="/bahan" style={{ ...btnKecil, textDecoration: 'none' }}>
          <Library size={13} /> Bahan &amp; Buku
        </Link>

        {ringkasan.jumlah > 0 && (
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            {(['', ...TAHAP] as const).map((t) => {
              const aktif = tapisTahap === t
              const label = t === '' ? 'Semua' : t
              const w = t === '' ? null : WARNA_TAHAP[t as Tahap]
              return (
                <button key={label} onClick={() => setTapisTahap(t as Tahap | '')}
                  style={{
                    padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    background: aktif ? (w?.bg ?? 'var(--text)') : 'var(--bg)',
                    color: aktif ? (w?.text ?? '#fff') : 'var(--text-muted)',
                    border: `1.5px solid ${aktif ? (w?.border ?? 'var(--text)') : 'var(--border)'}`,
                  }}>
                  {label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Senarai topik ikut kategori */}
      {topik.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '14px' }}>
          <Target size={30} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Belum ada rekod. Klik &quot;Tambah Topik&quot; untuk mula rekod apa yang diajar kepada {pelajar.nama_penuh}.
          </p>
        </div>
      ) : (
        kumpulan.map((k) => (
          <div key={k.nama} style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {k.nama}
              </h3>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: '20px' }}>
                {k.topik.length}
              </span>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {k.topik.map((t) => {
                const w = WARNA_TAHAP[t.tahap]
                const b = t.buku_id ? petaBuku.get(t.buku_id) : undefined
                return (
                  <div key={t.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', background: 'var(--card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{t.tajuk}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', background: w.bg, color: w.text, border: `1px solid ${w.border}` }}>
                            {t.tahap}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {formatTarikh(t.tarikh)}
                          {b && ` · ${b.nama}`}
                          {t.muka_surat && ` · ${t.muka_surat}`}
                          {t.tahap === 'Sudah Kuasai' && t.tarikh_kuasai && ` · dikuasai ${formatTarikh(t.tarikh_kuasai)}`}
                        </div>
                        {t.butiran && (
                          <div style={{ fontSize: '12.5px', color: 'var(--text)', marginTop: '8px', whiteSpace: 'pre-wrap', lineHeight: 1.5, background: 'var(--bg)', borderRadius: '8px', padding: '8px 10px' }}>
                            {t.butiran}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                        <button onClick={() => setModal({ buka: true, edit: t })} style={btnKecil}>
                          <Pencil size={12} /> Edit
                        </button>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {TAHAP.filter((x) => x !== t.tahap).map((x) => (
                            <button key={x} onClick={() => tukarTahap(t, x)} disabled={mengemaskini === t.id}
                              title={`Tukar tahap kepada ${x}`}
                              style={{
                                padding: '5px 9px', borderRadius: '8px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                background: WARNA_TAHAP[x].bg, color: WARNA_TAHAP[x].text, border: `1px solid ${WARNA_TAHAP[x].border}`,
                              }}>
                              → {x}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Rekod Silibus pelajar ini — auto-tarik, baca sahaja */}
      {silibus.length > 0 && (
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <BookOpen size={14} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Dari Rekod Silibus Kelas ({silibus.length})
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Tajuk yang sudah direkod dalam Silibus Kelas untuk pelajar ini.
            {silibusBelumMasuk.length > 0 && ' Klik "Jadikan Topik" untuk masukkan ke dalam progress (boleh set tahap & butiran).'}
          </p>
          <div style={{ display: 'grid', gap: '6px' }}>
            {silibus.map((s) => {
              const sudahAda = tajukSediaAda.has(s.tajuk.trim().toUpperCase())
              return (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', border: '1px solid var(--border)', borderRadius: '10px', padding: '9px 12px', background: sudahAda ? 'var(--bg)' : 'var(--card)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{s.tajuk}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {' · '}{formatTarikh(s.tarikh)}{s.muka_surat ? ` · ${s.muka_surat}` : ''}
                    </span>
                    {s.nota && <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.nota}</div>}
                  </div>
                  {sudahAda ? (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: WARNA_TAHAP['Sudah Kuasai'].text, background: WARNA_TAHAP['Sudah Kuasai'].bg, padding: '3px 10px', borderRadius: '20px' }}>
                      ✓ Dalam progress
                    </span>
                  ) : (
                    <button
                      onClick={() => setModal({
                        buka: true,
                        edit: null,
                        awalan: { tajuk: s.tajuk, muka_surat: s.muka_surat, tarikh: s.tarikh, butiran: s.nota },
                      })}
                      style={btnKecil}
                    >
                      <ArrowRight size={12} /> Jadikan Topik
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {modal.buka && (
        <ModalTopik
          pelajarId={pelajar.id}
          rekodEdit={modal.edit}
          awalan={modal.awalan}
          kategori={kategori}
          buku={buku}
          onTutup={() => setModal({ buka: false, edit: null })}
          onBerjaya={() => { setModal({ buka: false, edit: null }); muatSemula() }}
        />
      )}
    </div>
  )
}
