import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_CFK } from './logoCfk'

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
  colStatus: { width: '20%' },
  colNota: { width: '28%' },
  colTanda: { width: '8%', textAlign: 'center' },
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
  /** Mod harian: status pelajar pada tarikh itu */
  status?: 'Hadir' | 'Tidak Hadir' | 'Cuti'
  nota?: string | null
  /** Mod bulanan: tanda ringkas (H/T/C/-) sejajar dengan tarikhKolum */
  tanda?: string[]
}

type Props = {
  cawangan: string
  /** Baris tempoh pada tajuk, cth. "14 Julai 2026 (Ahad)" atau "Julai 2026 — Setiap Ahad" */
  tempoh: string
  baris: BarisKelas[]
  mod: 'harian' | 'bulanan'
  /** Mod bulanan: label kolum tarikh (cth. ["3", "10", "17"]) */
  tarikhKolum?: string[]
}

const WARNA_STATUS: Record<string, string> = { Hadir: '#166534', 'Tidak Hadir': '#9F1239', Cuti: '#92400E' }

export function LaporanKelasPDF({ cawangan, tempoh, baris, mod, tarikhKolum = [] }: Props) {
  const jumHadir = baris.reduce((t, b) => t + b.hadir, 0)
  const jumTidak = baris.reduce((t, b) => t + b.tidakHadir, 0)
  const jumCuti = baris.reduce((t, b) => t + b.cuti, 0)
  const purata = baris.length > 0 ? Math.round(baris.reduce((t, b) => t + b.peratus, 0) / baris.length) : 0
  const landskap = mod === 'bulanan' && tarikhKolum.length > 5

  return (
    <Document title={`Laporan Kehadiran Kelas — ${cawangan} — ${tempoh}`} author="CFK HUB">
      <Page size="A4" orientation={landskap ? 'landscape' : 'portrait'} style={s.page}>
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image src={LOGO_CFK} style={{ height: 42, width: 52 }} />
            <View>
              <Text style={s.logoText}>CFK HUB</Text>
              <Text style={s.logoSub}>Catur Untuk Kanak-Kanak</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.tajuk}>Laporan Kehadiran Kelas</Text>
            <Text style={s.subjudul}>{tempoh}</Text>
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
            <Text style={s.maklumatLabel}>{mod === 'harian' ? 'Hadir Pada Tarikh Ini' : 'Purata Kehadiran'}</Text>
            <Text style={s.maklumatNilai}>{mod === 'harian' ? `${jumHadir} / ${baris.length}` : `${purata}%`}</Text>
          </View>
        </View>

        {baris.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#64748B' }}>Tiada rekod kehadiran untuk kelas ini pada tempoh tersebut.</Text>
          </View>
        ) : mod === 'harian' ? (
          <View>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, s.colNo]}>No.</Text>
              <Text style={[s.tableHeaderText, s.colNama]}>Nama Pelajar</Text>
              <Text style={[s.tableHeaderText, s.colKelas]}>Jenis</Text>
              <Text style={[s.tableHeaderText, s.colStatus]}>Status</Text>
              <Text style={[s.tableHeaderText, s.colNota]}>Nota</Text>
            </View>
            {baris.map((b, i) => (
              <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={[{ fontSize: 8, color: '#64748B' }, s.colNo]}>{i + 1}</Text>
                <Text style={[{ fontSize: 9, color: '#0F172A' }, s.colNama]}>{b.nama_penuh}</Text>
                <Text style={[{ fontSize: 8, color: '#64748B' }, s.colKelas]}>{b.jenis_kelas}</Text>
                <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: WARNA_STATUS[b.status ?? ''] ?? '#64748B' }, s.colStatus]}>{b.status ?? '-'}</Text>
                <Text style={[{ fontSize: 8, color: '#64748B' }, s.colNota]}>{b.nota || '-'}</Text>
              </View>
            ))}
            <View style={[s.tableRow, { backgroundColor: '#F1F5F9', borderTop: '2px solid #CBD5E1' }]}>
              <Text style={[{ fontSize: 9 }, s.colNo]}></Text>
              <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1E293B' }, s.colNama]}>JUMLAH</Text>
              <Text style={[{ fontSize: 8 }, s.colKelas]}></Text>
              <Text style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1E293B' }, { width: '48%' }]}>
                Hadir {jumHadir} · Tidak Hadir {jumTidak} · Cuti {jumCuti}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, s.colNo]}>No.</Text>
              <Text style={[s.tableHeaderText, s.colNama]}>Nama Pelajar</Text>
              {tarikhKolum.map((t) => (
                <Text key={t} style={[s.tableHeaderText, s.colTanda]}>{t}</Text>
              ))}
              <Text style={[s.tableHeaderText, s.colTanda]}>H</Text>
              <Text style={[s.tableHeaderText, s.colTanda]}>T</Text>
              <Text style={[s.tableHeaderText, s.colTanda]}>C</Text>
              <Text style={[s.tableHeaderText, s.colTanda]}>%</Text>
            </View>
            {baris.map((b, i) => (
              <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={[{ fontSize: 8, color: '#64748B' }, s.colNo]}>{i + 1}</Text>
                <Text style={[{ fontSize: 9, color: '#0F172A' }, s.colNama]}>{b.nama_penuh}</Text>
                {(b.tanda ?? []).map((t, j) => (
                  <Text key={j} style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: t === 'H' ? '#166534' : t === 'T' ? '#9F1239' : t === 'C' ? '#92400E' : '#CBD5E1' }, s.colTanda]}>{t}</Text>
                ))}
                <Text style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#166534' }, s.colTanda]}>{b.hadir}</Text>
                <Text style={[{ fontSize: 8, color: '#9F1239' }, s.colTanda]}>{b.tidakHadir}</Text>
                <Text style={[{ fontSize: 8, color: '#92400E' }, s.colTanda]}>{b.cuti}</Text>
                <Text style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1E40AF' }, s.colTanda]}>{b.peratus}%</Text>
              </View>
            ))}
            <View style={[s.tableRow, { backgroundColor: '#F1F5F9', borderTop: '2px solid #CBD5E1' }]}>
              <Text style={[{ fontSize: 9 }, s.colNo]}></Text>
              <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1E293B' }, s.colNama]}>JUMLAH</Text>
              {tarikhKolum.map((t) => (
                <Text key={t} style={[{ fontSize: 8 }, s.colTanda]}></Text>
              ))}
              <Text style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#166534' }, s.colTanda]}>{jumHadir}</Text>
              <Text style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9F1239' }, s.colTanda]}>{jumTidak}</Text>
              <Text style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#92400E' }, s.colTanda]}>{jumCuti}</Text>
              <Text style={[{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1E40AF' }, s.colTanda]}>{purata}%</Text>
            </View>
          </View>
        )}

        <View style={s.footer}>
          <Text style={s.footerText}>
            {mod === 'bulanan'
              ? 'H = Hadir, T = Tidak Hadir, C = Cuti, - = tiada rekod. % kehadiran = Hadir / jumlah sesi direkod. '
              : ''}
            Dijana automatik oleh CFK HUB pada {new Date().toLocaleDateString('ms-MY')}.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
