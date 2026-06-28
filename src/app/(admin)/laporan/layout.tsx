import { LaporanNav } from './_components/LaporanNav'

export default function LaporanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <LaporanNav />
      {children}
    </div>
  )
}
