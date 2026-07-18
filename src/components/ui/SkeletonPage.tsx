// Skeleton loading ringkas untuk route (admin) — dipapar oleh Next.js
// melalui loading.tsx sementara server component memuat data.
export function SkeletonPage({ kad = 4, jadual = true }: { kad?: number; jadual?: boolean }) {
  const denyut = {
    background: 'var(--border)',
    borderRadius: '10px',
    animation: 'skelDenyut 1.4s ease-in-out infinite',
  }
  return (
    <div style={{ maxWidth: '1100px' }}>
      <style>{`@keyframes skelDenyut { 0%, 100% { opacity: 0.55 } 50% { opacity: 0.25 } }`}</style>
      {/* Tajuk */}
      <div style={{ ...denyut, height: '26px', width: '220px', marginBottom: '10px' }} />
      <div style={{ ...denyut, height: '14px', width: '320px', marginBottom: '26px' }} />
      {/* Kad stat */}
      {kad > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(kad, 4)}, 1fr)`, gap: '14px', marginBottom: '24px' }}>
          {Array.from({ length: kad }, (_, i) => (
            <div key={i} style={{ ...denyut, height: '104px', borderRadius: '16px' }} />
          ))}
        </div>
      )}
      {/* Jadual/senarai */}
      {jadual && <div style={{ ...denyut, height: '320px', borderRadius: '16px' }} />}
    </div>
  )
}
