import { KewanganNav } from './_components/KewanganNav'

export default function KewanganLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: '900px' }}>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.3px',
          marginBottom: '20px',
        }}
      >
        Kewangan
      </h1>
      <KewanganNav />
      {children}
    </div>
  )
}
