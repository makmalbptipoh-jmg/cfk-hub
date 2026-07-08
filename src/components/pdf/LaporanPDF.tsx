import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'

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
    marginBottom: 20,
    paddingBottom: 14,
    borderBottom: '2px solid #1E293B',
  },
  logoText: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', fontFamily: 'Helvetica-Bold' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  tajuk: {
    fontSize: 14, fontFamily: 'Helvetica-Bold',
    color: '#1E293B', marginBottom: 4,
  },
  subjudul: { fontSize: 10, color: '#64748B' },
  maklumatBox: {
    backgroundColor: '#F8FAFC', borderRadius: 6,
    padding: '10px 14px', marginBottom: 16,
    flexDirection: 'row', gap: 24,
  },
  maklumatLabel: { fontSize: 8, color: '#64748B', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  maklumatNilai: { fontSize: 10, color: '#0F172A', fontFamily: 'Helvetica-Bold' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: '7px 10px',
    borderRadius: '4px 4px 0 0',
  },
  tableHeaderText: {
    fontSize: 8, fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '7px 10px',
    borderBottom: '1px solid #E2E8F0',
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  colTarikh: { width: '22%' },
  colHari: { width: '16%' },
  colStatus: { width: '20%' },
  colNota: { flex: 1 },
  badgeHadir: { color: '#166534', fontFamily: 'Helvetica-Bold' },
  badgeTidak: { color: '#9F1239', fontFamily: 'Helvetica-Bold' },
  badgeCuti: { color: '#92400E', fontFamily: 'Helvetica-Bold' },
  summaryBox: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1, borderRadius: 8,
    padding: '12px 14px',
    border: '1px solid #E2E8F0',
  },
  summaryLabel: { fontSize: 8, color: '#64748B', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  summaryNilai: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  summaryUnit: { fontSize: 9, color: '#64748B', marginTop: 2 },
  statusBox: {
    padding: '10px 14px', borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  footer: {
    marginTop: 'auto', paddingTop: 12,
    borderTop: '1px solid #E2E8F0',
  },
  footerText: { fontSize: 8, color: '#94A3B8' },
})

type Rekod = {
  tarikh: string
  status: 'Hadir' | 'Tidak Hadir' | 'Cuti'
  nota: string | null
}

type Props = {
  nama_pelajar: string
  cawangan: string
  jenis_kelas: string
  bulan: string
  tahun: number
  rekod: Rekod[]
  jumlahHadir: number
  jumlahTidakHadir: number
  jumlahCuti: number
  peratus: number
  perluBayar: boolean
}

const HARI_SINGKAT = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab']

function formatTarikhMelayu(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function hariSingkat(dateStr: string) {
  const d = new Date(dateStr)
  return HARI_SINGKAT[d.getDay()]
}

export function LaporanPDF({
  nama_pelajar, cawangan, jenis_kelas,
  bulan, tahun, rekod,
  jumlahHadir, jumlahTidakHadir, jumlahCuti,
  peratus, perluBayar,
}: Props) {
  return (
    <Document title={`Laporan Kehadiran — ${nama_pelajar} — ${bulan} ${tahun}`} author="CFK HUB">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image src={LOGO_CFK} style={{ height: 42, width: 52 }} />
            <View>
              <Text style={s.logoText}>CFK HUB</Text>
              <Text style={s.logoSub}>Catur Untuk Kanak-Kanak</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.tajuk}>Laporan Kehadiran</Text>
            <Text style={s.subjudul}>{bulan} {tahun}</Text>
          </View>
        </View>

        {/* Maklumat Pelajar */}
        <View style={s.maklumatBox}>
          <View style={{ flex: 1 }}>
            <Text style={s.maklumatLabel}>Nama Pelajar</Text>
            <Text style={s.maklumatNilai}>{nama_pelajar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.maklumatLabel}>Cawangan</Text>
            <Text style={s.maklumatNilai}>{cawangan}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.maklumatLabel}>Jenis Kelas</Text>
            <Text style={s.maklumatNilai}>{jenis_kelas}</Text>
          </View>
        </View>

        {/* Jadual Rekod */}
        {rekod.length > 0 ? (
          <View style={{ marginBottom: 4 }}>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, s.colTarikh]}>Tarikh</Text>
              <Text style={[s.tableHeaderText, s.colHari]}>Hari</Text>
              <Text style={[s.tableHeaderText, s.colStatus]}>Status</Text>
              <Text style={[s.tableHeaderText, s.colNota]}>Nota</Text>
            </View>
            {rekod.map((r, i) => (
              <View key={r.tarikh} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={[{ fontSize: 9, color: '#0F172A' }, s.colTarikh]}>{formatTarikhMelayu(r.tarikh)}</Text>
                <Text style={[{ fontSize: 9, color: '#64748B' }, s.colHari]}>{hariSingkat(r.tarikh)}</Text>
                <Text style={[
                  { fontSize: 9 }, s.colStatus,
                  r.status === 'Hadir' ? s.badgeHadir : r.status === 'Tidak Hadir' ? s.badgeTidak : s.badgeCuti,
                ]}>
                  {r.status}
                </Text>
                <Text style={[{ fontSize: 9, color: '#64748B' }, s.colNota]}>{r.nota || '—'}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ padding: '20px', textAlign: 'center' }}>
            <Text style={{ fontSize: 10, color: '#64748B' }}>Tiada rekod kehadiran untuk bulan ini.</Text>
          </View>
        )}

        {/* Ringkasan */}
        <View style={s.summaryBox}>
          <View style={[s.summaryCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <Text style={[s.summaryLabel, { color: '#166534' }]}>Hadir</Text>
            <Text style={[s.summaryNilai, { color: '#166534' }]}>{jumlahHadir}</Text>
            <Text style={[s.summaryUnit, { color: '#166534' }]}>sesi</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]}>
            <Text style={[s.summaryLabel, { color: '#9F1239' }]}>Tidak Hadir</Text>
            <Text style={[s.summaryNilai, { color: '#9F1239' }]}>{jumlahTidakHadir}</Text>
            <Text style={[s.summaryUnit, { color: '#9F1239' }]}>sesi</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <Text style={[s.summaryLabel, { color: '#92400E' }]}>Cuti</Text>
            <Text style={[s.summaryNilai, { color: '#92400E' }]}>{jumlahCuti}</Text>
            <Text style={[s.summaryUnit, { color: '#92400E' }]}>sesi</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Text style={[s.summaryLabel, { color: '#1E40AF' }]}>Kehadiran</Text>
            <Text style={[s.summaryNilai, { color: '#1E40AF' }]}>{peratus}%</Text>
            <Text style={[s.summaryUnit, { color: '#1E40AF' }]}>daripada {rekod.length} sesi</Text>
          </View>
        </View>

        {/* Status Yuran */}
        <View style={[s.statusBox, {
          backgroundColor: perluBayar ? '#FFF7ED' : '#F0FDF4',
          border: `1px solid ${perluBayar ? '#FED7AA' : '#BBF7D0'}`,
        }]}>
          <Text style={{
            fontSize: 10, fontFamily: 'Helvetica-Bold',
            color: perluBayar ? '#C2410C' : '#166534',
          }}>
            {perluBayar
              ? `Yuran bulan ${bulan} ${tahun} perlu dijelaskan — ${jumlahHadir} sesi hadir (had minimum 4 sesi).`
              : jumlahHadir >= 4
                ? `Yuran bulan ${bulan} ${tahun} telah dijelaskan.`
                : `Bilangan kehadiran (${jumlahHadir} sesi) belum mencapai had minimum (4 sesi).`
            }
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            Laporan ini dijana secara automatik oleh CFK HUB pada {new Date().toLocaleDateString('ms-MY')}.
          </Text>
          <Text style={[s.footerText, { marginTop: 2 }]}>
            Untuk pertanyaan, sila hubungi jurulatih atau pentadbir CFK.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
