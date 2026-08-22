import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'
import type { KomponenGred } from './KadGredPDF'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: '36px 40px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  coverWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverTajuk: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginTop: 16 },
  coverSub: { fontSize: 13, color: '#64748B', marginTop: 6 },
  statBaris: { flexDirection: 'row', gap: 14, marginTop: 26 },
  statKotak: { border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 20px', alignItems: 'center' },
  statNilai: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  statLabel: { fontSize: 9, color: '#64748B', marginTop: 3 },
  seksyenTajuk: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginBottom: 10 },
  th: { flexDirection: 'row', backgroundColor: '#1E293B', padding: '6px 6px' },
  thText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  tr: { flexDirection: 'row', padding: '5px 6px', borderBottom: '1px solid #E2E8F0' },
  cNo: { width: '5%' }, cNama: { width: '25%' }, cKecil: { width: '8.5%', textAlign: 'center' }, cGred: { width: '7%', textAlign: 'center' }, cStatus: { width: '13%', textAlign: 'center' },
  footer: { marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #E2E8F0' },
  footerText: { fontSize: 7.5, color: '#94A3B8' },
})

const GRED_ROW_FILL: Record<string, string> = { A: '#F0FDF4', B: '#EFF6FF', C: '#FFFBEB', D: '#FFF7ED', E: '#FFF7ED' }
const WARNA_GRED_PDF: Record<string, { solid: string; text: string; bg: string }> = {
  A: { solid: '#84CC16', text: '#166534', bg: '#F0FDF4' }, B: { solid: '#2563EB', text: '#1E40AF', bg: '#EFF6FF' },
  C: { solid: '#F5C400', text: '#92400E', bg: '#FFFBEB' }, D: { solid: '#EA580C', text: '#9A3412', bg: '#FFF7ED' }, E: { solid: '#EA580C', text: '#9A3412', bg: '#FFF7ED' },
}

export type PelajarKelas = {
  nama: string
  umur: number | null
  levelNama: string
  komponen: KomponenGred[]
  bonus: number
  skorAkhir: number
  gred: 'A' | 'B' | 'C' | 'D' | 'E'
  naikLevel: boolean
  levelBaru: string
  komenCoach: string | null
  fokus: string
}

type Props = {
  cawanganNama: string
  kitaranNama: string
  pelajar: PelajarKelas[]
}

export function LaporanKelasGredPDF({ cawanganNama, kitaranNama, pelajar }: Props) {
  const taburan: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 }
  let naik = 0
  for (const p of pelajar) { taburan[p.gred]++; if (p.naikLevel) naik++ }

  return (
    <Document title={`Laporan Kelas — ${cawanganNama} ${kitaranNama}`} author="CFK HUB">
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <View style={s.coverWrap}>
          <Image src={LOGO_CFK} style={{ height: 56, width: 70 }} />
          <Text style={s.coverTajuk}>Laporan Penggredan Kelas</Text>
          <Text style={s.coverSub}>{cawanganNama} · {kitaranNama}</Text>
          <View style={s.statBaris}>
            <View style={s.statKotak}><Text style={s.statNilai}>{pelajar.length}</Text><Text style={s.statLabel}>Pelajar</Text></View>
            <View style={s.statKotak}><Text style={s.statNilai}>{naik}</Text><Text style={s.statLabel}>Naik Level</Text></View>
          </View>
          <View style={[s.statBaris, { marginTop: 14 }]}>
            {(['A', 'B', 'C', 'D', 'E'] as const).map((g) => (
              <View key={g} style={[s.statKotak, { backgroundColor: WARNA_GRED_PDF[g].bg }]}>
                <Text style={[s.statNilai, { color: WARNA_GRED_PDF[g].text }]}>{taburan[g]}</Text><Text style={s.statLabel}>Gred {g}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 9, color: '#94A3B8', marginTop: 30 }}>Dijana oleh CFK HUB pada {new Date().toLocaleDateString('ms-MY')}</Text>
        </View>
      </Page>

      {/* Ringkasan table */}
      <Page size="A4" style={s.page}>
        <Text style={s.seksyenTajuk}>Ringkasan Markah</Text>
        <View style={s.th}>
          <Text style={[s.thText, s.cNo]}>#</Text>
          <Text style={[s.thText, s.cNama]}>Nama</Text>
          {['Theory', 'Puzzle', 'Pract', 'Hadir', 'Sikap', 'Impr'].map((h) => <Text key={h} style={[s.thText, s.cKecil]}>{h}</Text>)}
          <Text style={[s.thText, s.cKecil]}>Jumlah</Text>
          <Text style={[s.thText, s.cGred]}>Gred</Text>
        </View>
        {pelajar.map((p, i) => (
          <View key={i} style={[s.tr, { backgroundColor: GRED_ROW_FILL[p.gred] }]}>
            <Text style={s.cNo}>{i + 1}</Text>
            <Text style={s.cNama}>{p.nama}</Text>
            {p.komponen.map((k, j) => <Text key={j} style={s.cKecil}>{k.nilai}</Text>)}
            <Text style={[s.cKecil, { fontFamily: 'Helvetica-Bold' }]}>{p.skorAkhir}</Text>
            <Text style={[s.cGred, { fontFamily: 'Helvetica-Bold', color: WARNA_GRED_PDF[p.gred].text }]}>{p.gred}</Text>
          </View>
        ))}
        <View style={s.footer}><Text style={s.footerText}>CFK HUB · {cawanganNama} · {kitaranNama}</Text></View>
      </Page>

      {/* Kad per pelajar */}
      {pelajar.map((p, i) => {
        const wg = WARNA_GRED_PDF[p.gred]
        return (
          <Page key={i} size="A4" style={s.page}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 10, borderBottom: '2px solid #1E293B', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Image src={LOGO_CFK} style={{ height: 32, width: 40 }} />
                <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1E293B' }}>CFK HUB</Text>
              </View>
              <Text style={{ fontSize: 9, color: '#64748B' }}>{kitaranNama} · {cawanganNama}</Text>
            </View>

            <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1E293B' }}>{p.nama}</Text>
            <Text style={{ fontSize: 9, color: '#64748B', marginBottom: 14 }}>{p.umur != null ? `${p.umur} tahun · ` : ''}Tahap Silibus: {p.levelNama}</Text>

            <View style={{ flexDirection: 'row', gap: 18 }}>
              <View style={{ flex: 1 }}>
                {[...p.komponen, { label: 'Bonus', nilai: p.bonus, penuh: 5 }].map((k) => (
                  <View key={k.label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ width: 70, fontSize: 8.5, color: '#475569' }}>{k.label}</Text>
                    <View style={{ flex: 1, height: 7, backgroundColor: '#F1F5F9', borderRadius: 3.5 }}>
                      <View style={{ width: `${Math.min(100, (k.nilai / k.penuh) * 100)}%`, height: 7, borderRadius: 3.5, backgroundColor: wg.solid }} />
                    </View>
                    <Text style={{ width: 46, fontSize: 8.5, fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>{k.nilai}/{k.penuh}</Text>
                  </View>
                ))}
              </View>
              <View style={{ width: 90, alignItems: 'center' }}>
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: wg.bg, borderWidth: 3, borderColor: wg.solid, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24, fontFamily: 'Helvetica-Bold', color: wg.text }}>{p.gred}</Text>
                  <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: wg.text }}>{p.skorAkhir}</Text>
                </View>
              </View>
            </View>

            <View style={{ backgroundColor: p.naikLevel ? '#F0FDF4' : '#F8FAFC', borderRadius: 6, padding: '8px 10px', marginTop: 12, borderLeft: `3px solid ${p.naikLevel ? '#84CC16' : '#94A3B8'}` }}>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: p.naikLevel ? '#166534' : '#475569' }}>{p.naikLevel ? `NAIK KE ${p.levelBaru.toUpperCase()}` : `KEKAL DI ${p.levelNama.toUpperCase()}`}</Text>
            </View>

            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginTop: 12 }}>Komen Coach</Text>
            <Text style={{ fontSize: 9, color: '#334155', marginTop: 3 }}>{p.komenCoach || '—'}</Text>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginTop: 8 }}>Fokus 3 Bulan Akan Datang</Text>
            <Text style={{ fontSize: 9, color: '#334155', marginTop: 3 }}>Beri perhatian pada: {p.fokus}.</Text>

            <View style={s.footer}><Text style={s.footerText}>Halaman {i + 3} · CFK HUB</Text></View>
          </Page>
        )
      })}
    </Document>
  )
}
