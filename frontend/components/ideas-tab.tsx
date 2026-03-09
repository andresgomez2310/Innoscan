"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Badge }  from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiIdeaCreate, apiIdeaUpdateEstado, apiIdeaDelete, type Idea } from "@/lib/api/client"

const ESTADOS = ["activa","en_progreso","completada","descartada"]
const ESTADO_COLORS: Record<string, string> = {
  activa:      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  en_progreso: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  completada:  "bg-blue-500/10 text-blue-400 border-blue-500/30",
  descartada:  "bg-muted text-muted-foreground border-border",
}
const ESTADO_ICONS: Record<string, string> = {
  activa: "💡", en_progreso: "⚙️", completada: "✅", descartada: "🗑",
}

export function IdeasTab({
  ideas: inicial,
  productos,
}: {
  ideas: Idea[]
  productos: { id: string; nombre: string }[]
}) {
  const router = useRouter()
  const [ideas,        setIdeas]        = useState(inicial)
  const [titulo,       setTitulo]       = useState("")
  const [descripcion,  setDescripcion]  = useState("")
  const [productoId,   setProductoId]   = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroBusq,   setFiltroBusq]   = useState("")
  const [error,        setError]        = useState("")
  const [pending,      startTransition] = useTransition()

  const filtradas = ideas.filter(i => {
    const matchEstado = filtroEstado === "todos" || i.estado === filtroEstado
    const matchBusq   = !filtroBusq ||
      i.titulo.toLowerCase().includes(filtroBusq.toLowerCase()) ||
      i.descripcion.toLowerCase().includes(filtroBusq.toLowerCase())
    return matchEstado && matchBusq
  })

  // Conteos por estado
  const countPorEstado = ideas.reduce<Record<string, number>>((acc, i) => {
    acc[i.estado] = (acc[i.estado] ?? 0) + 1
    return acc
  }, {})

  const crear = async () => {
    if (titulo.trim().length < 3)      { setError("El título debe tener al menos 3 caracteres"); return }
    if (descripcion.trim().length < 5) { setError("La descripción es obligatoria"); return }
    setError("")
    try {
      const nueva = await apiIdeaCreate({
        titulo:      titulo.trim(),
        descripcion: descripcion.trim(),
        producto_id: productoId || undefined,
        estado:      "activa",
      })
      setIdeas(prev => [nueva, ...prev])
      setTitulo(""); setDescripcion(""); setProductoId("")
      startTransition(() => router.refresh())
    } catch (e: any) { setError(e.message) }
  }

  const cambiarEstado = async (id: string, estado: string) => {
    try {
      const updated = await apiIdeaUpdateEstado(id, estado)
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, estado: updated.estado } : i))
    } catch (e: any) { setError(e.message) }
  }

  const eliminar = async (id: string) => {
    try {
      await apiIdeaDelete(id)
      setIdeas(prev => prev.filter(i => i.id !== id))
      startTransition(() => router.refresh())
    } catch (e: any) { setError(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold">Ideas</h2>
          <p className="text-sm text-muted-foreground">Registra ideas de innovación para tus productos</p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">{ideas.length} total</Badge>
      </div>

      {/* Formulario */}
      <div className="border rounded-xl p-4 space-y-3 max-w-lg">
        <p className="text-sm font-medium">Nueva idea</p>
        <Input placeholder="Título *" value={titulo} onChange={e => { setTitulo(e.target.value); setError("") }} />
        <textarea
          placeholder="Descripción *"
          value={descripcion}
          onChange={e => { setDescripcion(e.target.value); setError("") }}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none min-h-[80px]"
        />
        {productos.length > 0 && (
          <Select value={productoId} onValueChange={setProductoId}>
            <SelectTrigger><SelectValue placeholder="Producto relacionado (opcional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin producto</SelectItem>
              {productos.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {error && <p className="text-xs text-destructive">⚠ {error}</p>}
        <Button onClick={crear} disabled={pending} className="w-full">
          {pending ? "Guardando..." : "Agregar idea"}
        </Button>
      </div>

      {/* Filtros */}
      <div className="space-y-3 max-w-2xl">
        <Input
          placeholder="Buscar por título o descripción..."
          value={filtroBusq}
          onChange={e => setFiltroBusq(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFiltroEstado("todos")}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              filtroEstado === "todos" ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground"
            }`}>
            Todos <span className="opacity-60">({ideas.length})</span>
          </button>
          {ESTADOS.map(e => (
            <button key={e} onClick={() => setFiltroEstado(filtroEstado === e ? "todos" : e)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                filtroEstado === e
                  ? `${ESTADO_COLORS[e]} font-medium`
                  : "border-border text-muted-foreground"
              }`}>
              {ESTADO_ICONS[e]} {e} {countPorEstado[e] ? <span className="opacity-60">({countPorEstado[e]})</span> : null}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          {ideas.length === 0 ? "No hay ideas todavía — crea la primera arriba" : "No hay ideas con ese filtro"}
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{filtradas.length} idea{filtradas.length !== 1 ? "s" : ""}</p>
          {filtradas.map(idea => (
            <div key={idea.id} className={`p-4 border rounded-xl space-y-3 ${ESTADO_COLORS[idea.estado]}`}>
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{ESTADO_ICONS[idea.estado]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{idea.titulo}</p>
                  <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{idea.descripcion}</p>
                  {idea.productos && (
                    <p className="text-xs opacity-60 mt-1">📦 {(idea.productos as any).nombre}</p>
                  )}
                </div>
                <button onClick={() => eliminar(idea.id)}
                  className="text-xs opacity-50 hover:opacity-100 hover:text-destructive transition-colors p-1 flex-shrink-0">✕</button>
              </div>
              {/* Cambiar estado */}
              <div className="flex gap-1.5 flex-wrap">
                {ESTADOS.map(e => (
                  <button key={e} onClick={() => cambiarEstado(idea.id, e)}
                    className={`px-2 py-1 rounded-lg text-xs border transition-all ${
                      idea.estado === e
                        ? "border-current font-medium opacity-100"
                        : "border-current/20 opacity-40 hover:opacity-70"
                    }`}>
                    {ESTADO_ICONS[e]} {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
