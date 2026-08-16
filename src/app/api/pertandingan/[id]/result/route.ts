import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseRankingBuffer } from '@/lib/pertandingan-parse'
import { pingatUntukKedudukan } from '@/lib/pertandingan'

// WAJIB: Node runtime (SheetJS baca buffer) & jangan cache.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normNama(s: string): string {
  return s.trim().toUpperCase().replace(/\s+/g, ' ')
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: pertandinganId } = await ctx.params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ralat: 'Sila log masuk semula.' }, { status: 401 })

    const form = await req.formData()
    const fail = form.get('fail')
    if (!(fail instanceof File)) {
      return NextResponse.json({ ralat: 'Tiada fail dimuat naik.' }, { status: 400 })
    }

    // Parse fail ranking (.xls / .xlsx)
    const buf = new Uint8Array(await fail.arrayBuffer())
    let hasil
    try {
      hasil = parseRankingBuffer(buf)
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Fail tidak dapat dibaca.'
      return NextResponse.json({ ralat: m }, { status: 400 })
    }
    if (hasil.baris.length === 0) {
      return NextResponse.json({ ralat: 'Tiada baris pemain dijumpai dalam fail.' }, { status: 400 })
    }

    // Peta peserta didaftar: nama_ekspot (dinormal) → { peserta_id, pelajar_id }
    const { data: pesertaRows, error: ralatPeserta } = await supabase
      .from('pertandingan_peserta')
      .select('id, pelajar_id, nama_ekspot')
      .eq('pertandingan_id', pertandinganId)
    if (ralatPeserta) throw ralatPeserta

    const peta = new Map<string, { peserta_id: string; pelajar_id: string }>()
    for (const p of pesertaRows ?? []) {
      peta.set(normNama(p.nama_ekspot), { peserta_id: p.id, pelajar_id: p.pelajar_id })
    }

    const jumlahPeserta = hasil.baris.length
    const takPadan: string[] = []

    const insertRows = hasil.baris.map((b) => {
      const padan = peta.get(normNama(b.nama))
      if (!padan) takPadan.push(b.nama)
      return {
        pertandingan_id: pertandinganId,
        peserta_id: padan?.peserta_id ?? null,
        pelajar_id: padan?.pelajar_id ?? null,
        nama_ranking: b.nama,
        kedudukan: b.kedudukan,
        sno: b.sno,
        mata: b.mata,
        buchholz: b.buchholz,
        sonneborn: b.sonneborn,
        pecah_seri: b.pecahSeri,
        jumlah_peserta: jumlahPeserta,
        pingat: pingatUntukKedudukan(b.kedudukan),
      }
    })

    // Ganti keputusan sedia ada (upload semula = tulis ganti)
    const { error: ralatPadam } = await supabase
      .from('pertandingan_keputusan')
      .delete()
      .eq('pertandingan_id', pertandinganId)
    if (ralatPadam) throw ralatPadam

    const { error: ralatInsert } = await supabase
      .from('pertandingan_keputusan')
      .insert(insertRows)
    if (ralatInsert) throw ralatInsert

    const { error: ralatStatus } = await supabase
      .from('pertandingan')
      .update({ status: 'Selesai' })
      .eq('id', pertandinganId)
    if (ralatStatus) throw ralatStatus

    return NextResponse.json({
      jumlah: insertRows.length,
      dipadan: insertRows.length - takPadan.length,
      takPadan,
      tajuk: hasil.tajuk,
    })
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Ralat tidak diketahui semasa proses result.'
    return NextResponse.json({ ralat: m }, { status: 500 })
  }
}
