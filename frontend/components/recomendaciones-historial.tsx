"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { apiRecommendList } from "@/lib/api/client"
import { Clock, Sparkles } from "lucide-react"

export function RecomendacionesHistorial() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadHistory() {
    try {
      setLoading(true)
      setError("")
      const data = await apiRecommendList()
      setItems(data)
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar el historial")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/20 p-6 text-sm text-slate-400">
        Cargando historial de recomendaciones...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-400">
        {error}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/20 p-8 text-center text-slate-500">
        <Sparkles className="mx-auto mb-3 h-8 w-8 opacity-40" />
        <p className="text-sm font-medium">Aún no hay recomendaciones guardadas.</p>
        <p className="text-xs mt-1">Genera una recomendación para verla aquí.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const firstRec = item.recomendaciones?.[0]

        return (
          <Card
            key={item.id}
            className="border-white/10 bg-[#0D1117] text-white rounded-3xl"
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm">
                    {firstRec?.title || item.estrategia_nombre || "Recomendación"}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "Fecha no disponible"}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className="text-[#00FF66] border-[#00FF66]/20"
                >
                  {item.estrategia_nombre || "IA"}
                </Badge>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {firstRec?.description || "Sin descripción disponible"}
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span>Producto: {item.producto_nombre || "No disponible"}</span>
                <span>·</span>
                <span>Condición: {item.condicion || "No disponible"}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}