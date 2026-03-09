"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Badge }  from "@/components/ui/badge"
import { apiProductoCreate, apiProductoDelete, type Producto } from "@/lib/api/client"

const CATEGORIAS = ["Electrónica","Ropa","Hogar","Juguetes","Libros","Alimentos","Herramientas","Otro"]

export function ProductosTab({ productos: inicial }: { productos: Producto[] }) {
  const router = useRouter()
  const [productos, setProductos] = useState(inicial)
  const [nombre,    setNombre]    = useState("")
  const [categoria, setCategoria] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [filtro,    setFiltro]    = useState("")
  const [error,     setError]     = useState("")
  const [pending,   startTransition] = useTransition()

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  )

  const crear = async () => {
    if (nombre.trim().length < 2) { setError("El nombre debe tener al menos 2 caracteres"); return }
    setError("")
    try {
      const nuevo = await apiProductoCreate({ nombre: nombre.trim(), categoria: categoria || undefined, descripcion: descripcion || undefined })
      setProductos(prev => [nuevo, ...prev])
      setNombre(""); setCategoria(""); setDescripcion("")
      startTransition(() => router.refresh())
    } catch (e: any) { setError(e.message) }
  }

  const eliminar = async (id: string) => {
    try {
      await apiProductoDelete(id)
      setProductos(prev => prev.filter(p => p.id !== id))
      startTransition(() => router.refresh())
    } catch (e: any) { setError(e.message) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Productos</h2>
        <p className="text-sm text-muted-foreground">Gestiona el catálogo de productos</p>
      </div>

      {/* Formulario */}
      <div className="border rounded-xl p-4 space-y-3 max-w-lg">
        <p className="text-sm font-medium">Nuevo producto</p>
        <Input placeholder="Nombre del producto *" value={nombre} onChange={e => { setNombre(e.target.value); setError("") }} />
        <select value={categoria} onChange={e => setCategoria(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">Categoría (opcional)</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Input placeholder="Descripción (opcional)" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        {error && <p className="text-xs text-destructive">⚠ {error}</p>}
        <Button onClick={crear} disabled={pending} className="w-full">
          {pending ? "Guardando..." : "Agregar producto"}
        </Button>
      </div>

      {/* Filtro */}
      <Input placeholder="Buscar producto..." value={filtro} onChange={e => setFiltro(e.target.value)} className="max-w-sm" />

      {/* Lista */}
      <div className="space-y-2">
        {filtrados.length === 0 && <p className="text-sm text-muted-foreground italic">No hay productos todavía</p>}
        {filtrados.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 border rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.nombre}</p>
              {p.descripcion && <p className="text-xs text-muted-foreground truncate">{p.descripcion}</p>}
            </div>
            {p.categoria && <Badge variant="secondary" className="text-xs">{p.categoria}</Badge>}
            <button onClick={() => eliminar(p.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
