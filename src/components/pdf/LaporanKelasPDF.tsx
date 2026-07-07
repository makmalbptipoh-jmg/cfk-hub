import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: '40px 48px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, paddingBottom: 14, borderBottom: '2px solid #1E293B' },
  logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  tajuk: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginBottom: 4 },
  subjudul: { fontSize: 10, color: '#64748B' },
  maklumatBox: { backgroundColor: '#F8FAFC', borderRadius: 6, padding: '10px 14px', marginBottom: 14, flexDirection: 'row', gap: 24 },
  maklumatLabel: { fontSize: 8, color: '#64748B', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  maklumatNilai: { fontSize: 10, color: '#0F172A', fontFamily: 'Helvetica-Bold' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1E293B', padding: '6px 8px' },
  tableHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', padding: '6px 8px', borderBottom: '1px solid #E2E8F0' },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  colNo: { width: '7%' },
  colNama: { flex: 1 },
  colKelas: { width: '18%' },
  colNum: { width: '13%', textAlign: 'right' },
  footer: { marginTop: 16, paddingTop: 12, borderTop: '1px solid #E2E8F0' },
  footerText: { fontSize: 8, color: '#94A3B8' },
})

export type BarisKelas = {
  nama_penuh: string
  jenis_kelas: string
  hadir: number
  tidakHadir: number
  cuti: number
  peratus: number
}

type Props = {
  cawangan: string
  bulan: string
  tahun: number
  baris: BarisKelas[]
}

export function LaporanKelasPDF({ cawangan, bulan, tahun, baris }: Props) {
  const jumHadir = baris.reduce((s, b) => s + b.hadir, 0)
  const jumTidak = baris.reduce((s, b) => s + b.tidakHadir, 0)
  const jumCuti = baris.reduce((s, b) => s + b.cuti, 0)
  const purata = baris.length > 0 ? Math.round(baris.reduce((s, b) => s + b.peratus, 0) / baris.length) : 0

  return (
    <Document title={`Laporan Kehadiran Kelas — ${cawangan} — ${bulan} ${tahun}`} author="CFK HUB">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.logoText}>CFK HUB</Text>
            <Text style={s.logoSub}>Catur Untuk Kanak-Kanak</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.tajuk}>Laporan Kehadiran Kelas</Text>
            <Text style={s.subjudul}>{bulan} {tahun}</Text>
          </View>
        </View>

        <View style={s.maklumatBox}>
          <View style={{ flex: 1 }}>
            <Text style={s.maklumatLabel}>Cawangan / Kelas</Text>
            <Text style={s.maklumatNilai}>{cawangan}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.maklumatLabel}>Bilangan Pelajar</Text>
            <Text style={s.maklumatNilai}>{baris.length}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.maklumatLabel}>Purata Kehadiran</Text>
            <Text style={s.maklumatNilai}>{purata}%</Text>
          </View>
        </View>

        {baris.length > 0 ? (
          <View>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, s.colNo]}>No.</Text>
              <Text style={[s.tableHeaderText, s.colNama]}>Nama Pelajar</Text>
              <Text style={[s.tableHeaderText, s.colKelas]}>Jenis</Text>
              <Text style={[s.tableHeaderText, s.colNum]}>Hadir</Text>
              <Text style={[s.tableHeaderText, s.colNum]}>T.Hadir</Text>
              <Text style={[s.tableHeaderText, s.colNum]}>Cuti</Text>
              <Text style={[s.tableHeaderText, s.colNum]}>%</Text>
            </View>
            {baris.map((b, i) => (
              <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={[{ fontSize: 8, color: '#64748B' }, s.colNo]}>{i + 1}</Text>
                <Text style={[{ fontSize: 9, color: '#0F172A' }, s.colNama]}>{b.nama_penuh}</Text>
                <Text style={[{ fontSize: 8, color: '#64748B' }, s.colKelas]}>{b.jenis_kelas}</Text>
                <Text style={[{ fontSize: 9, color: '#166534', fontFamily: 'Helvetica-Bold' }, s.colNum]}>{b.hadir}</Text>
                <Text style={[{ fontSize: 9, color: '#9F1239' }, s.colNum]}>{b.tidakHadir}</Text>
                <Text style={[{ fontSize: 9, color: '#92400E' }, s.colNum]}>{b.cuti}</Text>
                <Text style={[{ fontSize: 9, color: '#1E40AF', fontFamily: 'Helvetica-Bold' }, s.colNum]}>{b.peratus}%</Text>
              </View>
            ))}
            <View style={[s.tableRow, { backgroundColor: '#F1F5F9', borderTop: '2px solid #CBD5E1' }]}>
              <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold' }, s.colNo]}></Text>
              <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1E293B' }, s.colNama]}>JUMLAH</Text>
              <Text style={[{ fontSize: 8 }, s.colKelas]}></Text>
              <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#166534' }, s.colNum]}>{jumHadir}</Text>
              <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#9F1239' }, s.colNum]}>{jumTidak}</Text>
              <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#92400E' }, s.colNum]}>{jumCuti}</Text>
              <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1E40AF' }, s.colNum]}>{purata}%</Text>
            </View>
          </View>
        ) : (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#64748B' }}>Tiada rekod kehadiran untuk kelas ini pada bulan tersebut.</Text>
          </View>
        )}

        <View style={s.footer}>
          <Text style={s.footerText}>Dijana automatik oleh CFK HUB pada {new Date().toLocaleDateString('ms-MY')}. % kehadiran = Hadir ÷ jumlah sesi direkod.</Text>
        </View>
      </Page>
    </Document>
  )
}
