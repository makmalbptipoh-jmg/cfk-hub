import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'

const HARI = ['AHAD', 'ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT', 'SABTU']

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: '26px 30px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '2px solid #1E293B' },
  logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  tajuk: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginBottom: 3 },
  subjudul: { fontSize: 11, color: '#64748B' },
  gridBaris: { flexDirection: 'row', gap: 5, flex: 1 },
  kolum: { flex: 1, borderRadius: 6, border: '1px solid #E2E8F0', overflow: 'hidden' },
  kolumHeader: { backgroundColor: '#1E293B', padding: '5px 4px' },
  kolumHeaderText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.5 },
  kolumBadan: { padding: 4, gap: 4 },
  slotBox: { borderRadius: 5, border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '5px 5px' },
  slotBoxPersonal: { backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' },
  slotMasa: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginBottom: 2 },
  slotNama: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#0F172A', marginBottom: 1 },
  slotJenis: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#3F6212', marginBottom: 2 },
  slotJenisPersonal: { color: '#1E40AF' },
  slotButiran: { fontSize: 7, color: '#64748B', lineHeight: 1.35 },
  slotBoxBatal: { backgroundColor: '#FEF2F2', border: '1px solid #FECACA' },
  slotBatalLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#DC2626', marginBottom: 2 },
  teksBatal: { color: '#94A3B8', textDecoration: 'line-through' },
  kolumHeaderTarikh: { fontSize: 7, color: '#CBD5E1', textAlign: 'center', marginTop: 1 },
  kosong: { fontSize: 8, color: '#94A3B8', textAlign: 'center', padding: '10px 0' },
  footer: { marginTop: 10, paddingTop: 8, borderTop: '1px solid #E2E8F0', flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, color: '#94A3B8' },
})

export type SlotPdf = {
  hari_minggu: number
  masa: string // cth. "9:00 PG - 12:00 TGH"
  nama: string // nama cawangan (Kumpulan) atau pelajar (Personal)
  jenis: 'Kumpulan' | 'Personal'
  jurulatih: string // "" jika tiada
  lokasi: string // "" jika tiada
  dibatalkan?: boolean // dibatalkan pada minggu yang dicetak
}

type Props = {
  cawangan: string // nama cawangan dipilih atau "Semua Cawangan"
  slot: SlotPdf[]
  tarikhJana: string // cth. "18/07/2026"
  tarikhKolum?: string[] // 7 tarikh pendek (Ahad→Sabtu) minggu dicetak, cth "20/07"
}

export function JadualMingguPDF({ cawangan, slot, tarikhJana, tarikhKolum }: Props) {
  return (
    <Document title={`Jadual Kelas Mingguan — ${cawangan}`} author="CFK HUB">
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image src={LOGO_CFK} style={{ height: 42, width: 52 }} />
            <View>
              <Text style={s.logoText}>CFK HUB</Text>
              <Text style={s.logoSub}>Catur Untuk Kanak-Kanak</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.tajuk}>JADUAL KELAS MINGGUAN</Text>
            <Text style={s.subjudul}>{cawangan}</Text>
          </View>
        </View>

        <View style={s.gridBaris}>
          {HARI.map((nama, hari) => {
            const slotHari = slot.filter((x) => x.hari_minggu === hari)
            return (
              <View key={hari} style={s.kolum}>
                <View style={s.kolumHeader}>
                  <Text style={s.kolumHeaderText}>{nama}</Text>
                  {tarikhKolum?.[hari] ? <Text style={s.kolumHeaderTarikh}>{tarikhKolum[hari]}</Text> : null}
                </View>
                <View style={s.kolumBadan}>
                  {slotHari.length === 0 ? (
                    <Text style={s.kosong}>—</Text>
                  ) : (
                    slotHari.map((x, i) => (
                      <View
                        key={i}
                        style={
                          x.dibatalkan
                            ? [s.slotBox, s.slotBoxBatal]
                            : x.jenis === 'Personal'
                              ? [s.slotBox, s.slotBoxPersonal]
                              : s.slotBox
                        }
                      >
                        <Text style={x.dibatalkan ? [s.slotMasa, s.teksBatal] : s.slotMasa}>{x.masa}</Text>
                        <Text style={x.dibatalkan ? [s.slotNama, s.teksBatal] : s.slotNama}>{x.nama}</Text>
                        {x.dibatalkan ? (
                          <Text style={s.slotBatalLabel}>DIBATALKAN</Text>
                        ) : (
                          <Text style={x.jenis === 'Personal' ? [s.slotJenis, s.slotJenisPersonal] : s.slotJenis}>
                            {x.jenis.toUpperCase()}
                          </Text>
                        )}
                        {x.jurulatih && !x.dibatalkan ? <Text style={s.slotButiran}>Jurulatih: {x.jurulatih}</Text> : null}
                        {x.lokasi && !x.dibatalkan ? <Text style={s.slotButiran}>Lokasi: {x.lokasi}</Text> : null}
                      </View>
                    ))
                  )}
                </View>
              </View>
            )
          })}
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Jadual berulang setiap minggu. Sebarang perubahan akan dimaklumkan oleh pihak CFK.</Text>
          <Text style={s.footerText}>Dijana oleh CFK HUB pada {tarikhJana}</Text>
        </View>
      </Page>
    </Document>
  )
}
