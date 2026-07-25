'use client'

import { useState } from 'react'
import {
  ChevronDown, ExternalLink, AlertTriangle, ShieldAlert, KeyRound,
  ClipboardCheck, LifeBuoy, Info, Lock,
} from 'lucide-react'
import {
  PERKHIDMATAN, TAHAP_GAYA, CHECKLIST, KECEMASAN, ENV_VARS,
  type Prosedur,
} from './_data/perkhidmatan'

const mono = {
  textTransform: 'none' as const,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '12px',
}

const kadGaya = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
}

const tajukSeksyen = {
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: '8px',
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: '12px',
  marginTop: '32px',
}

function BlokProsedur({ p }: { p: Prosedur }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
        {p.tajuk}
      </p>
      <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {p.langkah.map((l, i) => (
          <li key={i} style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.55 }}>{l}</li>
        ))}
      </ol>
      {p.amaran && (
        <div style={{
          display: 'flex', gap: '8px', alignItems: 'flex-start',
          marginTop: '10px', padding: '9px 12px',
          background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px',
        }}>
          <AlertTriangle size={14} color="#92400E" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '12px', color: '#92400E', lineHeight: 1.5 }}>{p.amaran}</span>
        </div>
      )}
    </div>
  )
}

export default function PerkhidmatanPage() {
  const [buka, setBuka] = useState<string | null>(null)

  return (
    <div style={{ maxWidth: '860px' }}>
      {/* Pengenalan */}
      <div style={{
        display: 'flex', gap: '10px', alignItems: 'flex-start',
        background: '#F0F9FF', border: '1px solid #BAE6FD',
        borderRadius: '14px', padding: '14px 16px', marginBottom: '22px',
      }}>
        <Info size={16} color="#075985" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ fontSize: '13px', color: '#075985', fontWeight: 700, marginBottom: '4px' }}>
            Perkhidmatan luar yang CFK HUB bergantung padanya
          </p>
          <p style={{ fontSize: '12.5px', color: '#075985', lineHeight: 1.6 }}>
            {PERKHIDMATAN.length} perkhidmatan. Klik mana-mana kad untuk lihat akaun, pautan papan pemuka,
            kos, dan tatacara selenggara langkah demi langkah. Halaman ini rujukan sahaja — tiada kata laluan
            disimpan di sini.
          </p>
        </div>
      </div>

      {/* Legenda tahap */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {(Object.keys(TAHAP_GAYA) as (keyof typeof TAHAP_GAYA)[]).map((t) => {
          const g = TAHAP_GAYA[t]
          const bil = PERKHIDMATAN.filter((p) => p.tahap === t).length
          return (
            <div key={t} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '20px',
              background: g.bg, border: `1px solid ${g.sempadan}`,
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: g.teks }}>{t} ({bil})</span>
              <span style={{ fontSize: '11.5px', color: g.teks, opacity: 0.8 }}>— {g.nota}</span>
            </div>
          )
        })}
      </div>

      {/* Senarai perkhidmatan */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {PERKHIDMATAN.map((p) => {
          const g = TAHAP_GAYA[p.tahap]
          const Ikon = p.ikon
          const terbuka = buka === p.id
          return (
            <div key={p.id} style={{ ...kadGaya, borderColor: terbuka ? 'var(--accent)' : 'var(--border)', overflow: 'hidden' }}>
              {/* Kepala kad */}
              <button
                onClick={() => setBuka(terbuka ? null : p.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '16px 18px', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: g.bg, border: `1px solid ${g.sempadan}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ikon size={18} color={g.teks} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexWrap: 'wrap', marginBottom: '3px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{p.nama}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '20px',
                      background: g.bg, color: g.teks,
                    }}>
                      {p.tahap}
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.untukApa}</p>
                </div>
                <ChevronDown
                  size={18} color="var(--text-muted)"
                  style={{ flexShrink: 0, transform: terbuka ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                />
              </button>

              {/* Butiran */}
              {terbuka && (
                <div style={{ padding: '4px 18px 20px', borderTop: '1px solid var(--border)' }}>
                  {/* Baris fakta */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '10px', margin: '16px 0 18px',
                  }}>
                    <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>AKAUN / USERNAME</p>
                      <p style={{
                        ...mono, fontSize: '12.5px', fontWeight: 600,
                        color: p.akaunBelumDirekod ? '#92400E' : 'var(--text)',
                      }}>
                        {p.akaun}
                      </p>
                    </div>
                    {p.butiran.map((b) => (
                      <div key={b.label} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>{b.label}</p>
                        <p style={{ ...mono, color: 'var(--text)', lineHeight: 1.45 }}>{b.nilai}</p>
                      </div>
                    ))}
                  </div>

                  {/* Pautan */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                    {p.pautan.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '7px 13px', background: 'var(--bg)',
                          border: '1px solid var(--border)', borderRadius: '9px',
                          fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', textDecoration: 'none',
                        }}>
                        {l.label}
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>

                  {/* Kos + kesan gagal */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                    <div style={{ background: '#F7FEE7', border: '1px solid #D9F99D', borderRadius: '10px', padding: '11px 13px' }}>
                      <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '3px' }}>KOS / PELAN</p>
                      <p style={{ fontSize: '12.5px', color: 'var(--accent-dark)', lineHeight: 1.5 }}>{p.kos}</p>
                    </div>
                    <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '11px 13px' }}>
                      <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#9F1239', marginBottom: '3px' }}>KALAU PERKHIDMATAN INI MATI</p>
                      <p style={{ fontSize: '12.5px', color: '#9F1239', lineHeight: 1.5 }}>{p.jikaGagal}</p>
                    </div>
                  </div>

                  {/* Env vars */}
                  {p.env.length > 0 && (
                    <div style={{ marginBottom: '18px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        KUNCI / TETAPAN BERKAITAN (disimpan di Vercel)
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {p.env.map((e) => (
                          <span key={e} style={{
                            ...mono, padding: '4px 9px', borderRadius: '7px',
                            background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)',
                          }}>
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tatacara */}
                  {p.prosedur.length > 0 && (
                    <>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
                        TATACARA SELENGGARA
                      </p>
                      {p.prosedur.map((pr) => <BlokProsedur key={pr.tajuk} p={pr} />)}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Checklist selenggara */}
      <h2 style={tajukSeksyen}>
        <ClipboardCheck size={17} color="var(--accent-dark)" />
        Checklist Selenggara
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
        {CHECKLIST.map((c) => (
          <div key={c.tempoh} style={{ ...kadGaya, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{c.tempoh}</p>
              <span style={{
                fontSize: '10.5px', fontWeight: 700, padding: '2px 9px', borderRadius: '20px',
                background: 'var(--bg)', color: 'var(--text-muted)', whiteSpace: 'nowrap',
              }}>
                {c.nota}
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {c.item.map((i, idx) => (
                <li key={idx} style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.55 }}>{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Kecemasan */}
      <h2 style={tajukSeksyen}>
        <LifeBuoy size={17} color="#9F1239" />
        Bila Berlaku Masalah
      </h2>
      <div style={{ ...kadGaya, padding: '18px 20px' }}>
        {KECEMASAN.map((k) => <BlokProsedur key={k.tajuk} p={k} />)}
        <div style={{
          display: 'flex', gap: '8px', alignItems: 'flex-start',
          padding: '10px 12px', background: 'var(--bg)', borderRadius: '10px',
        }}>
          <ShieldAlert size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Bila hubungi pembangun, sertakan: skrin mana, jam berapa, screenshot ralat, dan apa yang anda buat
            sebelum ia berlaku. Ini menjimatkan banyak masa.
          </span>
        </div>
      </div>

      {/* Env vars */}
      <h2 style={tajukSeksyen}>
        <KeyRound size={17} color="var(--text-muted)" />
        Senarai Kunci &amp; Tetapan (Env Vars)
      </h2>
      <div style={{ ...kadGaya, overflow: 'hidden' }}>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', padding: '14px 18px 12px', lineHeight: 1.55 }}>
          Semua ini diset di Vercel → Settings → Environment Variables. Nilai sebenar TIDAK dipaparkan di sini.
          Selepas tukar mana-mana, wajib Redeploy.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={{ textAlign: 'left', padding: '9px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>NAMA</th>
              <th style={{ textAlign: 'left', padding: '9px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>UNTUK APA</th>
              <th style={{ textAlign: 'left', padding: '9px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>TAHAP</th>
            </tr>
          </thead>
          <tbody>
            {ENV_VARS.map((e) => (
              <tr key={e.nama} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 18px', ...mono, color: 'var(--text)' }}>{e.nama}</td>
                <td style={{ padding: '10px 12px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{e.untuk}</td>
                <td style={{ padding: '10px 18px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '20px',
                    background: e.rahsia ? '#FFF1F2' : 'var(--bg)',
                    color: e.rahsia ? '#9F1239' : 'var(--text-muted)',
                  }}>
                    {e.rahsia ? 'Rahsia besar' : 'Biasa'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Kredensial */}
      <h2 style={tajukSeksyen}>
        <Lock size={17} color="#92400E" />
        Kredensial — Jangan Kongsi, Jangan Hilang
      </h2>
      <div style={{
        background: '#FFFBEB', border: '1px solid #FDE68A',
        borderRadius: '14px', padding: '16px 20px', marginBottom: '40px',
      }}>
        <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            'Kata laluan akaun Google yang digunakan untuk log masuk app (dan untuk Vercel/Supabase/Sentry)',
            'Kata laluan admin app (sandaran, kalau log masuk Google gagal)',
            'Kata laluan pangkalan data Supabase',
            'Secret Key ToyyibPay',
            'Fail .env.local di komputer pembangun — mengandungi semua kunci rahsia',
          ].map((k) => (
            <li key={k} style={{ fontSize: '12.5px', color: '#92400E', lineHeight: 1.55 }}>{k}</li>
          ))}
        </ul>
        <p style={{ fontSize: '12.5px', color: '#92400E', lineHeight: 1.55, marginTop: '12px', fontWeight: 600 }}>
          Simpan semua ini dalam password manager atau nota berkunci. Jangan hantar melalui WhatsApp atau e-mel.
        </p>
      </div>
    </div>
  )
}
