import { Document, Page, Text, View, Image, StyleSheet, Svg, Polygon, Line, Circle } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: '36px 44px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #1E293B' },
  logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  tajuk: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#1E293B', textAlign: 'right' },
  subjudul: { fontSize: 8.5, color: '#64748B', textAlign: 'right', marginTop: 2 },
  infoBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 16 },
  infoItem: { fontSize: 9, color: '#475569', marginRight: 14 },
  infoLabel: { fontFamily: 'Helvetica-Bold', color: '#0F172A' },
  seksyenTajuk: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  compRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  compLabel: { width: 90, fontSize: 9, color: '#475569' },
  compBarBg: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4 },
  compBarFill: { height: 8, borderRadius: 4 },
  compVal: { width: 52, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: '#0F172A' },
  footer: { marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #E2E8F0', flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#94A3B8' },
  ttdKotak: { alignItems: 'center' },
  ttdGaris: { width: 130, borderTop: '1px solid #94A3B8', marginBottom: 3 },
})

// Warna gred untuk PDF (padan WARNA_GRED skrin).
const WARNA_GRED_PDF: Record<string, { solid: string; text: string; bg: string }> = {
  A: { solid: '#84CC16', text: '#166534', bg: '#F0FDF4' },
  B: { solid: '#2563EB', text: '#1E40AF', bg: '#EFF6FF' },
  C: { solid: '#F5C400', text: '#92400E', bg: '#FFFBEB' },
  D: { solid: '#EA580C', text: '#9A3412', bg: '#FFF7ED' },
  E: { solid: '#EA580C', text: '#9A3412', bg: '#FFF7ED' },
}

export type KomponenGred = { label: string; nilai: number; penuh: number }

type Props = {
  nama: string
  umur: number | null
  levelNama: string
  cawangan: string | null
  kitaranNama: string
  komponen: KomponenGred[] // 6 (tanpa bonus) untuk radar
  bonus: number
  skorAkhir: number
  gred: 'A' | 'B' | 'C' | 'D' | 'E'
  labelGred: string
  naikLevel: boolean
  levelBaru: string
  ratingMula: number | null
  ratingTamat: number | null
  komenCoach: string | null
  fokus: string
}

// Titik radar (hexagon) — cx,cy pusat, r jejari, idx/n paksi, ratio 0..1.
function titikRadar(cx: number, cy: number, r: number, idx: number, n: number, ratio: number) {
  const ang = -Math.PI / 2 + (2 * Math.PI * idx) / n
  return { x: cx + r * ratio * Math.cos(ang), y: cy + r * ratio * Math.sin(ang) }
}

function Radar({ komponen }: { komponen: KomponenGred[] }) {
  const cx = 70, cy = 70, r = 54, n = komponen.length
  const luar = komponen.map((_, i) => titikRadar(cx, cy, r, i, n, 1))
  const nilai = komponen.map((k, i) => titikRadar(cx, cy, r, i, n, Math.min(1, k.penuh ? k.nilai / k.penuh : 0)))
  const grid = [0.33, 0.66, 1]
  return (
    <Svg width={140} height={140}>
      {grid.map((g, gi) => (
        <Polygon key={gi} points={komponen.map((_, i) => { const p = titikRadar(cx, cy, r, i, n, g); return `${p.x},${p.y}` }).join(' ')} stroke="#E2E8F0" strokeWidth={0.7} fill="none" />
      ))}
      {luar.map((p, i) => <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E2E8F0" strokeWidth={0.7} />)}
      <Polygon points={nilai.map((p) => `${p.x},${p.y}`).join(' ')} fill="#84CC16" fillOpacity={0.35} stroke="#4D7C0F" strokeWidth={1.2} />
      {nilai.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={1.6} fill="#4D7C0F" />)}
    </Svg>
  )
}

function formatTarikh() {
  return new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function KadGredPDF({
  nama, umur, levelNama, cawangan, kitaranNama, komponen, bonus, skorAkhir, gred, labelGred,
  naikLevel, levelBaru, ratingMula, ratingTamat, komenCoach, fokus,
}: Props) {
  const wg = WARNA_GRED_PDF[gred]
  // Helvetica (font lalai react-pdf) tiada glyph catur (♞ dll) → buang, papar nama sahaja.
  const bersih = (t: string) => t.replace(/[^\x20-\x7E]/g, '').trim()
  const levelBersih = bersih(levelNama)
  const levelBaruBersih = bersih(levelBaru)
  return (
    <Document title={`Laporan Gred — ${nama}`} author="CFK HUB">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image src={LOGO_CFK} style={{ height: 40, width: 50 }} />
            <View>
              <Text style={s.logoText}>CFK HUB</Text>
              <Text style={s.logoSub}>Catur Untuk Kanak-Kanak</Text>
            </View>
          </View>
          <View>
            <Text style={s.tajuk}>Laporan Penggredan</Text>
            <Text style={s.subjudul}>{kitaranNama}{cawangan ? ` · ${cawangan}` : ''}</Text>
          </View>
        </View>

        <View style={s.infoBar}>
          <Text style={s.infoItem}><Text style={s.infoLabel}>Nama: </Text>{nama}</Text>
          {umur != null && <Text style={s.infoItem}><Text style={s.infoLabel}>Umur: </Text>{umur} tahun</Text>}
          <Text style={s.infoItem}><Text style={s.infoLabel}>Tahap Silibus: </Text>{levelBersih}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 20, marginBottom: 16 }}>
          {/* Kiri: breakdown */}
          <View style={{ flex: 1 }}>
            <Text style={s.seksyenTajuk}>Pecahan Markah</Text>
            {komponen.map((k) => (
              <View key={k.label} style={s.compRow}>
                <Text style={s.compLabel}>{k.label}</Text>
                <View style={s.compBarBg}>
                  <View style={[s.compBarFill, { width: `${Math.min(100, (k.nilai / k.penuh) * 100)}%`, backgroundColor: wg.solid }]} />
                </View>
                <Text style={s.compVal}>{k.nilai}/{k.penuh}</Text>
              </View>
            ))}
            <View style={s.compRow}>
              <Text style={s.compLabel}>Bonus</Text>
              <View style={s.compBarBg}><View style={[s.compBarFill, { width: `${(bonus / 5) * 100}%`, backgroundColor: wg.solid }]} /></View>
              <Text style={s.compVal}>{bonus}/5</Text>
            </View>
          </View>

          {/* Kanan: bulatan gred + radar */}
          <View style={{ width: 150, alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: wg.bg, borderWidth: 3, borderColor: wg.solid, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 26, fontFamily: 'Helvetica-Bold', color: wg.text }}>{gred}</Text>
              <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: wg.text }}>{skorAkhir}/105</Text>
            </View>
            <Text style={{ fontSize: 9, color: wg.text, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>{labelGred}</Text>
            <Radar komponen={komponen} />
          </View>
        </View>

        {/* Status naik/kekal */}
        <View style={{ backgroundColor: naikLevel ? '#F0FDF4' : '#F8FAFC', borderRadius: 6, padding: '9px 12px', marginBottom: 12, borderLeft: `3px solid ${naikLevel ? '#84CC16' : '#94A3B8'}` }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: naikLevel ? '#166534' : '#475569' }}>
            {naikLevel ? `NAIK KE ${levelBaruBersih.toUpperCase()}` : `KEKAL DI ${levelBersih.toUpperCase()}`}
          </Text>
          {ratingMula != null && ratingTamat != null && (
            <Text style={{ fontSize: 8.5, color: '#64748B', marginTop: 2 }}>Rating Pertandingan: {ratingMula} -&gt; {ratingTamat} ({ratingTamat - ratingMula >= 0 ? '+' : ''}{ratingTamat - ratingMula})</Text>
          )}
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={s.seksyenTajuk}>Komen Coach</Text>
          <Text style={{ fontSize: 9.5, color: '#334155', lineHeight: 1.4 }}>{komenCoach || '—'}</Text>
        </View>
        <View style={{ marginBottom: 12 }}>
          <Text style={s.seksyenTajuk}>Fokus 3 Bulan Akan Datang</Text>
          <Text style={{ fontSize: 9.5, color: '#334155' }}>Beri perhatian lebih pada: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{fokus}</Text>.</Text>
        </View>

        <View style={s.footer}>
          <View>
            <Text style={s.footerText}>Dijana oleh CFK HUB pada {formatTarikh()}.</Text>
          </View>
          <View style={s.ttdKotak}>
            <View style={s.ttdGaris} />
            <Text style={s.footerText}>Tandatangan Coach / Cop Akademi</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
