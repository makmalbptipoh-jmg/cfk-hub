import { cache } from 'react'
import { createClient } from './server'

// Pengguna log masuk semasa — dikongsi dalam SATU request (layout + page +
// komponen server) supaya auth.getUser() ke Supabase dipanggil sekali sahaja.
// Proxy (lib/supabase/middleware.ts) masih semak sendiri untuk segar token.
export const penggunaSemasa = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
