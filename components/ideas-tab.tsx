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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Lightbulb, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Producto {
  id: string
  nombre: string
}

interface Idea {
  id: string
  producto_id: string
  titulo: string
  descripcion: string
  categoria: string | null
  estado: string
  created_at: string
  productos?: { nombre: string }
}

interface IdeasTabProps {
  ideas: Idea[]
  productos: Producto[]
}

const ESTADOS = [
  { value: "borrador", label: "Borrador", color: "bg-muted text-muted-foreground" },
  { value: "en_revision", label: "En Revision", color: "bg-chart-4/20 text-chart-4" },
  { value: "aprobada", label: "Aprobada", color: "bg-chart-2/20 text-chart-2" },
  { value: "implementada", label: "Implementada", color: "bg-primary/20 text-primary" },
]

export function IdeasTab({ ideas, productos }: IdeasTabProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    producto_id: "",
    titulo: "",
    descripcion: "",
    categoria: "",
    estado: "borrador",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("ideas").insert({
      producto_id: formData.producto_id,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      categoria: formData.categoria || null,
      estado: formData.estado,
    })

    if (!error) {
      setFormData({
        producto_id: "",
        titulo: "",
        descripcion: "",
        categoria: "",
        estado: "borrador",
      })
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from("ideas").delete().eq("id", id)
    router.refresh()
  }

  async function handleStatusChange(id: string, estado: string) {
    const supabase = createClient()
    await supabase.from("ideas").update({ estado }).eq("id", id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Ideas Innovadoras</h2>
          <p className="text-sm text-muted-foreground">
            Genera y gestiona ideas para tus productos
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={productos.length === 0}>
              <Plus className="h-4 w-4" />
              Nueva Idea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Idea</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="producto">Producto Asociado *</Label>
                <Select
                  value={formData.producto_id}
                  onValueChange={(value) => setFormData({ ...formData, producto_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="titulo">Titulo *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Titulo de la idea"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripcion *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe la idea innovadora"
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ej: Mejora, Nuevo uso, Combinacion..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !formData.producto_id}>
                {loading ? "Guardando..." : "Crear Idea"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {productos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">
              Primero agrega productos
            </p>
            <p className="text-sm text-muted-foreground">
              Necesitas productos para crear ideas
            </p>
          </CardContent>
        </Card>
      ) : ideas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">No hay ideas</p>
            <p className="text-sm text-muted-foreground">
              Crea tu primera idea innovadora
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ideas.map((idea) => {
            const estadoInfo = ESTADOS.find((e) => e.value === idea.estado) || ESTADOS[0]
            return (
              <Card key={idea.id} className="group relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                        <Lightbulb className="h-5 w-5 text-chart-4" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{idea.titulo}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {idea.productos?.nombre}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(idea.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="line-clamp-3">
                    {idea.descripcion}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    {idea.categoria && (
                      <Badge variant="outline">{idea.categoria}</Badge>
                    )}
                    <Select
                      value={idea.estado}
                      onValueChange={(value) => handleStatusChange(idea.id, value)}
                    >
                      <SelectTrigger className={`w-auto h-7 text-xs ${estadoInfo.color}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
