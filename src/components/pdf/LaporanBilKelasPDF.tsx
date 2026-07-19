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
  sel: { fontSize: 9.5, padding: '7px 8px', color: '#0F172A' },
  selNombor: { textAlign: 'center' },
  selBatal: { color: '#DC2626' },
  barisJumlah: { flexDirection: 'row', borderTop: '2px solid #1E293B', backgroundColor: '#F1F5F9' },
  selJumlah: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', padding: '8px 8px', color: '#0F172A' },
  nota: { fontSize: 8, color: '#94A3B8', marginTop: 10 },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, paddingTop: 8, borderTop: '1px solid #E2E8F0', flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, color: '#94A3B8' },
})

// Lebar kolum: Cawangan lebar, 4 kolum nombor sama lebar
const L = { cawangan: 2.4, nombor: 1 }

export type BarisBilKelas = {
  cawangan: string
  kumpulan: number
  ganti: number
  dibatalkan: number
  jumlah: number
}

type Props = {
  bulanLabel: string // cth. "Julai 2026"
  baris: BarisBilKelas[]
  jumlahBesar: Omit<BarisBilKelas, 'cawangan'>
  tarikhJana: string // cth. "18/07/2026"
}

export function LaporanBilKelasPDF({ bulanLabel, baris, jumlahBesar, tarikhJana }: Props) {
  return (
    <Document title={`Laporan Bilangan Kelas — ${bulanLabel}`} author="CFK HUB">
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
            <Text style={s.tajuk}>LAPORAN BILANGAN KELAS</Text>
            <Text style={s.subjudul}>{bulanLabel}</Text>
          </View>
        </View>

        <View style={s.jadual}>
          <View style={s.barisHeader}>
            <Text style={[s.selHeader, { flex: L.cawangan }]}>CAWANGAN</Text>
            <Text style={[s.selHeader, s.selNombor, { flex: L.nombor }]}>KUMPULAN</Text>
            <Text style={[s.selHeader, s.selNombor, { flex: L.nombor }]}>KELAS GANTI</Text>
            <Text style={[s.selHeader, s.selNombor, { flex: L.nombor }]}>DIBATALKAN</Text>
            <Text style={[s.selHeader, s.selNombor, { flex: L.nombor }]}>JUMLAH</Text>
          </View>
          {baris.map((b, i) => (
            <View key={i} style={i % 2 === 1 ? [s.baris, s.barisGenap] : s.baris}>
              <Text style={[s.sel, { flex: L.cawangan, fontFamily: 'Helvetica-Bold' }]}>{b.cawangan}</Text>
              <Text style={[s.sel, s.selNombor, { flex: L.nombor }]}>{b.kumpulan}</Text>
              <Text style={[s.sel, s.selNombor, { flex: L.nombor }]}>{b.ganti}</Text>
              <Text style={b.dibatalkan > 0 ? [s.sel, s.selNombor, s.selBatal, { flex: L.nombor }] : [s.sel, s.selNombor, { flex: L.nombor }]}>
                {b.dibatalkan > 0 ? `-${b.dibatalkan}` : '0'}
              </Text>
              <View style={{ flex: L.nombor }}>
                <Text style={[s.sel, s.selNombor, { fontFamily: 'Helvetica-Bold', paddingBottom: 0 }]}>{b.jumlah}</Text>
                {b.dibatalkan > 0 ? (
                  <Text style={{ fontSize: 6.5, color: '#94A3B8', textAlign: 'center', paddingBottom: 5 }}>
                    ({b.jumlah + b.dibatalkan} - {b.dibatalkan})
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
          <View style={s.barisJumlah}>
            <Text style={[s.selJumlah, { flex: L.cawangan }]}>JUMLAH BESAR</Text>
            <Text style={[s.selJumlah, s.selNombor, { flex: L.nombor }]}>{jumlahBesar.kumpulan}</Text>
            <Text style={[s.selJumlah, s.selNombor, { flex: L.nombor }]}>{jumlahBesar.ganti}</Text>
            <Text style={jumlahBesar.dibatalkan > 0 ? [s.selJumlah, s.selNombor, s.selBatal, { flex: L.nombor }] : [s.selJumlah, s.selNombor, { flex: L.nombor }]}>
              {jumlahBesar.dibatalkan > 0 ? `-${jumlahBesar.dibatalkan}` : '0'}
            </Text>
            <Text style={[s.selJumlah, s.selNombor, { flex: L.nombor }]}>{jumlahBesar.jumlah}</Text>
          </View>
        </View>

        <Text style={s.nota}>
          Jumlah = kelas dijadualkan TOLAK yang dibatalkan (+ Kelas Ganti). Kiraan berdasarkan jadual kelas semasa.
        </Text>

        <View style={s.footer}>
          <Text style={s.footerText}>Laporan dalaman CFK — bilangan kelas dijadualkan mengikut cawangan.</Text>
          <Text style={s.footerText}>Dijana oleh CFK HUB pada {tarikhJana}</Text>
        </View>
      </Page>
    </Document>
  )
}
