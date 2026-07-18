import { redirect } from 'next/navigation'

// Borang sesi kelas personal kini disatukan dalam /bayaran/baharu
// (togol "Sesi Kelas Personal"). Redirect kekal untuk link/bookmark lama.
export default function KelasPersonalBaharuPage() {
  redirect('/bayaran/baharu?jenis=personal')
}
