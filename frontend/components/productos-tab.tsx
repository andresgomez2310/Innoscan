"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Barcode, Tag, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string | null
  codigo_barras: string | null
  created_at: string
}

interface ProductosTabProps {
  productos: Producto[]
}

export function ProductosTab({ productos }: ProductosTabProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    codigo_barras: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("productos").insert({
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      categoria: formData.categoria || null,
      codigo_barras: formData.codigo_barras || null,
    })

    if (!error) {
      setFormData({ nombre: "", descripcion: "", categoria: "", codigo_barras: "" })
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from("productos").delete().eq("id", id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Productos</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tu catalogo de productos para escanear
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Producto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del producto"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripcion</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripcion del producto"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ej: Electronica, Alimentos..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo_barras">Codigo de Barras</Label>
                <Input
                  id="codigo_barras"
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                  placeholder="Codigo de barras del producto"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Producto"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {productos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">No hay productos</p>
            <p className="text-sm text-muted-foreground">
              Agrega tu primer producto para comenzar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto) => (
            <Card key={producto.id} className="group relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{producto.nombre}</CardTitle>
                      {producto.categoria && (
                        <Badge variant="secondary" className="mt-1">
                          <Tag className="mr-1 h-3 w-3" />
                          {producto.categoria}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(producto.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {producto.descripcion && (
                  <CardDescription className="line-clamp-2">
                    {producto.descripcion}
                  </CardDescription>
                )}
                {producto.codigo_barras && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Barcode className="h-4 w-4" />
                    <span className="font-mono">{producto.codigo_barras}</span>
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
