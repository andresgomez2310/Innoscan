"use client"
import { useEffect, useState } from "react"
import { Dashboard } from "@/components/dashboard"
import { apiProductosList, apiIdeasList, apiEscaneosList, apiRecommendList } from "@/lib/api/client"

export default function HomePage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      apiProductosList(),
      apiIdeasList(),
      apiEscaneosList(1, 50),
      apiRecommendList(),
    ]).then(([productos, ideas, escaneosRes, recomendaciones]) => {
      console.log("✅ datos del backend:", { productos, ideas, escaneosRes, recomendaciones })
      setData({
        productos,
        ideas,
        escaneos: (escaneosRes as any)?.data ?? [],
        recomendaciones,
      })
    }).catch(e => console.error("❌ error:", e))
  }, [])

  if (!data) return <p style={{padding:40}}>Cargando...</p>

  return (
    <Dashboard
      productos={data.productos}
      ideas={data.ideas}
      escaneos={data.escaneos}
      recomendaciones={data.recomendaciones}
    />
  )
}