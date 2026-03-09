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
  const [productos,   setProductos]   = useState(inicial)
  const [nombre,      setNombre]      = useState("")
  const [categoria,   setCategoria]   = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [filtroBusq,  setFiltroBusq]  = useState("")
  const [filtroCat,   setFiltroCat]   = useState("todas")
  const [error,       setError]       = useState("")
  const [pending,     startTransition] = useTransition()

  // Categorías únicas de los productos existentes + las predefinidas
  const categoriasExistentes = Array.from(
    new Set(productos.map(p => p.categoria).filter(Boolean) as string[])
  )
  const todasCats = Array.from(new Set([...CATEGORIAS, ...categoriasExistentes]))

  const filtrados = productos.filter(p => {
    const matchBusq = p.nombre.toLowerCase().includes(filtroBusq.toLowerCase()) ||
                      (p.descripcion ?? "").toLowerCase().includes(filtroBusq.toLowerCase())
    const matchCat  = filtroCat === "todas" || p.categoria === filtroCat
    return matchBusq && matchCat
  })

  const crear = async () => {
    if (nombre.trim().length < 2) { setError("El nombre debe tener al menos 2 caracteres"); return }
    setError("")
    try {
      const nuevo = await apiProductoCreate({
        nombre:      nombre.trim(),
        categoria:   categoria || undefined,
        descripcion: descripcion || undefined,
      })
      setProductos(prev => [nuevo, ...prev])
      setNombre(""); setCategoria(""); setDescripcion("")
    } catch (e: any) { setError(e.message) }
  }

  const eliminar = async (id: string) => {
    try {
      await apiProductoDelete(id)
      setProductos(prev => prev.filter(p => p.id !== id))
    } catch (e: any) { setError(e.message) }
  }

  // Conteo por categoría
  const countPorCat = productos.reduce<Record<string, number>>((acc, p) => {
    const cat = p.categoria ?? "Sin categoría"
    acc[cat] = (acc[cat] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold">Productos</h2>
          <p className="text-sm text-muted-foreground">Gestiona el catálogo de productos</p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">{productos.length} total</Badge>
      </div>

      {/* Formulario */}
      <div className="border rounded-xl p-4 space-y-3 max-w-lg">
        <p className="text-sm font-medium">Nuevo producto</p>
        <Input
          placeholder="Nombre del producto *"
          value={nombre}
          onChange={e => { setNombre(e.target.value); setError("") }}
        />
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Categoría (opcional)</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Input
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
        {error && <p className="text-xs text-destructive">⚠ {error}</p>}
        <Button onClick={crear} disabled={pending} className="w-full">
          {pending ? "Guardando..." : "Agregar producto"}
        </Button>
      </div>

      {/* Filtros */}
      <div className="space-y-3 max-w-2xl">
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={filtroBusq}
          onChange={e => setFiltroBusq(e.target.value)}
        />

        {/* Filtro por categoría — chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroCat("todas")}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              filtroCat === "todas"
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            Todas <span className="opacity-60">({productos.length})</span>
          </button>
          {Object.entries(countPorCat).map(([cat, count]) => (
            <button
              key={cat}
              onClick={() => setFiltroCat(cat === filtroCat ? "todas" : cat)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                filtroCat === cat
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground hover:border-muted-foreground"
              }`}
            >
              {cat} <span className="opacity-60">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      {filtrados.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          {productos.length === 0
            ? "No hay productos todavía — crea el primero arriba"
            : "No hay productos con ese filtro"}
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {filtrados.length} producto{filtrados.length !== 1 ? "s" : ""}
            {filtroCat !== "todas" && ` en "${filtroCat}"`}
            {filtroBusq && ` con "${filtroBusq}"`}
          </p>
          {filtrados.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-muted/30 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-base">
                  {p.categoria === "Electrónica" ? "💻"
                  : p.categoria === "Ropa"       ? "👕"
                  : p.categoria === "Hogar"      ? "🏠"
                  : p.categoria === "Juguetes"   ? "🧸"
                  : p.categoria === "Libros"     ? "📚"
                  : p.categoria === "Alimentos"  ? "🍎"
                  : p.categoria === "Herramientas" ? "🔧"
                  : "📦"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.nombre}</p>
                {p.descripcion && (
                  <p className="text-xs text-muted-foreground truncate">{p.descripcion}</p>
                )}
                <p className="text-xs text-muted-foreground/50 font-mono mt-0.5">
                  {new Date(p.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              {p.categoria && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">{p.categoria}</Badge>
              )}
              <button
                onClick={() => eliminar(p.id)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 p-1"
                title="Eliminar producto"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
