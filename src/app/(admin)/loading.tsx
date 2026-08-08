import { SkeletonPage } from '@/components/ui/SkeletonPage'

// Fallback loading peringkat KUMPULAN (admin) — dipapar untuk mana-mana segmen
// admin yang TIADA loading.tsx sendiri (silibus, kehadiran, tetapan, notifikasi,
// makluman, aset, bahan, dll). Elak skrin kosong semasa navigasi; segmen yang
// ada loading.tsx sendiri (dashboard, pelajar, dsb.) kekal guna miliknya.
export default function Loading() {
  return <SkeletonPage kad={4} />
}
