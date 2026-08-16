import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'
import { formatMata } from '@/lib/pertandingan'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: '40px 48px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid #1E293B' },
  logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  tajuk: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginBottom: 4, textAlign: 'right', maxWidth: 240 },
  subjudul: { fontSize: 9, color: '#64748B', textAlign: 'right' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1E293B', padding: '7px 10px', borderRadius: '4px 4px 0 0' },
  tableHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.8 },
  tableRow: { flexDirection: 'row', padding: '6px 10px', borderBottom: '1px solid #E2E8F0' },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  colRank: { width: '8%' },
  colNama: { flex: 1 },
  colNum: { width: '12%', textAlign: 'center' },
  colPingat: { width: '14%', textAlign: 'center' },
  footer: { marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #E2E8F0' },
  footerText: { fontSize: 8, color: '#94A3B8' },
})

const WARNA_PINGAT_PDF: Record<string, string> = { Emas: '#B45309', Perak: '#475569', Gangsa: '#9A3412' }

export type BarisKeputusanPDF = {
  kedudukan: number
  nama: string
  mata: number
  tiebreaks: (number | string | null)[]
  pingat: 'Emas' | 'Perak' | 'Gangsa' | null
}

type Props = {
  nama: string
  tarikh: string
  cawangan: string | null
  tiebreakLabels: string[]
  keputusan: BarisKeputusanPDF[]
}

function formatTarikh(s2: string) {
  return new Date(s2).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function KeputusanPertandinganPDF({ nama, tarikh, cawangan, tiebreakLabels, keputusan }: Props) {
  return (
    <Document title={`Keputusan — ${nama}`} author="CFK HUB">
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
            <Text style={s.tajuk}>{nama}</Text>
            <Text style={s.subjudul}>{formatTarikh(tarikh)}{cawangan ? ` · ${cawangan}` : ''} · {keputusan.length} pemain</Text>
          </View>
        </View>

        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colRank]}>#</Text>
          <Text style={[s.tableHeaderText, s.colNama]}>Nama</Text>
          <Text style={[s.tableHeaderText, s.colNum]}>Mata</Text>
          {tiebreakLabels.map((label, i) => (
            <Text key={i} style={[s.tableHeaderText, s.colNum]}>{label}</Text>
          ))}
          <Text style={[s.tableHeaderText, s.colPingat]}>Pingat</Text>
        </View>
        {keputusan.map((k, i) => (
          <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#0F172A' }, s.colRank]}>{k.kedudukan}</Text>
            <Text style={[{ fontSize: 9, color: '#0F172A' }, s.colNama]}>{k.nama}</Text>
            <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#0F172A' }, s.colNum]}>{formatMata(k.mata)}</Text>
            {tiebreakLabels.map((_, j) => (
              <Text key={j} style={[{ fontSize: 9, color: '#64748B' }, s.colNum]}>{k.tiebreaks[j] ?? '—'}</Text>
            ))}
            <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: k.pingat ? WARNA_PINGAT_PDF[k.pingat] : '#94A3B8' }, s.colPingat]}>{k.pingat ?? '—'}</Text>
          </View>
        ))}

        <View style={s.footer}>
          <Text style={s.footerText}>Dijana secara automatik oleh CFK HUB pada {new Date().toLocaleDateString('ms-MY')}.</Text>
          <Text style={[s.footerText, { marginTop: 2 }]}>Sumber: fail Ranking List Swiss-Manager.</Text>
        </View>
      </Page>
    </Document>
  )
}
