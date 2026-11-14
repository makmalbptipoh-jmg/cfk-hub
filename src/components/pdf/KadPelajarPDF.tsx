import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: '40px 48px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid #1E293B' },
  logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  badge: { backgroundColor: '#1E293B', color: '#FFFFFF', padding: '6px 14px', borderRadius: 6, fontSize: 11, fontFamily: 'Helvetica-Bold' },
  maklumatBox: { backgroundColor: '#F8FAFC', borderRadius: 6, padding: '10px 14px', marginBottom: 16, flexDirection: 'row', gap: 24 },
  mLabel: { fontSize: 8, color: '#64748B', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  mNilai: { fontSize: 10, color: '#0F172A', fontFamily: 'Helvetica-Bold' },
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  summaryBox: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  sCard: { flex: 1, borderRadius: 8, padding: '12px 14px', border: '1px solid #E2E8F0' },
  sLabel: { fontSize: 8, color: '#64748B', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  sNilai: { fontSize: 20, fontFamily: 'Helvetica-Bold' },
  footer: { marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #E2E8F0' },
  footerText: { fontSize: 8, color: '#94A3B8' },
})

type Props = {
  nama_penuh: string
  cawangan: string
  jenis_kelas: string
  total: { hadir: number; tidak_hadir: number; cuti: number }
  bilResit: number
  tahun: number
}

export function KadPelajarPDF({ nama_penuh, cawangan, jenis_kelas, total, bilResit, tahun }: Props) {
  const jumSesi = total.hadir + total.tidak_hadir + total.cuti
  const peratus = jumSesi > 0 ? Math.round((total.hadir / jumSesi) * 100) : 0

  return (
    <Document title={`Kad Pelajar - ${nama_penuh}`} author="CFK HUB">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image src={LOGO_CFK} style={{ height: 42, width: 52 }} />
            <View>
              <Text style={s.logoText}>CHESS FOR KIDS (CFK)</Text>
              <Text style={s.logoSub}>Catur Untuk Kanak-Kanak</Text>
            </View>
          </View>
          <Text style={s.badge}>KAD PELAJAR {tahun}</Text>
        </View>

        <View style={s.maklumatBox}>
          <View style={{ flex: 1 }}>
            <Text style={s.mLabel}>Nama Pelajar</Text>
            <Text style={s.mNilai}>{nama_penuh}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.mLabel}>Cawangan</Text>
            <Text style={s.mNilai}>{cawangan}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.mLabel}>Jenis Kelas</Text>
            <Text style={s.mNilai}>{jenis_kelas}</Text>
          </View>
        </View>

        {/* Ringkasan Kehadiran */}
        <Text style={s.sectionTitle}>Ringkasan Kehadiran (Sepanjang Masa)</Text>
        <View style={s.summaryBox}>
          <View style={[s.sCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <Text style={[s.sLabel, { color: '#166534' }]}>Hadir</Text>
            <Text style={[s.sNilai, { color: '#166534' }]}>{total.hadir}</Text>
          </View>
          <View style={[s.sCard, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]}>
            <Text style={[s.sLabel, { color: '#9F1239' }]}>Tidak Hadir</Text>
            <Text style={[s.sNilai, { color: '#9F1239' }]}>{total.tidak_hadir}</Text>
          </View>
          <View style={[s.sCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <Text style={[s.sLabel, { color: '#92400E' }]}>Cuti</Text>
            <Text style={[s.sNilai, { color: '#92400E' }]}>{total.cuti}</Text>
          </View>
          <View style={[s.sCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Text style={[s.sLabel, { color: '#1E40AF' }]}>Kadar Hadir</Text>
            <Text style={[s.sNilai, { color: '#1E40AF' }]}>{peratus}%</Text>
          </View>
        </View>

        <Text style={{ fontSize: 9, color: '#64748B' }}>Jumlah resit bayaran aktif: {bilResit}</Text>

        <View style={s.footer}>
          <Text style={s.footerText}>Dijana oleh CFK HUB pada {new Date().toLocaleDateString('ms-MY')}. Kad ini ringkasan kehadiran pelajar.</Text>
        </View>
      </Page>
    </Document>
  )
}
