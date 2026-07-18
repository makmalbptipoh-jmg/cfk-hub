import { BorangHub } from './_components/BorangHub'

export default async function RekodBayaranPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>
}) {
  const sp = await searchParams
  return <BorangHub modAwal={sp.jenis === 'personal' ? 'personal' : 'yuran'} />
}
