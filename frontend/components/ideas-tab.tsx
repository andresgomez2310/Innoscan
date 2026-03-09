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
  activa:       "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  en_progreso:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  completada:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  descartada:   "bg-muted text-muted-foreground",
}

export function IdeasTab({ ideas: inicial, productos }: { ideas: Idea[]; productos: { id: string; nombre: string }[] }) {
  const router = useRouter()
  const [ideas,      setIdeas]      = useState(inicial)
  const [titulo,     setTitulo]     = useState("")
  const [descripcion,setDescripcion]= useState("")
  const [productoId, setProductoId] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [error,      setError]      = useState("")
  const [pending,    startTransition] = useTransition()

  const filtradas = filtroEstado === "todos" ? ideas : ideas.filter(i => i.estado === filtroEstado)

  const crear = async () => {
    if (titulo.trim().length < 3)     { setError("El título debe tener al menos 3 caracteres"); return }
    if (descripcion.trim().length < 5){ setError("La descripción es obligatoria"); return }
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
      <div>
        <h2 className="text-xl font-semibold">Ideas</h2>
        <p className="text-sm text-muted-foreground">Registra ideas de innovación para tus productos</p>
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

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        {["todos", ...ESTADOS].map(e => (
          <button key={e} onClick={() => setFiltroEstado(e)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              filtroEstado === e ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground"
            }`}>{e}</button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtradas.length === 0 && <p className="text-sm text-muted-foreground italic">No hay ideas todavía</p>}
        {filtradas.map(idea => (
          <div key={idea.id} className="p-3 border rounded-xl space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{idea.titulo}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{idea.descripcion}</p>
                {idea.productos && <p className="text-xs text-muted-foreground/60 mt-1">📦 {(idea.productos as any).nombre}</p>}
              </div>
              <button onClick={() => eliminar(idea.id)} className="text-xs text-muted-foreground hover:text-destructive flex-shrink-0">✕</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {ESTADOS.map(e => (
                <button key={e} onClick={() => cambiarEstado(idea.id, e)}
                  className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
                    idea.estado === e ? ESTADO_COLORS[e] : "border-border text-muted-foreground/50"
                  }`}>{e}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
