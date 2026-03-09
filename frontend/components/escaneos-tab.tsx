"use client"
import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Badge }  from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiEscaneoCreate, apiCategories, type Escaneo, type Category } from "@/lib/api/client"

const CONDICIONES = ["nuevo","bueno","regular","dañado","antiguo","raro"]

export function EscaneosTab({ escaneos: inicial, productos }: { escaneos: Escaneo[]; productos: { id: string; nombre: string }[] }) {
  const router = useRouter()
  const [escaneos,   setEscaneos]   = useState(inicial)
  const [categories, setCategories] = useState<Category[]>([])
  const [productoId, setProductoId] = useState("")
  const [condicion,  setCondicion]  = useState("bueno")
  const [notas,      setNotas]      = useState("")
  const [error,      setError]      = useState("")
  const [pending,    startTransition] = useTransition()

  useEffect(() => {
    apiCategories().then(setCategories).catch(() => {})
  }, [])

  const crear = async () => {
    if (!productoId) { setError("Selecciona un producto"); return }
    setError("")
    try {
      // categoryId = producto seleccionado (el backend mapea producto_id en escaneos)
      const nuevo = await apiEscaneoCreate({
        itemName:   productos.find(p => p.id === productoId)?.nombre ?? "",
        categoryId: productoId,
        condition:  condicion,
        description: notas || undefined,
      })
      setEscaneos(prev => [nuevo, ...prev])
      setProductoId(""); setCondicion("bueno"); setNotas("")
      startTransition(() => router.refresh())
    } catch (e: any) { setError(e.message) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Escaneos</h2>
        <p className="text-sm text-muted-foreground">Registra escaneos de productos</p>
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
              {productos.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <div className="flex flex-wrap gap-2">
          {CONDICIONES.map(c => (
            <button key={c} onClick={() => setCondicion(c)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                condicion === c ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground"
              }`}>{c}</button>
          ))}
        </div>
        <Input placeholder="Notas (opcional)" value={notas} onChange={e => setNotas(e.target.value)} />
        {error && <p className="text-xs text-destructive">⚠ {error}</p>}
        <Button onClick={crear} disabled={pending || productos.length === 0} className="w-full">
          {pending ? "Guardando..." : "Registrar escaneo"}
        </Button>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {escaneos.length === 0 && <p className="text-sm text-muted-foreground italic">No hay escaneos todavía</p>}
        {escaneos.map((e: any) => (
          <div key={e.id} className="flex items-center gap-3 p-3 border rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{e.itemName ?? e.notas ?? "Escaneo"}</p>
              <p className="text-xs text-muted-foreground">{e.condition ?? e.ubicacion ?? "—"}</p>
            </div>
            <Badge variant="outline" className="text-xs">{e.status ?? "PENDING"}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
