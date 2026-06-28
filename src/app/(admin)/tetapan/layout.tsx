import { TetapanNav } from './_components/TetapanNav'

export default function TetapanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TetapanNav />
      {children}
    </div>
  )
}
