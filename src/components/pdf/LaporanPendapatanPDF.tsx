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
  logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  tajuk: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginBottom: 4 },
  subjudul: { fontSize: 10, color: '#64748B' },
  seksyenTajuk: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginTop: 18, marginBottom: 8 },
  summaryBox: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  summaryCard: { flex: 1, borderRadius: 8, padding: '10px 12px', border: '1px solid #E2E8F0' },
  summaryLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  summaryNilai: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1E293B', padding: '7px 10px', borderRadius: '4px 4px 0 0' },
  th: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', padding: '6px 10px', borderBottom: '1px solid #E2E8F0' },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  totalRow: { flexDirection: 'row', padding: '8px 10px', borderTop: '2px solid #1E293B', backgroundColor: '#F1F5F9' },
  td: { fontSize: 9, color: '#0F172A' },
  colCaw: { width: '28%' },
  colNum: { width: '18%', textAlign: 'right' },
  // Senarai pelajar
  pCol1: { width: '40%' },
  pCol2: { width: '25%' },
  pCol3: { width: '17%' },
  pCol4: { width: '18%', textAlign: 'right' },
  footer: { marginTop: 16, paddingTop: 12, borderTop: '1px solid #E2E8F0' },
  footerText: { fontSize: 8, color: '#94A3B8' },
})

export type BarisPendapatan = {
  cawangan: string
  kumpulan: number
  personal: number
  pendaftaran: number
  jumlah: number
}

export type BarisPelajar = {
  nama: string
  cawangan: string
  jenis: string
  jumlah: number
}

type Props = {
  tempoh: string
  cawanganLabel: string
  baris: BarisPendapatan[]
  pelajar: BarisPelajar[]
  total: { kumpulan: number; personal: number; pendaftaran: number; jumlah: number }
  bilResit: number
}

// Format ringgit tanpa Intl (elak isu locale dalam @react-pdf) — "RM 1,234.50"
function rm(n: number) {
  return 'RM ' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function LaporanPendapatanPDF({ tempoh, cawanganLabel, baris, pelajar, total, bilResit }: Props) {
  return (
    <Document title={`Laporan Pendapatan — ${tempoh}`} author="CFK HUB">
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
            <Text style={s.tajuk}>Laporan Pendapatan</Text>
            <Text style={s.subjudul}>{tempoh} · {cawanganLabel}</Text>
          </View>
        </View>

        {/* Ringkasan — 4 kad supaya Jumlah = Kumpulan + Personal + Pendaftaran */}
        <View style={s.summaryBox}>
          <View style={[s.summaryCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <Text style={[s.summaryLabel, { color: '#166534' }]}>Jumlah</Text>
            <Text style={[s.summaryNilai, { color: '#166534' }]}>{rm(total.jumlah)}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#ECFCCB', borderColor: '#D9F99D' }]}>
            <Text style={[s.summaryLabel, { color: '#3F6212' }]}>Kumpulan</Text>
            <Text style={[s.summaryNilai, { color: '#3F6212' }]}>{rm(total.kumpulan)}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#DBEAFE', borderColor: '#BFDBFE' }]}>
            <Text style={[s.summaryLabel, { color: '#1E40AF' }]}>Personal</Text>
            <Text style={[s.summaryNilai, { color: '#1E40AF' }]}>{rm(total.personal)}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <Text style={[s.summaryLabel, { color: '#92400E' }]}>Pendaftaran</Text>
            <Text style={[s.summaryNilai, { color: '#92400E' }]}>{rm(total.pendaftaran)}</Text>
          </View>
        </View>

        {/* Jadual Cawangan */}
        <Text style={s.seksyenTajuk}>Pendapatan Mengikut Cawangan</Text>
        <View style={s.tableHeader}>
          <Text style={[s.th, s.colCaw]}>Cawangan</Text>
          <Text style={[s.th, s.colNum]}>Kumpulan</Text>
          <Text style={[s.th, s.colNum]}>Personal</Text>
          <Text style={[s.th, s.colNum]}>Pendaftaran</Text>
          <Text style={[s.th, s.colNum]}>Jumlah</Text>
        </View>
        {baris.length === 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 10, color: '#64748B', textAlign: 'center' }}>
              Tiada pendapatan direkod untuk tempoh ini.
            </Text>
          </View>
        ) : (
          baris.map((b, i) => (
            <View key={b.cawangan} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={[s.td, s.colCaw, { fontFamily: 'Helvetica-Bold' }]}>{b.cawangan}</Text>
              <Text style={[s.td, s.colNum]}>{rm(b.kumpulan)}</Text>
              <Text style={[s.td, s.colNum]}>{rm(b.personal)}</Text>
              <Text style={[s.td, s.colNum]}>{rm(b.pendaftaran)}</Text>
              <Text style={[s.td, s.colNum, { fontFamily: 'Helvetica-Bold' }]}>{rm(b.jumlah)}</Text>
            </View>
          ))
        )}
        {baris.length > 0 && (
          <View style={s.totalRow}>
            <Text style={[s.td, s.colCaw, { fontFamily: 'Helvetica-Bold' }]}>JUMLAH</Text>
            <Text style={[s.td, s.colNum, { fontFamily: 'Helvetica-Bold' }]}>{rm(total.kumpulan)}</Text>
            <Text style={[s.td, s.colNum, { fontFamily: 'Helvetica-Bold' }]}>{rm(total.personal)}</Text>
            <Text style={[s.td, s.colNum, { fontFamily: 'Helvetica-Bold' }]}>{rm(total.pendaftaran)}</Text>
            <Text style={[s.td, s.colNum, { fontFamily: 'Helvetica-Bold' }]}>{rm(total.jumlah)}</Text>
          </View>
        )}

        {/* Senarai Pelajar Yang Bayar */}
        {pelajar.length > 0 && (
          <>
            <Text style={s.seksyenTajuk}>Senarai Pelajar Yang Bayar ({pelajar.length})</Text>
            <View style={s.tableHeader}>
              <Text style={[s.th, s.pCol1]}>Pelajar</Text>
              <Text style={[s.th, s.pCol2]}>Cawangan</Text>
              <Text style={[s.th, s.pCol3]}>Jenis</Text>
              <Text style={[s.th, s.pCol4]}>Jumlah</Text>
            </View>
            {pelajar.map((p, i) => (
              <View key={`${p.nama}-${i}`} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
                <Text style={[s.td, s.pCol1]}>{p.nama}</Text>
                <Text style={[s.td, s.pCol2, { color: '#64748B' }]}>{p.cawangan}</Text>
                <Text style={[s.td, s.pCol3, { color: '#64748B' }]}>{p.jenis}</Text>
                <Text style={[s.td, s.pCol4, { fontFamily: 'Helvetica-Bold' }]}>{rm(p.jumlah)}</Text>
              </View>
            ))}
          </>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            {bilResit} resit aktif · Pendapatan ikut bulan yuran (bulan_bayaran). Dijana oleh CFK HUB pada {new Date().toLocaleDateString('ms-MY')}.
          </Text>
          <Text style={[s.footerText, { marginTop: 2 }]}>
            Cawangan ditentukan mengikut cawangan pendaftaran pelajar. Baris &quot;Tiada Cawangan&quot; = resit pelajar tanpa cawangan.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
