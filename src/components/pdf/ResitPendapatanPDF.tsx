import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: '40px 48px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #1E293B' },
  logoText: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  resitBadge: { backgroundColor: '#1E293B', color: '#FFFFFF', padding: '6px 14px', borderRadius: 6, fontSize: 11, fontFamily: 'Helvetica-Bold' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { width: '38%', color: '#64748B', fontSize: 10 },
  value: { flex: 1, color: '#0F172A', fontFamily: 'Helvetica-Bold', fontSize: 10 },
  divider: { borderBottom: '1px solid #E2E8F0', marginVertical: 12 },
  jumlahBox: { backgroundColor: '#F8FAFC', border: '1.5px solid #1E293B', borderRadius: 8, padding: '14px 20px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  jumlahLabel: { fontSize: 11, color: '#64748B' },
  jumlahNilai: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  footer: { marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #E2E8F0' },
  footerText: { fontSize: 9, color: '#64748B', marginBottom: 3 },
})

type Props = {
  no_resit: string
  sumber: string
  kategori: string
  nota: string | null
  jumlah: number
  kaedah: string | null
  tarikh: string
}

function formatRM(amount: number) { return `RM ${amount.toFixed(2)}` }
function formatTarikhPDF(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ResitPendapatanPDF({ no_resit, sumber, kategori, nota, jumlah, kaedah, tarikh }: Props) {
  return (
    <Document title={`Resit ${no_resit}`} author="CFK HUB" creator="CFK HUB">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.logoText}>CHESS FOR KIDS (CFK)</Text>
            <Text style={s.logoSub}>5B, Laluan Klebang 21, Klebang Perdana, 31200 Chemor, Perak</Text>
          </View>
          <Text style={s.resitBadge}>RESIT RASMI</Text>
        </View>

        <View style={[s.section, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }]}>
          <View>
            <Text style={s.sectionTitle}>No. Resit</Text>
            <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 }}>{no_resit}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.sectionTitle}>Tarikh</Text>
            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>{formatTarikhPDF(tarikh)}</Text>
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Diterima Daripada</Text>
          <View style={s.row}>
            <Text style={s.label}>Nama / Organisasi</Text>
            <Text style={s.value}>{sumber}</Text>
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Butiran Bayaran</Text>
          <View style={s.row}>
            <Text style={s.label}>Perkara</Text>
            <Text style={s.value}>{kategori}</Text>
          </View>
          {nota ? (
            <View style={s.row}>
              <Text style={s.label}>Keterangan</Text>
              <Text style={s.value}>{nota}</Text>
            </View>
          ) : null}
          <View style={s.row}>
            <Text style={s.label}>Kaedah Bayaran</Text>
            <Text style={s.value}>{kaedah ?? 'Tunai'}</Text>
          </View>
        </View>

        <View style={s.jumlahBox}>
          <Text style={s.jumlahLabel}>Jumlah Diterima</Text>
          <Text style={s.jumlahNilai}>{formatRM(jumlah)}</Text>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Resit ini dijana secara digital dan tidak memerlukan tandatangan.</Text>
          <Text style={[s.footerText, { marginTop: 6, fontFamily: 'Helvetica-Bold' }]}>Terima kasih atas urusan anda bersama Chess For Kids.</Text>
          <Text style={[s.footerText, { marginTop: 8, color: '#94A3B8', fontSize: 8 }]}>Dijana oleh CFK HUB · {new Date().toLocaleDateString('ms-MY')}</Text>
        </View>
      </Page>
    </Document>
  )
}
