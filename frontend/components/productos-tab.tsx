"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Barcode, Tag, Trash2, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Producto {
  id: string; nombre: string; descripcion: string | null
  categoria: string | null; codigo_barras: string | null; created_at: string
}

export function ProductosTab({ productos }: { productos: Producto[] }) {
  const router = useRouter()
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [filtro, setFiltro]     = useState("")
  const [campos, setCampos]     = useState<Record<string, string>>({})
  const [form, setForm]         = useState({ nombre: "", descripcion: "", categoria: "", codigo_barras: "" })

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }))
    setCampos(p => ({ ...p, [k]: "" }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.nombre.trim())               errs.nombre = "El nombre es obligatorio"
    else if (form.nombre.trim().length < 2) errs.nombre = "Mínimo 2 caracteres"
    if (Object.keys(errs).length) { setCampos(errs); return }

    setLoading(true); setError("")
    const { error: err } = await createClient().from("productos").insert({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion || null,
      categoria: form.categoria || null,
      codigo_barras: form.codigo_barras || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setForm({ nombre: "", descripcion: "", categoria: "", codigo_barras: "" })
    setOpen(false); setLoading(false); router.refresh()
  }

  async function handleDelete(id: string) {
    await createClient().from("productos").delete().eq("id", id)
    router.refresh()
  }

  const lista = filtro.trim()
    ? productos.filter(p => p.categoria?.toLowerCase().includes(filtro.toLowerCase()) || p.nombre.toLowerCase().includes(filtro.toLowerCase()))
    : productos

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Productos</h2>
          <p className="text-sm text-muted-foreground">Gestiona tu catálogo de productos</p>
        </div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); setError(""); setCampos({}) }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Nuevo Producto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Agregar Producto</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-destructive bg-destructive/10 rounded p-2">{error}</p>}
              <div className="space-y-1">
                <Label>Nombre *</Label>
                <Input value={form.nombre} onChange={e => set("nombre", e.target.value)}
                  placeholder="Nombre del producto"
                  className={campos.nombre ? "border-destructive" : ""} />
                {campos.nombre && <p className="text-xs text-destructive">{campos.nombre}</p>}
              </div>
              <div className="space-y-1">
                <Label>Descripción</Label>
                <Textarea value={form.descripcion} onChange={e => set("descripcion", e.target.value)}
                  placeholder="Descripción del producto" rows={3} />
              </div>
              <div className="space-y-1">
                <Label>Categoría</Label>
                <Input value={form.categoria} onChange={e => set("categoria", e.target.value)}
                  placeholder="Ej: Electrónica, Alimentos..." />
              </div>
              <div className="space-y-1">
                <Label>Código de Barras</Label>
                <Input value={form.codigo_barras} onChange={e => set("codigo_barras", e.target.value)}
                  placeholder="Código de barras" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Producto"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por nombre o categoría..."
          value={filtro} onChange={e => setFiltro(e.target.value)} />
      </div>

      {lista.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">{filtro ? "Sin resultados" : "No hay productos"}</p>
            <p className="text-sm text-muted-foreground">{filtro ? "Prueba otra búsqueda" : "Agrega tu primer producto"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lista.map(p => (
            <Card key={p.id} className="group relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{p.nombre}</CardTitle>
                      {p.categoria && <Badge variant="secondary" className="mt-1"><Tag className="mr-1 h-3 w-3" />{p.categoria}</Badge>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {p.descripcion && <CardDescription className="line-clamp-2">{p.descripcion}</CardDescription>}
                {p.codigo_barras && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Barcode className="h-4 w-4" /><span className="font-mono">{p.codigo_barras}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
