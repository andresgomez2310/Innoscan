import { createClient } from "@/lib/supabase/server"
import { Dashboard } from "@/components/dashboard"

export default async function HomePage() {
  const supabase = await createClient()

  const [productosRes, ideasRes, escaneosRes] = await Promise.all([
    supabase.from("productos").select("*").order("created_at", { ascending: false }),
    supabase.from("ideas").select("*, productos(nombre)").order("created_at", { ascending: false }),
    supabase.from("escaneos").select("*, productos(nombre)").order("created_at", { ascending: false }).limit(10),
  ])

  return (
    <Dashboard
      productos={productosRes.data || []}
      ideas={ideasRes.data || []}
      escaneos={escaneosRes.data || []}
    />
  )
}
