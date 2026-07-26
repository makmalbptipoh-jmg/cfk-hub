import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: '30px 36px 46px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #1E293B' },
  logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  tajuk: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B', marginBottom: 3 },
  subjudul: { fontSize: 10, color: '#64748B' },

  ringkasan: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kad: { flex: 1, border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 10px' },
  kadLabel: { fontSize: 7.5, color: '#64748B', letterSpacing: 0.4, marginBottom: 3 },
  kadNilai: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#0F172A' },

  kategoriTajuk: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', backgroundColor: '#1E293B', padding: '6px 9px', marginTop: 10 },
  jadual: { border: '1px solid #E2E8F0', borderTop: 'none' },
  barisHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' },
  selHeader: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#475569', padding: '5px 8px', letterSpacing: 0.3 },
  baris: { flexDirection: 'row', borderTop: '1px solid #E2E8F0' },
  barisGenap: { backgroundColor: '#F8FAFC' },
  sel: { fontSize: 9, padding: '6px 8px', color: '#0F172A' },
  butiran: { fontSize: 8, color: '#64748B', marginTop: 2 },

  kosong: { padding: '24px 8px', fontSize: 9.5, color: '#94A3B8', textAlign: 'center', border: '1px solid #E2E8F0' },
  nota: { fontSize: 8, color: '#94A3B8', marginTop: 12 },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, paddingTop: 8, borderTop: '1px solid #E2E8F0', flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, color: '#94A3B8' },
})

// Lebar kolum (flex)
const L = { tarikh: 1.1, tajuk: 3.4, buku: 2, tahap: 1.3 }

export type BarisProgres = {
  tarikh: string // sudah diformat, cth "20/07/2026"
  tajuk: string
  butiran: string
  buku: string // nama buku + muka surat
  tahap: string
}

export type KumpulanProgres = {
  kategori: string
  baris: BarisProgres[]
}

type Props = {
  namaPelajar: string
  cawangan: string
  jenisKelas: string
  ringkasan: { jumlah: number; baruDiajar: number; sedangLatih: number; sudahKuasai: number; peratusKuasai: number }
  kumpulan: KumpulanProgres[]
  tarikhJana: string
}

export function LaporanProgresPDF({ namaPelajar, cawangan, jenisKelas, ringkasan, kumpulan, tarikhJana }: Props) {
  return (
    <Document title={`Progress Pembelajaran — ${namaPelajar}`} author="CFK HUB">
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
            <Text style={s.tajuk}>PROGRESS PEMBELAJARAN</Text>
            <Text style={s.subjudul}>{namaPelajar}</Text>
            <Text style={s.subjudul}>{cawangan} · {jenisKelas}</Text>
          </View>
        </View>

        <View style={s.ringkasan}>
          <View style={s.kad}>
            <Text style={s.kadLabel}>JUMLAH TAJUK</Text>
            <Text style={s.kadNilai}>{ringkasan.jumlah}</Text>
          </View>
          <View style={s.kad}>
            <Text style={s.kadLabel}>BARU DIAJAR</Text>
            <Text style={s.kadNilai}>{ringkasan.baruDiajar}</Text>
          </View>
          <View style={s.kad}>
            <Text style={s.kadLabel}>SEDANG LATIH</Text>
            <Text style={s.kadNilai}>{ringkasan.sedangLatih}</Text>
          </View>
          <View style={s.kad}>
            <Text style={s.kadLabel}>SUDAH KUASAI</Text>
            <Text style={s.kadNilai}>{ringkasan.sudahKuasai} ({ringkasan.peratusKuasai}%)</Text>
          </View>
        </View>

        {kumpulan.length === 0 ? (
          <Text style={s.kosong}>Tiada rekod progress untuk pelajar ini.</Text>
        ) : (
          kumpulan.map((k) => (
            <View key={k.kategori} wrap={false}>
              <Text style={s.kategoriTajuk}>{k.kategori.toUpperCase()} ({k.baris.length})</Text>
              <View style={s.jadual}>
                <View style={s.barisHeader}>
                  <Text style={[s.selHeader, { flex: L.tarikh }]}>TARIKH</Text>
                  <Text style={[s.selHeader, { flex: L.tajuk }]}>TAJUK</Text>
                  <Text style={[s.selHeader, { flex: L.buku }]}>BUKU / MUKA SURAT</Text>
                  <Text style={[s.selHeader, { flex: L.tahap }]}>TAHAP</Text>
                </View>
                {k.baris.map((b, i) => (
                  <View key={i} style={i % 2 === 1 ? [s.baris, s.barisGenap] : s.baris}>
                    <Text style={[s.sel, { flex: L.tarikh }]}>{b.tarikh}</Text>
                    <View style={{ flex: L.tajuk, padding: '6px 8px' }}>
                      <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#0F172A' }}>{b.tajuk}</Text>
                      {b.butiran ? <Text style={s.butiran}>{b.butiran}</Text> : null}
                    </View>
                    <Text style={[s.sel, { flex: L.buku }]}>{b.buku || '—'}</Text>
                    <Text style={[s.sel, { flex: L.tahap }]}>{b.tahap}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        <Text style={s.nota}>
          Tahap: Baru Diajar = baru diperkenalkan · Sedang Latih = sedang diulang &amp; dilatih · Sudah Kuasai = pelajar sudah boleh guna sendiri.
        </Text>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Laporan progress pembelajaran catur — CFK.</Text>
          <Text style={s.footerText}>Dijana oleh CFK HUB pada {tarikhJana}</Text>
        </View>
      </Page>
    </Document>
  )
}
