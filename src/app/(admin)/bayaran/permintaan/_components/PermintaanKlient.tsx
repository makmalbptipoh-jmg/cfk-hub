'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Copy, Check } from 'lucide-react'
import { formatRinggit } from '@/lib/utils'
import { semakStatusPermintaan } from '@/app/actions/bayaran-online'

type Permintaan = {
  id: string
  bill_code: string
  nama_pelajar: string
  no_telefon: string | null
  jenis: string
  bulan_bayaran: string
  tahun_bayaran: number
  jumlah: number
  status: 'Menunggu' | 'Selesai' | 'Gagal'
  resit_id: string | null
  created_at: string
  dibayar_pada: string | null
  url: string
}

const WARNA_STATUS: Record<string, { bg: string; teks: string; label: string }> = {
  Menunggu: { bg: '#FEF9C3', teks: '#854D0E', label: 'Menunggu Bayaran' },
  Selesai: { bg: '#DCFCE7', teks: '#166534', label: 'Selesai · Resit Dijana' },
  Gagal: { bg: '#FEE2E2', teks: '#991B1B', label: 'Gagal' },
}

export function PermintaanKlient({ senarai }: { senarai: Permintaan[] }) {
  const router = useRouter()
  const [tapis, setTapis] = useState<'Semua' | 'Menunggu' | 'Selesai' | 'Gagal'>('Semua')
  const [pending, startTransition] = useTransition()
  const [sedangSemak, setSedangSemak] = useState<string | null>(null)
  const [disalin, setDisalin] = useState<string | null>(null)
  const [mesej, setMesej] = useState<string | null>(null)

  const ditapis = senarai.filter((p) => tapis === 'Semua' || p.status === tapis)

  const kira = {
    Menunggu: senarai.filter((p) => p.status === 'Menunggu').length,
    Selesai: senarai.filter((p) => p.status === 'Selesai').length,
    Gagal: senarai.filter((p) => p.status === 'Gagal').length,
  }

  const semak = (billCode: string) => {
    setSedangSemak(billCode)
    setMesej(null)
    startTransition(async () => {
      const res = await semakStatusPermintaan(billCode)
      if (res.ralat) setMesej(res.ralat)
      else if (res.status === 'Selesai') setMesej(`Bayaran disahkan! Resit ${res.nombor_resit ?? ''} dijana.`)
      else setMesej(res.nota ?? `Status: ${res.status}`)
      setSedangSemak(null)
      router.refresh()
    })
  }

  const salin = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setDisalin(id)
      setTimeout(() => setDisalin(null), 2000)
    } catch {}
  }

  const waMsg = (p: Permintaan) =>
    encodeURIComponent(
      `Assalamualaikum. Ini pautan untuk bayar yuran catur CFK bagi ${p.nama_pelajar} (${p.bulan_bayaran} ${p.tahun_bayaran}) berjumlah ${formatRinggit(p.jumlah)}.\n\nSila klik untuk bayar (FPX / DuitNow):\n${p.url}\n\nResit rasmi akan dihantar selepas bayaran selesai. Terima kasih. 🙏`
    )

  return (
    <div>
      {/* Chip penapis */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {([
          { k: 'Semua' as const, n: senarai.length },
          { k: 'Menunggu' as const, n: kira.Menunggu },
          { k: 'Selesai' as const, n: kira.Selesai },
          { k: 'Gagal' as const, n: kira.Gagal },
        ]).map((c) => {
          const aktif = tapis === c.k
          return (
            <button key={c.k} type="button" onClick={() => setTapis(c.k)}
              style={{
                padding: '7px 14px', borderRadius: '999px', cursor: 'pointer', fontFamily: 'inherit',
                border: `1.5px solid ${aktif ? 'var(--accent)' : 'var(--border)'}`,
                background: aktif ? '#F7FEE7' : 'var(--card)',
                color: aktif ? 'var(--accent-dark)' : 'var(--text-muted)',
                fontSize: '12.5px', fontWeight: aktif ? 700 : 500,
              }}>
              {c.k} ({c.n})
            </button>
          )
        })}
      </div>

      {mesej && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#1E40AF', marginBottom: '16px' }}>
          {mesej}
        </div>
      )}

      {ditapis.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
          Tiada permintaan bayaran online lagi. Jana dari borang <strong>Rekod Bayaran</strong> (pilih kaedah <strong>Online</strong>).
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ditapis.map((p) => {
            const w = WARNA_STATUS[p.status]
            const waTel = (p.no_telefon ?? '').replace(/\D/g, '').replace(/^0/, '60')
            return (
              <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text)' }}>{p.nama_pelajar}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {p.jenis} · {p.bulan_bayaran} {p.tahun_bayaran} · <strong>{formatRinggit(p.jumlah)}</strong>
                    </div>
                  </div>
                  <span style={{ background: w.bg, color: w.teks, fontSize: '11.5px', fontWeight: 700, padding: '5px 11px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                    {w.label}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  {p.status === 'Menunggu' && (
                    <>
                      <button
                        type="button"
                        onClick={() => semak(p.bill_code)}
                        disabled={pending && sedangSemak === p.bill_code}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '8px 14px', borderRadius: '9px', border: 'none',
                          background: 'var(--primary)', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'inherit',
                          opacity: pending && sedangSemak === p.bill_code ? 0.6 : 1,
                        }}
                      >
                        <RefreshCw size={13} className={pending && sedangSemak === p.bill_code ? 'spin' : ''} />
                        {pending && sedangSemak === p.bill_code ? 'Menyemak...' : 'Semak Status'}
                      </button>
                      {waTel && (
                        <a href={`https://wa.me/${waTel}?text=${waMsg(p)}`} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '9px', fontSize: '12.5px', fontWeight: 600, color: '#166534', textDecoration: 'none' }}>
                          Hantar WhatsApp
                        </a>
                      )}
                      <button type="button" onClick={() => salin(p.url, p.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '9px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {disalin === p.id ? <Check size={13} /> : <Copy size={13} />}
                        {disalin === p.id ? 'Disalin' : 'Salin Link'}
                      </button>
                    </>
                  )}
                  {p.status === 'Selesai' && p.resit_id && (
                    <a href={`/bayaran/${p.resit_id}`}
                      style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '9px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
                      Lihat Resit
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`.spin { animation: spin 1s linear infinite } @keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
