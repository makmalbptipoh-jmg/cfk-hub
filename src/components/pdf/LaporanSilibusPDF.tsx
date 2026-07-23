import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: '30px 36px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 12, borderBottom: '2px solid #1E293B' },
  logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  tajuk: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginBottom: 3 },
  subjudul: { fontSize: 10, color: '#64748B' },
  jadual: { border: '1px solid #E2E8F0', borderRadius: 6, overflow: 'hidden' },
  barisHeader: { flexDirection: 'row', backgroundColor: '#1E293B' },
  selHeader: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', padding: '7px 8px', letterSpacing: 0.4 },
  baris: { flexDirection: 'row', borderTop: '1px solid #E2E8F0' },
  barisGenap: { backgroundColor: '#F8FAFC' },
  sel: { fontSize: 9, padding: '7px 8px', color: '#0F172A' },
  kosong: { padding: '24px 8px', fontSize: 9.5, color: '#94A3B8', textAlign: 'center' },
  nota: { fontSize: 8, color: '#94A3B8', marginTop: 10 },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, paddingTop: 8, borderTop: '1px solid #E2E8F0', flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, color: '#94A3B8' },
})

// Lebar kolum (flex): Tajuk paling lebar
const L = { tarikh: 1.2, hari: 0.9, cawangan: 2, jenis: 0.9, tajuk: 2.8, mukaSurat: 1.2 }

export type BarisSilibus = {
  tarikh: string // sudah diformat, cth "20/07/2026"
  hari: string // cth "Ahad"
  cawangan: string
  jenis: string
  tajuk: string
  mukaSurat: string
}

type Props = {
  cawanganLabel: string // cth "Klebang" atau "Semua Cawangan"
  bulanLabel: string // cth "Julai 2026"
  baris: BarisSilibus[]
  tarikhJana: string // cth "23/07/2026"
}

export function LaporanSilibusPDF({ cawanganLabel, bulanLabel, baris, tarikhJana }: Props) {
  return (
    <Document title={`Laporan Silibus — ${cawanganLabel} — ${bulanLabel}`} author="CFK HUB">
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
            <Text style={s.tajuk}>LAPORAN SILIBUS KELAS</Text>
            <Text style={s.subjudul}>{cawanganLabel} · {bulanLabel}</Text>
          </View>
        </View>

        <View style={s.jadual}>
          <View style={s.barisHeader}>
            <Text style={[s.selHeader, { flex: L.tarikh }]}>TARIKH</Text>
            <Text style={[s.selHeader, { flex: L.hari }]}>HARI</Text>
            <Text style={[s.selHeader, { flex: L.cawangan }]}>CAWANGAN / PELAJAR</Text>
            <Text style={[s.selHeader, { flex: L.jenis }]}>JENIS</Text>
            <Text style={[s.selHeader, { flex: L.tajuk }]}>TAJUK / SILIBUS</Text>
            <Text style={[s.selHeader, { flex: L.mukaSurat }]}>MUKA SURAT</Text>
          </View>
          {baris.length === 0 ? (
            <Text style={s.kosong}>Tiada rekod silibus untuk tempoh ini.</Text>
          ) : (
            baris.map((b, i) => (
              <View key={i} style={i % 2 === 1 ? [s.baris, s.barisGenap] : s.baris}>
                <Text style={[s.sel, { flex: L.tarikh }]}>{b.tarikh}</Text>
                <Text style={[s.sel, { flex: L.hari }]}>{b.hari}</Text>
                <Text style={[s.sel, { flex: L.cawangan }]}>{b.cawangan}</Text>
                <Text style={[s.sel, { flex: L.jenis }]}>{b.jenis}</Text>
                <Text style={[s.sel, { flex: L.tajuk, fontFamily: 'Helvetica-Bold' }]}>{b.tajuk}</Text>
                <Text style={[s.sel, { flex: L.mukaSurat }]}>{b.mukaSurat || '—'}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={s.nota}>
          Jumlah rekod: {baris.length}. Setiap baris ialah satu tajuk yang diajar pada tarikh berkenaan.
        </Text>

        <View style={s.footer}>
          <Text style={s.footerText}>Laporan dalaman CFK — rekod silibus/tajuk pengajaran mengikut kelas.</Text>
          <Text style={s.footerText}>Dijana oleh CFK HUB pada {tarikhJana}</Text>
        </View>
      </Page>
    </Document>
  )
}
