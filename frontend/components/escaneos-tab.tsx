"use client"
import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Badge }  from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiEscaneoCreate, apiEscaneoDelete, type Escaneo } from "@/lib/api/client"

const CONDICIONES = ["nuevo","bueno","regular","dañado","antiguo","raro"]
const COND_COLOR: Record<string, string> = {
  nuevo:    "border-emerald-500/30 text-emerald-400",
  bueno:    "border-blue-500/30 text-blue-400",
  regular:  "border-yellow-500/30 text-yellow-400",
  dañado:   "border-red-500/30 text-red-400",
  antiguo:  "border-purple-500/30 text-purple-400",
  raro:     "border-pink-500/30 text-pink-400",
}

export function EscaneosTab({
  escaneos: inicial,
  productos,
}: {
  escaneos: Escaneo[]
  productos: { id: string; nombre: string; categoria: string | null }[]
}) {
  const router = useRouter()
  const [escaneos,   setEscaneos]   = useState(inicial)
  const [productoId, setProductoId] = useState("")
  const [condicion,  setCondicion]  = useState("bueno")
  const [notas,      setNotas]      = useState("")
  const [filtroCond, setFiltroCond] = useState("todas")
  const [filtroProd, setFiltroProd] = useState("")
  const [error,      setError]      = useState("")
  const [pending,    startTransition] = useTransition()

  const filtrados = escaneos.filter((e: any) => {
    const cond = e.condition ?? e.ubicacion ?? ""
    const matchCond = filtroCond === "todas" || cond === filtroCond
    const nombre = e.itemName ?? e.notas ?? ""
    const matchProd = !filtroProd || nombre.toLowerCase().includes(filtroProd.toLowerCase())
    return matchCond && matchProd
  })

  const crear = async () => {
    if (!productoId) { setError("Selecciona un producto"); return }
    setError("")
    try {
      const prod = productos.find(p => p.id === productoId)
      const nuevo = await apiEscaneoCreate({
        itemName:    prod?.nombre ?? "",
        categoryId:  productoId,
        condition:   condicion,
        description: notas || undefined,
      })
      setEscaneos(prev => [nuevo, ...prev])
      setProductoId(""); setCondicion("bueno"); setNotas("")
      startTransition(() => router.refresh())
    } catch (e: any) { setError(e.message) }
  }

  const eliminar = async (id: string) => {
    try {
      await apiEscaneoDelete(id)
      setEscaneos(prev => prev.filter((e: any) => e.id !== id))
    } catch (e: any) { setError(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold">Escaneos</h2>
          <p className="text-sm text-muted-foreground">Registra y consulta escaneos de productos</p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">{escaneos.length} total</Badge>
      </div>

      {/* Formulario */}
      <div className="border rounded-xl p-4 space-y-3 max-w-lg">
        <p className="text-sm font-medium">Nuevo escaneo</p>
        {productos.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Primero crea productos en la pestaña Productos</p>
        ) : (
          <Select value={productoId} onValueChange={v => { setProductoId(v); setError("") }}>
            <SelectTrigger><SelectValue placeholder="Selecciona un producto *" /></SelectTrigger>
            <SelectContent>
              {productos.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre} {p.categoria && `· ${p.categoria}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex flex-wrap gap-2">
          {CONDICIONES.map(c => (
            <button key={c} onClick={() => setCondicion(c)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                condicion === c
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground"
              }`}>{c}</button>
          ))}
        </div>
        <Input placeholder="Notas adicionales (opcional)" value={notas} onChange={e => setNotas(e.target.value)} />
        {error && <p className="text-xs text-destructive">⚠ {error}</p>}
        <Button onClick={crear} disabled={pending || productos.length === 0} className="w-full">
          {pending ? "Guardando..." : "Registrar escaneo"}
        </Button>
      </div>

      {/* Filtros */}
      <div className="space-y-3 max-w-2xl">
        <Input
          placeholder="Buscar por producto..."
          value={filtroProd}
          onChange={e => setFiltroProd(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFiltroCond("todas")}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              filtroCond === "todas" ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground"
            }`}>Todas</button>
          {CONDICIONES.map(c => (
            <button key={c} onClick={() => setFiltroCond(filtroCond === c ? "todas" : c)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                filtroCond === c ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground"
              }`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          {escaneos.length === 0 ? "No hay escaneos todavía" : "No hay escaneos con ese filtro"}
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{filtrados.length} escaneo{filtrados.length !== 1 ? "s" : ""}</p>
          {filtrados.map((e: any) => {
            const cond = e.condition ?? e.ubicacion ?? "—"
            const nombre = e.itemName ?? e.notas ?? "Escaneo"
            const col = COND_COLOR[cond] ?? "border-border text-muted-foreground"
            return (
              <div key={e.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{nombre}</p>
                  <p className="text-xs text-muted-foreground/50 font-mono mt-0.5">
                    {e.createdAt
                      ? new Date(e.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
                      : e.created_at
                      ? new Date(e.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </p>
                </div>
                <Badge variant="outline" className={`text-xs flex-shrink-0 ${col}`}>{cond}</Badge>
                <button onClick={() => eliminar(e.id)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors p-1">✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
