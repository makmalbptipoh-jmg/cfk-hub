import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9.5, padding: '28px 34px 40px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #1E293B' },
  logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  tajukBesar: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginBottom: 3 },
  subjudul: { fontSize: 10, color: '#64748B' },

  seksyen: { marginBottom: 14 },
  seksyenTajuk: { fontSize: 11.5, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  seksyenMeta: { fontSize: 8.5, color: '#64748B', marginTop: 1, marginBottom: 5 },

  jadual: { border: '1px solid #E2E8F0', borderRadius: 4, overflow: 'hidden' },
  barisHeader: { flexDirection: 'row', backgroundColor: '#1E293B' },
  selHeader: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', padding: '5px 7px', letterSpacing: 0.3 },
  selHeaderTengah: { textAlign: 'center' },
  baris: { flexDirection: 'row', borderTop: '1px solid #E2E8F0' },
  barisGenap: { backgroundColor: '#F8FAFC' },
  sel: { fontSize: 8.5, padding: '5px 7px', color: '#0F172A' },
  selStatus: { fontSize: 8, fontFamily: 'Helvetica-Bold', padding: '5px 4px', textAlign: 'center' },
  selKod: { fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center', padding: '5px 2px' },

  legenda: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  kotak: { width: 10, height: 10, borderRadius: 2 },
  legendaText: { fontSize: 8, color: '#64748B' },
  nota: { fontSize: 8, color: '#94A3B8', marginTop: 10 },
  footer: { position: 'absolute', bottom: 22, left: 34, right: 34, paddingTop: 8, borderTop: '1px solid #E2E8F0', flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, color: '#94A3B8' },
})

type Status = 'Belum' | 'Sedang' | 'Selesai'

const WARNA: Record<Status, { bg: string; t: string }> = {
  Selesai: { bg: '#DCFCE7', t: '#166534' },
  Sedang: { bg: '#FEF9C3', t: '#854D0E' },
  Belum: { bg: '#F8FAFC', t: '#94A3B8' },
}
const KOD: Record<Status, string> = { Selesai: 'S', Sedang: 'P', Belum: '' }

export type TajukPdf = {
  nama: string
  nota: string
  subtajuk: { nama: string; statuses: Status[] }[] // statuses selari dgn cawanganNama
}

type Props = {
  mode: 'satu' | 'semua'
  cawanganLabel: string // "Klebang" atau "Semua Cawangan"
  cawanganNama: string[] // kolum (mod semua) / satu elemen (mod satu)
  tajuk: TajukPdf[]
  tarikhJana: string
}

function ringkas(subs: TajukPdf['subtajuk'], idx: number) {
  const jumlah = subs.length
  const selesai = subs.filter((x) => x.statuses[idx] === 'Selesai').length
  const sedang = subs.filter((x) => x.statuses[idx] === 'Sedang').length
  return { jumlah, selesai, sedang, peratus: jumlah ? Math.round((selesai / jumlah) * 100) : 0 }
}

export function LaporanSilibusIndukPDF({ mode, cawanganLabel, cawanganNama, tajuk, tarikhJana }: Props) {
  const landscape = mode === 'semua'
  const jumlahSub = tajuk.reduce((a, t) => a + t.subtajuk.length, 0)

  return (
    <Document title={`Silibus Kurikulum — ${cawanganLabel}`} author="CFK HUB">
      <Page size="A4" orientation={landscape ? 'landscape' : 'portrait'} style={s.page}>
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image src={LOGO_CFK} style={{ height: 42, width: 52 }} />
            <View>
              <Text style={s.logoText}>CFK HUB</Text>
              <Text style={s.logoSub}>Catur Untuk Kanak-Kanak</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.tajukBesar}>SILIBUS KURIKULUM &amp; PROGRESS</Text>
            <Text style={s.subjudul}>{cawanganLabel} · {jumlahSub} subtajuk</Text>
          </View>
        </View>

        {tajuk.length === 0 ? (
          <Text style={s.nota}>Tiada Tajuk Besar dengan subtajuk untuk dilaporkan.</Text>
        ) : (
          tajuk.map((t, ti) => (
            <View key={ti} style={s.seksyen} wrap={false}>
              <Text style={s.seksyenTajuk}>{t.nama}</Text>
              <Text style={s.seksyenMeta}>
                {t.subtajuk.length} subtajuk
                {mode === 'satu' && (() => { const r = ringkas(t.subtajuk, 0); return ` · ${r.selesai}/${r.jumlah} selesai (${r.peratus}%)${r.sedang ? ` · ${r.sedang} sedang` : ''}` })()}
                {t.nota ? ` · ${t.nota}` : ''}
              </Text>

              <View style={s.jadual}>
                {/* Header jadual */}
                <View style={s.barisHeader}>
                  <Text style={[s.selHeader, { flex: mode === 'semua' ? 4 : 6 }]}>SUBTAJUK</Text>
                  {mode === 'satu' ? (
                    <Text style={[s.selHeader, s.selHeaderTengah, { flex: 1.6 }]}>STATUS</Text>
                  ) : (
                    cawanganNama.map((c, ci) => (
                      <Text key={ci} style={[s.selHeader, s.selHeaderTengah, { flex: 1 }]}>{c}</Text>
                    ))
                  )}
                </View>

                {/* Baris subtajuk */}
                {t.subtajuk.map((sub, si) => (
                  <View key={si} style={si % 2 === 1 ? [s.baris, s.barisGenap] : s.baris}>
                    <Text style={[s.sel, { flex: mode === 'semua' ? 4 : 6 }]}>{sub.nama}</Text>
                    {mode === 'satu' ? (
                      <View style={[{ flex: 1.6, backgroundColor: WARNA[sub.statuses[0]].bg, justifyContent: 'center' }]}>
                        <Text style={[s.selStatus, { color: WARNA[sub.statuses[0]].t }]}>{sub.statuses[0]}</Text>
                      </View>
                    ) : (
                      sub.statuses.map((st, ci) => (
                        <View key={ci} style={[{ flex: 1, backgroundColor: WARNA[st].bg, justifyContent: 'center', borderLeft: '1px solid #E2E8F0' }]}>
                          <Text style={[s.selKod, { color: WARNA[st].t }]}>{KOD[st]}</Text>
                        </View>
                      ))
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        {mode === 'semua' && tajuk.length > 0 && (
          <View style={s.legenda}>
            <View style={s.legendaItem}><View style={[s.kotak, { backgroundColor: WARNA.Selesai.bg }]} /><Text style={s.legendaText}>S = Selesai</Text></View>
            <View style={s.legendaItem}><View style={[s.kotak, { backgroundColor: WARNA.Sedang.bg }]} /><Text style={s.legendaText}>P = Sedang diajar</Text></View>
            <View style={s.legendaItem}><View style={[s.kotak, { backgroundColor: WARNA.Belum.bg }]} /><Text style={s.legendaText}>kosong = Belum</Text></View>
          </View>
        )}

        <Text style={s.nota}>
          {tajuk.length} Tajuk Besar · {jumlahSub} subtajuk. {mode === 'satu' ? `Progress untuk cawangan ${cawanganLabel}.` : 'Setiap lajur = satu cawangan.'}
        </Text>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Laporan dalaman CFK — kurikulum silibus &amp; progress pengajaran.</Text>
          <Text style={s.footerText}>Dijana oleh CFK HUB pada {tarikhJana}</Text>
        </View>
      </Page>
    </Document>
  )
}
