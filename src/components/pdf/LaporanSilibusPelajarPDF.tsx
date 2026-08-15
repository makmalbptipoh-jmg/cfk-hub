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
  tengah: { textAlign: 'center' },
  kanan: { textAlign: 'right' },
  baris: { flexDirection: 'row', borderTop: '1px solid #E2E8F0' },
  barisGenap: { backgroundColor: '#F8FAFC' },
  sel: { fontSize: 8.5, padding: '5px 7px', color: '#0F172A' },
  selStatus: { fontSize: 8, fontFamily: 'Helvetica-Bold', padding: '5px 4px', textAlign: 'center' },

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

export type BarisPelajar = { nama: string; cawangan: string; selesai: number; jumlah: number; peratus: number }
export type TajukPelajarPdf = { nama: string; subtajuk: { nama: string; status: Status; nota: string }[] }

type Props = {
  mode: 'senarai' | 'pelajar'
  tajukLabel: string
  cawanganLabel: string
  tarikhJana: string
  senarai?: BarisPelajar[]
  pelajarNama?: string
  ringkas?: { selesai: number; jumlah: number; peratus: number }
  tajuk?: TajukPelajarPdf[]
}

export function LaporanSilibusPelajarPDF({ mode, tajukLabel, cawanganLabel, tarikhJana, senarai = [], pelajarNama = '', ringkas, tajuk = [] }: Props) {
  return (
    <Document title={`Silibus Pelajar — ${mode === 'pelajar' ? pelajarNama : cawanganLabel}`} author="CFK HUB">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image src={LOGO_CFK} style={{ height: 42, width: 52 }} />
            <View>
              <Text style={s.logoText}>CFK HUB</Text>
              <Text style={s.logoSub}>Catur Untuk Kanak-Kanak</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.tajukBesar}>SILIBUS PELAJAR</Text>
            <Text style={s.subjudul}>{mode === 'pelajar' ? pelajarNama : cawanganLabel}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 9, color: '#64748B', marginBottom: 10 }}>Silibus wajib: {tajukLabel}</Text>

        {mode === 'senarai' ? (
          <View style={s.jadual}>
            <View style={s.barisHeader}>
              <Text style={[s.selHeader, { flex: 0.6 }]}>NO.</Text>
              <Text style={[s.selHeader, { flex: 4 }]}>PELAJAR</Text>
              <Text style={[s.selHeader, { flex: 2.2 }]}>CAWANGAN</Text>
              <Text style={[s.selHeader, s.tengah, { flex: 1.4 }]}>SELESAI</Text>
              <Text style={[s.selHeader, s.kanan, { flex: 1 }]}>%</Text>
            </View>
            {senarai.length === 0 ? (
              <Text style={{ padding: '18px 8px', fontSize: 9, color: '#94A3B8', textAlign: 'center' }}>Tiada pelajar.</Text>
            ) : (
              senarai.map((b, i) => (
                <View key={i} style={i % 2 === 1 ? [s.baris, s.barisGenap] : s.baris}>
                  <Text style={[s.sel, { flex: 0.6 }]}>{i + 1}</Text>
                  <Text style={[s.sel, { flex: 4, fontFamily: 'Helvetica-Bold' }]}>{b.nama}</Text>
                  <Text style={[s.sel, { flex: 2.2 }]}>{b.cawangan}</Text>
                  <Text style={[s.sel, s.tengah, { flex: 1.4 }]}>{b.selesai}/{b.jumlah}</Text>
                  <Text style={[s.sel, s.kanan, { flex: 1, fontFamily: 'Helvetica-Bold' }]}>{b.peratus}%</Text>
                </View>
              ))
            )}
          </View>
        ) : (
          <View>
            {ringkas && (
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 10 }}>
                Progress keseluruhan: {ringkas.selesai}/{ringkas.jumlah} selesai ({ringkas.peratus}%)
              </Text>
            )}
            {tajuk.map((t, ti) => (
              <View key={ti} style={s.seksyen} wrap={false}>
                <Text style={s.seksyenTajuk}>{t.nama}</Text>
                <Text style={s.seksyenMeta}>{t.subtajuk.filter((x) => x.status === 'Selesai').length}/{t.subtajuk.length} selesai</Text>
                <View style={s.jadual}>
                  <View style={s.barisHeader}>
                    <Text style={[s.selHeader, { flex: 5 }]}>SUBTAJUK</Text>
                    <Text style={[s.selHeader, { flex: 1.4 }]}>MS</Text>
                    <Text style={[s.selHeader, s.tengah, { flex: 1.6 }]}>STATUS</Text>
                  </View>
                  {t.subtajuk.map((sub, si) => (
                    <View key={si} style={si % 2 === 1 ? [s.baris, s.barisGenap] : s.baris}>
                      <Text style={[s.sel, { flex: 5 }]}>{sub.nama}</Text>
                      <Text style={[s.sel, { flex: 1.4 }]}>{sub.nota}</Text>
                      <View style={[{ flex: 1.6, backgroundColor: WARNA[sub.status].bg, justifyContent: 'center' }]}>
                        <Text style={[s.selStatus, { color: WARNA[sub.status].t }]}>{sub.status}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={s.nota}>
          {mode === 'senarai' ? `${senarai.length} pelajar · disusun paling tertinggal dahulu.` : `Progress silibus untuk ${pelajarNama}.`}
        </Text>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Laporan dalaman CFK — progress silibus pelajar.</Text>
          <Text style={s.footerText}>Dijana oleh CFK HUB pada {tarikhJana}</Text>
        </View>
      </Page>
    </Document>
  )
}
