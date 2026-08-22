import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', padding: 24 },
  bingkai: { flex: 1, border: '3px solid #1E63D5', borderRadius: 10, padding: '30px 50px', alignItems: 'center', justifyContent: 'center' },
  bingkaiDalam: { position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, border: '1px solid #8CC63E', borderRadius: 6 },
  logo: { height: 54, width: 68, marginBottom: 10 },
  akademi: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#1E293B', letterSpacing: 1 },
  tajuk: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: '#1E63D5', marginTop: 14, marginBottom: 4, letterSpacing: 1 },
  subtajuk: { fontSize: 12, color: '#64748B', marginBottom: 22 },
  diberi: { fontSize: 11, color: '#334155', marginBottom: 6 },
  nama: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginBottom: 6, borderBottom: '2px solid #F5C400', paddingBottom: 6, paddingLeft: 30, paddingRight: 30 },
  teks: { fontSize: 11, color: '#334155', textAlign: 'center', maxWidth: 460, lineHeight: 1.5, marginTop: 14 },
  ttdBaris: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 40, paddingHorizontal: 30 },
  ttdKotak: { alignItems: 'center', width: 180 },
  ttdGaris: { width: '100%', borderTop: '1px solid #94A3B8', marginBottom: 4 },
  ttdLabel: { fontSize: 9, color: '#64748B' },
})

type Props = {
  nama: string
  cawangan: string | null
  kitaranNama: string
}

export function SijilPawnPDF({ nama, cawangan, kitaranNama }: Props) {
  return (
    <Document title={`Sijil Pawn Promotion — ${nama}`} author="CFK HUB">
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.bingkai}>
          <View style={s.bingkaiDalam} />
          <Image src={LOGO_CFK} style={s.logo} />
          <Text style={s.akademi}>CHESS FOR KIDS (CFK)</Text>
          <Text style={s.tajuk}>PAWN PROMOTION</Text>
          <Text style={s.subtajuk}>Sijil Kenaikan Little Pawn ke Pawn</Text>
          <Text style={s.diberi}>Dengan bangganya dianugerahkan kepada</Text>
          <Text style={s.nama}>{nama}</Text>
          <Text style={s.teks}>
            kerana telah menguasai kesemua 12 kemahiran asas Little Pawn — mengenal, menggerak, dan bermain catur —
            dan kini bersedia untuk naik ke tahap Pawn. Tahniah, jaguh kecil!
          </Text>
          <View style={s.ttdBaris}>
            <View style={s.ttdKotak}>
              <View style={s.ttdGaris} />
              <Text style={s.ttdLabel}>Tandatangan Coach</Text>
            </View>
            <View style={s.ttdKotak}>
              <View style={s.ttdGaris} />
              <Text style={s.ttdLabel}>{kitaranNama}{cawangan ? ` · ${cawangan}` : ''}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
