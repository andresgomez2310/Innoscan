import { createClient } from "@/lib/supabase/server"
import { Dashboard } from "@/components/dashboard"

export default async function HomePage() {
  const supabase = await createClient()

  const [productosRes, ideasRes, escaneosRes, recsRes] = await Promise.all([
    supabase.from("productos").select("*").order("created_at", { ascending: false }),
    supabase.from("ideas").select("*, productos(nombre)").order("created_at", { ascending: false }),
    supabase.from("escaneos").select("*, productos(nombre)").order("created_at", { ascending: false }).limit(50),
    supabase.from("recomendaciones").select("id, producto_id, producto_nombre, estrategia_key, estrategia_nombre, confianza_promedio, estado, created_at").order("created_at", { ascending: false }).limit(50),
  ])

  if (productosRes.error) console.error("[DB] productos:", productosRes.error.message)
  if (ideasRes.error)     console.error("[DB] ideas:",     ideasRes.error.message)
  if (escaneosRes.error)  console.error("[DB] escaneos:",  escaneosRes.error.message)
  if (recsRes.error)      console.error("[DB] recs:",      recsRes.error.message)

  return (
    <Dashboard
      productos={productosRes.data ?? []}
      ideas={ideasRes.data ?? []}
      escaneos={escaneosRes.data ?? []}
      recomendaciones={recsRes.data ?? []}
    />
  )
}
