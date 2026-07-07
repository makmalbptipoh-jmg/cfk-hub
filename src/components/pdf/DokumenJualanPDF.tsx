import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Maklumat syarikat (tetap)
const CFK = {
  nama: 'CHESS FOR KIDS (CFK)',
  alamat: '5B, Laluan Klebang 21, Klebang Perdana, 31200 Chemor, Perak',
}

type Jenis = 'Sebut Harga' | 'Invois' | 'Resit'

const META: Record<Jenis, { tajuk: string; prefix: string }> = {
  'Sebut Harga': { tajuk: 'SEBUT HARGA', prefix: 'SH' },
  Invois: { tajuk: 'INVOIS', prefix: 'INV' },
  Resit: { tajuk: 'RESIT RASMI', prefix: 'RS' },
}

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: '40px 48px', color: '#0F172A', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid #1E293B' },
  logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1E293B' },
  logoSub: { fontSize: 8, color: '#64748B', marginTop: 3, maxWidth: 220, lineHeight: 1.4 },
  badge: { backgroundColor: '#1E293B', color: '#FFFFFF', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  metaNilai: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#0F172A' },

  pembeliBlok: { marginBottom: 18 },
  pembeliNama: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#0F172A', marginBottom: 3 },
  pembeliBaris: { fontSize: 10, color: '#334155', lineHeight: 1.5 },

  tHead: { flexDirection: 'row', backgroundColor: '#1E293B', padding: '7px 10px', borderRadius: '4px 4px 0 0' },
  tHeadText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.6 },
  tRow: { flexDirection: 'row', padding: '8px 10px', borderBottom: '1px solid #E2E8F0' },
  tRowAlt: { backgroundColor: '#F8FAFC' },
  colBil: { width: '8%' },
  colItem: { flex: 1 },
  colQty: { width: '15%', textAlign: 'right' },
  colHarga: { width: '20%', textAlign: 'right' },
  colJumlah: { width: '20%', textAlign: 'right' },
  cell: { fontSize: 9, color: '#0F172A' },

  jumlahBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', border: '1.5px solid #1E293B', borderRadius: 8, padding: '12px 18px', marginTop: 14, marginBottom: 18 },
  jumlahLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#334155' },
  jumlahNilai: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1E293B' },

  infoBox: { borderRadius: 8, padding: '12px 16px', marginBottom: 14 },
  infoTajuk: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 },
  infoTeks: { fontSize: 10, lineHeight: 1.5 },

  footer: { marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #E2E8F0' },
  footerText: { fontSize: 8.5, color: '#64748B', marginBottom: 3 },
})

type Item = { perihalan: string; kuantiti: number; harga_seunit: number }

type Props = {
  jenis: Jenis
  no_dokumen: string // asas: YYYY-NNNNN
  tarikh: string
  pembeli_nama: string
  pembeli_alamat: string | null
  pembeli_telefon: string | null
  pembeli_emel: string | null
  pembeli_pic: string | null
  items: Item[]
  kaedah_bayaran: string | null
  maklumat_bayaran: string | null
  tarikh_bayar: string | null
  sah_sehingga: string | null
  nota: string | null
}

function fmt(n: number) {
  return n.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtTarikh(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function DokumenJualanPDF({
  jenis, no_dokumen, tarikh,
  pembeli_nama, pembeli_alamat, pembeli_telefon, pembeli_emel, pembeli_pic,
  items, kaedah_bayaran, maklumat_bayaran, tarikh_bayar, sah_sehingga, nota,
}: Props) {
  const meta = META[jenis]
  const noPapar = `${meta.prefix}${no_dokumen}`
  const jumlah = items.reduce((t, it) => t + it.kuantiti * it.harga_seunit, 0)

  return (
    <Document title={`${meta.tajuk} ${noPapar}`} author="CFK HUB" creator="CFK HUB">
      <Page size="A4" style={s.page}>
        {/* Kepala */}
        <View style={s.header}>
          <View>
            <Text style={s.logoText}>{CFK.nama}</Text>
            <Text style={s.logoSub}>{CFK.alamat}</Text>
          </View>
          <Text style={s.badge}>{meta.tajuk}</Text>
        </View>

        {/* No. dokumen + tarikh */}
        <View style={s.metaRow}>
          <View>
            <Text style={s.sectionTitle}>No. {jenis === 'Sebut Harga' ? 'Sebut Harga' : jenis === 'Invois' ? 'Invois' : 'Resit'}</Text>
            <Text style={s.metaNilai}>{noPapar}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.sectionTitle}>Tarikh</Text>
            <Text style={s.metaNilai}>{fmtTarikh(tarikh)}</Text>
          </View>
        </View>

        {/* Kepada */}
        <View style={s.pembeliBlok}>
          <Text style={s.sectionTitle}>{jenis === 'Resit' ? 'Diterima Daripada' : 'Kepada'}</Text>
          <Text style={s.pembeliNama}>{pembeli_nama}</Text>
          {pembeli_alamat ? <Text style={s.pembeliBaris}>{pembeli_alamat}</Text> : null}
          {pembeli_pic ? <Text style={s.pembeliBaris}>Untuk perhatian: {pembeli_pic}</Text> : null}
          {pembeli_telefon ? <Text style={s.pembeliBaris}>Tel: {pembeli_telefon}</Text> : null}
          {pembeli_emel ? <Text style={s.pembeliBaris}>E-mel: {pembeli_emel}</Text> : null}
        </View>

        {/* Jadual item */}
        <View style={s.tHead}>
          <Text style={[s.tHeadText, s.colBil]}>Bil</Text>
          <Text style={[s.tHeadText, s.colItem]}>Perihalan</Text>
          <Text style={[s.tHeadText, s.colQty]}>Kuantiti</Text>
          <Text style={[s.tHeadText, s.colHarga]}>Harga (RM)</Text>
          <Text style={[s.tHeadText, s.colJumlah]}>Jumlah (RM)</Text>
        </View>
        {items.map((it, i) => (
          <View key={i} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
            <Text style={[s.cell, s.colBil]}>{i + 1}</Text>
            <Text style={[s.cell, s.colItem]}>{it.perihalan}</Text>
            <Text style={[s.cell, s.colQty]}>{fmt(it.kuantiti)}</Text>
            <Text style={[s.cell, s.colHarga]}>{fmt(it.harga_seunit)}</Text>
            <Text style={[s.cell, s.colJumlah]}>{fmt(it.kuantiti * it.harga_seunit)}</Text>
          </View>
        ))}

        {/* Jumlah keseluruhan */}
        <View style={s.jumlahBox}>
          <Text style={s.jumlahLabel}>JUMLAH KESELURUHAN</Text>
          <Text style={s.jumlahNilai}>RM {fmt(jumlah)}</Text>
        </View>

        {/* Bahagian khas ikut jenis */}
        {jenis === 'Sebut Harga' && (
          <View style={[s.infoBox, { backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }]}>
            <Text style={[s.infoTajuk, { color: '#92400E' }]}>Perhatian</Text>
            <Text style={[s.infoTeks, { color: '#92400E' }]}>
              {sah_sehingga ? `Sebut harga ini sah sehingga ${fmtTarikh(sah_sehingga)}. ` : ''}
              Sila hubungi kami untuk mengesahkan tempahan.
            </Text>
          </View>
        )}

        {jenis === 'Invois' && (
          <View style={[s.infoBox, { backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }]}>
            <Text style={[s.infoTajuk, { color: '#1E40AF' }]}>Cara Bayaran</Text>
            {kaedah_bayaran === 'Tunai' ? (
              <Text style={[s.infoTeks, { color: '#1E3A8A' }]}>Bayaran boleh dibuat secara tunai.</Text>
            ) : (
              <Text style={[s.infoTeks, { color: '#1E3A8A' }]}>
                {maklumat_bayaran?.trim()
                  ? maklumat_bayaran
                  : 'Sila hubungi kami untuk butiran akaun bank bagi bayaran.'}
              </Text>
            )}
          </View>
        )}

        {jenis === 'Resit' && (
          <View style={[s.infoBox, { backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }]}>
            <Text style={[s.infoTajuk, { color: '#166534' }]}>Pengesahan Bayaran</Text>
            <Text style={[s.infoTeks, { color: '#166534', fontFamily: 'Helvetica-Bold' }]}>
              Diterima dengan {(kaedah_bayaran ?? 'Tunai').toLowerCase() === 'tunai' ? 'tunai' : 'pemindahan bank'}
              {tarikh_bayar ? ` pada ${fmtTarikh(tarikh_bayar)}` : ''}.
            </Text>
          </View>
        )}

        {/* Nota / catatan */}
        {nota?.trim() ? (
          <View style={[s.infoBox, { backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }]}>
            <Text style={[s.infoTajuk, { color: '#64748B' }]}>Catatan</Text>
            <Text style={[s.infoTeks, { color: '#334155' }]}>{nota}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            {jenis === 'Resit'
              ? 'Resit ini dijana secara digital dan tidak memerlukan tandatangan.'
              : jenis === 'Invois'
                ? 'Sila jelaskan bayaran mengikut butiran di atas dan simpan invois ini sebagai rujukan.'
                : 'Dokumen ini adalah sebut harga dan bukan invois untuk bayaran.'}
          </Text>
          <Text style={[s.footerText, { fontFamily: 'Helvetica-Bold', color: '#334155' }]}>
            Terima kasih atas urusan anda bersama Chess For Kids.
          </Text>
          <Text style={[s.footerText, { marginTop: 6, color: '#94A3B8' }]}>
            Dijana oleh CFK HUB {'·'} {new Date().toLocaleDateString('ms-MY')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
