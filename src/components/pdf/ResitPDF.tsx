import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: '40px 48px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '2px solid #1E293B',
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 22, color: '#84CC16' },
  logoText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', fontFamily: 'Helvetica-Bold' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  resitBadge: {
    backgroundColor: '#1E293B', color: '#FFFFFF',
    padding: '6px 14px', borderRadius: 6,
    fontSize: 11, fontFamily: 'Helvetica-Bold',
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 8, fontFamily: 'Helvetica-Bold',
    color: '#64748B', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 6,
  },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { width: '38%', color: '#64748B', fontSize: 10 },
  value: { flex: 1, color: '#0F172A', fontFamily: 'Helvetica-Bold', fontSize: 10 },
  divider: { borderBottom: '1px solid #E2E8F0', marginVertical: 12 },
  jumlahBox: {
    backgroundColor: '#F8FAFC', border: '1.5px solid #1E293B',
    borderRadius: 8, padding: '14px 20px',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  jumlahLabel: { fontSize: 11, color: '#64748B' },
  jumlahNilai: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTop: '1px solid #E2E8F0',
  },
  footerText: { fontSize: 9, color: '#64748B', marginBottom: 3 },
  watermarkContainer: {
    position: 'absolute',
    top: '38%', left: '15%',
    transform: 'rotate(-35deg)',
  },
  watermark: {
    fontSize: 64, fontFamily: 'Helvetica-Bold',
    color: '#EF4444', opacity: 0.12,
    letterSpacing: 8,
  },
})

type Props = {
  nombor_resit: string
  nama_pelajar: string
  cawangan: string
  jenis: string
  bulan_bayaran: string
  tahun_bayaran: number
  jumlah: number
  kaedah_bayaran: string | null
  tarikh_bayar: string
  status: 'Aktif' | 'Dibatalkan'
  sebab_batal?: string | null
}

function formatRM(amount: number) {
  return `RM ${amount.toFixed(2)}`
}

function formatTarikhPDF(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ResitPDF({
  nombor_resit, nama_pelajar, cawangan,
  jenis, bulan_bayaran, tahun_bayaran,
  jumlah, kaedah_bayaran, tarikh_bayar,
  status, sebab_batal,
}: Props) {
  return (
    <Document title={`Resit ${nombor_resit}`} author="CFK HUB" creator="CFK HUB">
      <Page size="A4" style={s.page}>
        {/* Watermark jika dibatalkan */}
        {status === 'Dibatalkan' && (
          <View style={s.watermarkContainer} fixed>
            <Text style={s.watermark}>DIBATALKAN</Text>
          </View>
        )}

        {/* Header */}
        <View style={s.header}>
          <View style={s.logo}>
            <Text style={s.logoIcon}>♟</Text>
            <View>
              <Text style={s.logoText}>CFK HUB</Text>
              <Text style={s.logoSub}>Catur Untuk Kanak-Kanak</Text>
            </View>
          </View>
          <Text style={s.resitBadge}>RESIT RASMI</Text>
        </View>

        {/* No Resit */}
        <View style={[s.section, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }]}>
          <View>
            <Text style={s.sectionTitle}>No. Resit</Text>
            <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 }}>{nombor_resit}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.sectionTitle}>Tarikh Bayar</Text>
            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>{formatTarikhPDF(tarikh_bayar)}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Maklumat Pelajar */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Maklumat Pelajar</Text>
          <View style={s.row}>
            <Text style={s.label}>Nama Pelajar</Text>
            <Text style={s.value}>{nama_pelajar}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Cawangan</Text>
            <Text style={s.value}>{cawangan}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Maklumat Bayaran */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Maklumat Bayaran</Text>
          <View style={s.row}>
            <Text style={s.label}>Jenis Bayaran</Text>
            <Text style={s.value}>{jenis}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Bulan</Text>
            <Text style={s.value}>{bulan_bayaran} {tahun_bayaran}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Kaedah Bayaran</Text>
            <Text style={s.value}>{kaedah_bayaran ?? 'Tunai'}</Text>
          </View>
        </View>

        {/* Jumlah */}
        <View style={s.jumlahBox}>
          <Text style={s.jumlahLabel}>Jumlah Dibayar</Text>
          <Text style={s.jumlahNilai}>{formatRM(jumlah)}</Text>
        </View>

        {/* Nota batal */}
        {status === 'Dibatalkan' && sebab_batal && (
          <View style={{
            backgroundColor: '#FFF1F2', border: '1px solid #FECDD3',
            borderRadius: 6, padding: '10px 14px', marginBottom: 16,
          }}>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#9F1239', marginBottom: 3 }}>
              RESIT DIBATALKAN
            </Text>
            <Text style={{ fontSize: 9, color: '#9F1239' }}>Sebab: {sebab_batal}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Akaun Maybank: 164 456 789 012 (CFK — Catur Untuk Kanak-Kanak)</Text>
          <Text style={s.footerText}>Resit ini adalah dokumen sah. Sila simpan sebagai rujukan.</Text>
          <Text style={[s.footerText, { marginTop: 6, fontFamily: 'Helvetica-Bold' }]}>
            Terima kasih atas kepercayaan anda kepada program CFK. 🙏
          </Text>
          <Text style={[s.footerText, { marginTop: 8, color: '#94A3B8', fontSize: 8 }]}>
            Dijana oleh CFK HUB · {new Date().toLocaleDateString('ms-MY')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
