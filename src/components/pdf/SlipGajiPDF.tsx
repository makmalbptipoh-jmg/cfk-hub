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
  logoText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', fontFamily: 'Helvetica-Bold' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  badge: {
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
  kiraanBox: {
    backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0',
    borderRadius: 8, padding: '12px 20px', marginBottom: 12,
  },
  kiraanRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 6,
  },
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
})

export type SlipGajiData = {
  nama_jurulatih: string
  no_ic: string | null
  bulan_bayaran: string
  tahun_bayaran: number
  bilangan_sesi: number
  kadar_per_sesi: number
  jumlah: number
  tarikh_bayar: string | null
  status: string
  nota: string | null
}

function formatRM(amount: number) {
  return `RM ${amount.toFixed(2)}`
}

function formatTarikhPDF(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function SlipGajiPDF({
  nama_jurulatih, no_ic, bulan_bayaran, tahun_bayaran,
  bilangan_sesi, kadar_per_sesi, jumlah, tarikh_bayar, status, nota,
}: SlipGajiData) {
  return (
    <Document title={`Slip Gaji ${nama_jurulatih} — ${bulan_bayaran} ${tahun_bayaran}`} author="CFK HUB" creator="CFK HUB">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logoText}>CHESS FOR KIDS (CFK)</Text>
            <Text style={s.logoSub}>5B, Laluan Klebang 21, Klebang Perdana, 31200 Chemor, Perak</Text>
          </View>
          <Text style={s.badge}>SLIP GAJI</Text>
        </View>

        {/* Bulan */}
        <View style={[s.section, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }]}>
          <View>
            <Text style={s.sectionTitle}>Bulan Gaji</Text>
            <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 }}>
              {bulan_bayaran} {tahun_bayaran}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.sectionTitle}>Tarikh Bayar</Text>
            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>
              {tarikh_bayar ? formatTarikhPDF(tarikh_bayar) : '—'}
            </Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Maklumat Jurulatih */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Maklumat Jurulatih</Text>
          <View style={s.row}>
            <Text style={s.label}>Nama Penuh</Text>
            <Text style={s.value}>{nama_jurulatih}</Text>
          </View>
          {no_ic && (
            <View style={s.row}>
              <Text style={s.label}>No. Kad Pengenalan</Text>
              <Text style={s.value}>{no_ic}</Text>
            </View>
          )}
          <View style={s.row}>
            <Text style={s.label}>Status Bayaran</Text>
            <Text style={s.value}>{status}</Text>
          </View>
        </View>

        {/* Pengiraan */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Butiran Pengiraan</Text>
          <View style={s.kiraanBox}>
            <View style={s.kiraanRow}>
              <Text style={{ color: '#64748B', fontSize: 10 }}>Bilangan Sesi Hadir</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>{bilangan_sesi} sesi</Text>
            </View>
            <View style={s.kiraanRow}>
              <Text style={{ color: '#64748B', fontSize: 10 }}>Kadar Seunit Sesi</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>{formatRM(kadar_per_sesi)}</Text>
            </View>
            <View style={[s.kiraanRow, { marginBottom: 0 }]}>
              <Text style={{ color: '#64748B', fontSize: 10 }}>Pengiraan</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>
                {bilangan_sesi} sesi × {formatRM(kadar_per_sesi)}
              </Text>
            </View>
          </View>
          <View style={s.jumlahBox}>
            <Text style={s.jumlahLabel}>JUMLAH GAJI BERSIH</Text>
            <Text style={s.jumlahNilai}>{formatRM(jumlah)}</Text>
          </View>
          {nota && (
            <View style={s.row}>
              <Text style={s.label}>Nota</Text>
              <Text style={s.value}>{nota}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Slip ini dijana secara automatik oleh sistem CFK HUB dan tidak memerlukan tandatangan.</Text>
          <Text style={s.footerText}>Sebarang pertanyaan, sila hubungi pihak pengurusan CFK.</Text>
        </View>
      </Page>
    </Document>
  )
}
