import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 11, padding: '40px 48px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 12, borderBottom: '2px solid #1E293B' },
  logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  nama: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#1E293B', textAlign: 'center', marginBottom: 4 },
  meta: { fontSize: 10, color: '#64748B', textAlign: 'center', marginBottom: 14 },
  bintangBaris: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 18 },
  seksyenTajuk: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, marginTop: 6 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, width: '50%', paddingRight: 10 },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 8 },
  itemLabel: { fontSize: 9.5, color: '#334155', flex: 1 },
  footer: { marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #E2E8F0' },
  footerText: { fontSize: 8, color: '#94A3B8' },
})

const WARNA_STATUS = ['#CBD5E1', '#F5C400', '#84CC16'] // 0 kelabu, 1 kuning, 2 hijau

export type ItemLP = { label: string; kumpulan: string; nilai: number }
export type FokusLP = { label: string; aktiviti: string }

type Props = {
  nama: string
  cawangan: string | null
  kitaranNama: string
  bintang: number
  items: ItemLP[]
  notaCoach: string | null
  fokus: FokusLP[]
}

export function KadLittlePawnPDF({ nama, cawangan, kitaranNama, bintang, items, notaCoach, fokus }: Props) {
  const kumpulan = ['Kenal', 'Gerak', 'Main']
  return (
    <Document title={`Little Pawn — ${nama}`} author="CFK HUB">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image src={LOGO_CFK} style={{ height: 40, width: 50 }} />
            <View>
              <Text style={s.logoText}>CFK HUB</Text>
              <Text style={s.logoSub}>Little Pawn · Umur 4-5</Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#64748B' }}>{kitaranNama}</Text>
        </View>

        <Text style={s.nama}>{nama}</Text>
        <Text style={s.meta}>{cawangan ? `${cawangan} · ` : ''}Laporan Perkembangan</Text>

        <View style={s.bintangBaris}>
          {[1, 2, 3].map((b) => (
            <Text key={b} style={{ fontSize: 28, color: b <= bintang ? '#F5C400' : '#E2E8F0' }}>★</Text>
          ))}
        </View>

        {kumpulan.map((grp) => (
          <View key={grp}>
            <Text style={s.seksyenTajuk}>{grp}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {items.filter((it) => it.kumpulan === grp).map((it, i) => (
                <View key={i} style={s.itemRow}>
                  <View style={[s.dot, { backgroundColor: WARNA_STATUS[it.nilai] ?? '#CBD5E1' }]} />
                  <Text style={s.itemLabel}>{it.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={s.seksyenTajuk}>Kata Coach</Text>
        <Text style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.4, marginBottom: 6 }}>{notaCoach || '—'}</Text>

        {fokus.length > 0 && (
          <>
            <Text style={s.seksyenTajuk}>Fokus Bulan Depan</Text>
            {fokus.map((f, i) => (
              <Text key={i} style={{ fontSize: 10, color: '#334155', marginBottom: 3 }}>
                • {f.label}{f.aktiviti ? `  —  cuba aktiviti: ${f.aktiviti}` : ''}
              </Text>
            ))}
          </>
        )}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, alignItems: 'center' }}>
          <View style={[s.dot, { backgroundColor: WARNA_STATUS[2] }]} /><Text style={{ fontSize: 8, color: '#64748B', marginRight: 12 }}>Dah Boleh</Text>
          <View style={[s.dot, { backgroundColor: WARNA_STATUS[1] }]} /><Text style={{ fontSize: 8, color: '#64748B', marginRight: 12 }}>Sedang</Text>
          <View style={[s.dot, { backgroundColor: WARNA_STATUS[0] }]} /><Text style={{ fontSize: 8, color: '#64748B' }}>Belum</Text>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Dijana oleh CFK HUB pada {new Date().toLocaleDateString('ms-MY')}. Tiada gred huruf untuk Little Pawn — fokus pada perkembangan.</Text>
        </View>
      </Page>
    </Document>
  )
}
