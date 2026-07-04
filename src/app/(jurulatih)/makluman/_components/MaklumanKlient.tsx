'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'

type Pelajar = {
  id: string
  nama_penuh: string
  no_telefon: string
  cawangan: string
  bilHadir: number
  perluBayar: boolean
}

interface Props {
  pelajar: Pelajar[]
  bulanSemasa: string
}

type JenisTab = 'yuran' | 'kelas' | 'pertandingan' | 'pembatalan'

const templat: Record<JenisTab, string> = {
  yuran: `Assalamualaikum w.b.t. Salam sejahtera kepada ibu bapa/penjaga yang dihormati,

Sebagai peringatan mesra, yuran kelas catur CFK bagi bulan {{BULAN}} bagi anak anda *{{NAMA}}* belum dijelaskan lagi.

Yuran boleh diselesaikan semasa sesi kelas atau melalui pemindahan bank ke:
🏦 Maybank: 158015108369 (CFK — CHESS FOR KIDS)

Sila hantar bukti pembayaran kepada kami selepas membuat bayaran.

Terima kasih atas kerjasama anda. Budi baik anda amat dihargai. 🙏

— Pasukan CFK`,
  kelas: `Assalamualaikum w.b.t. Salam sejahtera,

Makluman kepada ibu bapa/penjaga pelajar CFK:

📅 Sesi kelas catur akan diadakan seperti biasa.
📍 Tempat: Sila semak dengan jurulatih anda.

Sebarang pertanyaan, sila hubungi kami.

Terima kasih. 🙏

— Pasukan CFK`,
  pertandingan: `Assalamualaikum w.b.t. Salam sejahtera,

Makluman kepada ibu bapa/penjaga pelajar CFK:

🏆 Pertandingan catur akan diadakan tidak lama lagi!

Butiran lanjut akan dimaklumkan kemudian. Sila pastikan anak anda bersedia.

Terima kasih. 🙏

— Pasukan CFK`,
  pembatalan: `Assalamualaikum w.b.t. Salam sejahtera,

Kami ingin memaklumkan bahawa:

❌ Sesi kelas catur hari ini DITANGGUHKAN atas sebab-sebab yang tidak dapat dielakkan.

Sesi gantian akan dimaklumkan kemudian. Mohon maaf atas kesulitan yang ditimbulkan.

Terima kasih atas kefahaman anda. 🙏

— Pasukan CFK`,
}

function noWA(noTel: string) {
  const bersih = noTel.replace(/\D/g, '')
  return bersih.startsWith('60') ? bersih : `60${bersih.replace(/^0/, '')}`
}

export function MaklumanKlient({ pelajar, bulanSemasa }: Props) {
  const [tab, setTab] = useState<JenisTab>('yuran')
  const [teks, setTeks] = useState<Record<JenisTab, string>>(templat)
  const [disalin, setDisalin] = useState(false)
  const [carianYuran, setCarianYuran] = useState('')

  const salinTeks = async () => {
    await navigator.clipboard.writeText(teks[tab])
    setDisalin(true)
    setTimeout(() => setDisalin(false), 2000)
  }

  const pelajarBelumBayar = pelajar.filter((p) => p.perluBayar).filter((p) =>
    !carianYuran || p.nama_penuh.toLowerCase().includes(carianYuran.toLowerCase())
  )

  const tabs: { key: JenisTab; label: string }[] = [
    { key: 'yuran', label: 'Yuran' },
    { key: 'kelas', label: 'Kelas' },
    { key: 'pertandingan', label: 'Pertandingan' },
    { key: 'pembatalan', label: 'Pembatalan' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          Makluman
        </h1>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
          Teks templat untuk dihantar melalui WhatsApp
        </p>
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '2px' }}>
        {tabs.map((t) => {
          const aktif = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: '8px 16px', borderRadius: '20px', whiteSpace: 'nowrap',
                border: `2px solid ${aktif ? 'var(--primary)' : 'var(--border)'}`,
                background: aktif ? 'var(--primary)' : 'transparent',
                color: aktif ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: aktif ? 700 : 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Teks Templat */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Teks Templat
          </span>
          <button onClick={salinTeks}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 14px',
              background: disalin ? 'var(--hadir-bg)' : 'var(--bg)',
              border: `1.5px solid ${disalin ? '#BBF7D0' : 'var(--border)'}`,
              borderRadius: '10px', fontSize: '12.5px', fontWeight: 600,
              color: disalin ? 'var(--hadir-text)' : 'var(--text)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}>
            {disalin ? <><Check size={13} /> Disalin!</> : <><Copy size={13} /> Salin Teks</>}
          </button>
        </div>
        <textarea
          value={teks[tab]}
          onChange={(e) => setTeks((prev) => ({ ...prev, [tab]: e.target.value }))}
          rows={10}
          style={{
            width: '100%', padding: '12px 14px',
            border: '1.5px solid var(--border)', borderRadius: '12px',
            fontSize: '13px', color: 'var(--text)', lineHeight: '1.6',
            background: '#F8FAFC', outline: 'none',
            fontFamily: 'inherit', resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Teks ini boleh diedit. Guna <code style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>{'{{NAMA}}'}</code> dan <code style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>{'{{BULAN}}'}</code> untuk nilai auto.
        </p>
      </div>

      {/* Tab Yuran: Senarai Pelajar Belum Bayar */}
      {tab === 'yuran' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
              Pelajar Belum Bayar — {bulanSemasa}
              <span style={{
                marginLeft: '8px', fontSize: '11.5px', padding: '2px 8px', borderRadius: '20px',
                background: pelajarBelumBayar.length > 0 ? '#FEF3C7' : 'var(--hadir-bg)',
                color: pelajarBelumBayar.length > 0 ? '#92400E' : 'var(--hadir-text)',
                fontWeight: 600,
              }}>
                {pelajar.filter((p) => p.perluBayar).length} pelajar
              </span>
            </span>
            {pelajar.filter((p) => p.perluBayar).length > 5 && (
              <input
                value={carianYuran}
                onChange={(e) => setCarianYuran(e.target.value)}
                placeholder="Cari nama..."
                style={{
                  padding: '6px 12px', border: '1.5px solid var(--border)', borderRadius: '10px',
                  fontSize: '12.5px', color: 'var(--text)', background: 'var(--bg)',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
            )}
          </div>

          {pelajarBelumBayar.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
              <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--hadir-text)' }}>
                Tiada pelajar yang perlu diingatkan!
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Semua pelajar dengan ≥4 kehadiran sudah dijelaskan yuran.
              </p>
            </div>
          ) : (
            pelajarBelumBayar.map((p, i) => {
              const wa = noWA(p.no_telefon)
              const teksPersonal = teks['yuran']
                .replace(/\{\{NAMA\}\}/g, p.nama_penuh)
                .replace(/\{\{BULAN\}\}/g, bulanSemasa)
              const waLink = `https://wa.me/${wa}?text=${encodeURIComponent(teksPersonal)}`
              return (
                <div key={p.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{p.nama_penuh}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {p.cawangan} · {p.bilHadir} sesi hadir · {p.no_telefon}
                    </div>
                  </div>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '7px 14px',
                      background: '#DCFCE7', border: '1px solid #86EFAC',
                      borderRadius: '10px', fontSize: '12.5px', fontWeight: 700,
                      color: '#166534', textDecoration: 'none',
                    }}
                  >
                    <MessageCircle size={13} />
                    WA
                  </a>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Tab lain: Senarai semua pelajar dengan WA link */}
      {tab !== 'yuran' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
              Hantar kepada Pelajar ({pelajar.length})
            </span>
          </div>
          {pelajar.slice(0, 20).map((p, i) => {
            const wa = noWA(p.no_telefon)
            const teksPersonal = teks[tab]
              .replace(/\{\{NAMA\}\}/g, p.nama_penuh)
              .replace(/\{\{BULAN\}\}/g, bulanSemasa)
            const waLink = `https://wa.me/${wa}?text=${encodeURIComponent(teksPersonal)}`
            return (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 16px',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{p.nama_penuh}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '1px' }}>{p.cawangan}</div>
                </div>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '6px 12px',
                    background: '#DCFCE7', border: '1px solid #86EFAC',
                    borderRadius: '9px', fontSize: '12px', fontWeight: 700,
                    color: '#166534', textDecoration: 'none',
                  }}
                >
                  <MessageCircle size={12} />
                  WA
                </a>
              </div>
            )
          })}
          {pelajar.length > 20 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-muted)' }}>
              {pelajar.length - 20} pelajar lagi tidak dipaparkan
            </div>
          )}
        </div>
      )}
    </div>
  )
}
