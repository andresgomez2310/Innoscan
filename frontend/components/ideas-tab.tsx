"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Lightbulb, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Producto { id: string; nombre: string }
interface Idea {
  id: string; producto_id: string; titulo: string; descripcion: string
  categoria: string | null; estado: string; created_at: string
  productos?: { nombre: string }
}

const ESTADOS = [
  { value: "borrador",     label: "Borrador",     color: "bg-muted text-muted-foreground" },
  { value: "en_revision",  label: "En Revisión",  color: "bg-chart-4/20 text-chart-4" },
  { value: "aprobada",     label: "Aprobada",     color: "bg-chart-2/20 text-chart-2" },
  { value: "implementada", label: "Implementada", color: "bg-primary/20 text-primary" },
]

export function IdeasTab({ ideas, productos }: { ideas: Idea[]; productos: Producto[] }) {
  const router = useRouter()
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [campos, setCampos]     = useState<Record<string, string>>({})
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [form, setForm] = useState({ producto_id: "", titulo: "", descripcion: "", categoria: "", estado: "borrador" })

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }))
    setCampos(p => ({ ...p, [k]: "" }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.producto_id)              errs.producto_id = "Selecciona un producto"
    if (!form.titulo.trim())            errs.titulo      = "El título es obligatorio"
    else if (form.titulo.trim().length < 3) errs.titulo  = "Mínimo 3 caracteres"
    if (!form.descripcion.trim())       errs.descripcion = "La descripción es obligatoria"
    if (Object.keys(errs).length) { setCampos(errs); return }

    setLoading(true); setError("")
    const { error: err } = await createClient().from("ideas").insert({
      producto_id: form.producto_id,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria || null,
      estado: form.estado,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setForm({ producto_id: "", titulo: "", descripcion: "", categoria: "", estado: "borrador" })
    setOpen(false); setLoading(false); router.refresh()
  }

  async function handleDelete(id: string) {
    await createClient().from("ideas").delete().eq("id", id)
    router.refresh()
  }

  async function handleEstado(id: string, estado: string) {
    await createClient().from("ideas").update({ estado }).eq("id", id)
    router.refresh()
  }

  const lista = filtroEstado === "todos" ? ideas : ideas.filter(i => i.estado === filtroEstado)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Ideas Innovadoras</h2>
          <p className="text-sm text-muted-foreground">Genera y gestiona ideas para tus productos</p>
        </div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); setError(""); setCampos({}) }}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={productos.length === 0}>
              <Plus className="h-4 w-4" />Nueva Idea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear Nueva Idea</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-destructive bg-destructive/10 rounded p-2">{error}</p>}
              <div className="space-y-1">
                <Label>Producto *</Label>
                <Select value={form.producto_id} onValueChange={v => set("producto_id", v)}>
                  <SelectTrigger className={campos.producto_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
                {campos.producto_id && <p className="text-xs text-destructive">{campos.producto_id}</p>}
              </div>
              <div className="space-y-1">
                <Label>Título *</Label>
                <Input value={form.titulo} onChange={e => set("titulo", e.target.value)}
                  placeholder="Título de la idea"
                  className={campos.titulo ? "border-destructive" : ""} />
                {campos.titulo && <p className="text-xs text-destructive">{campos.titulo}</p>}
              </div>
              <div className="space-y-1">
                <Label>Descripción *</Label>
                <Textarea value={form.descripcion} onChange={e => set("descripcion", e.target.value)}
                  placeholder="Describe la idea innovadora" rows={4}
                  className={campos.descripcion ? "border-destructive" : ""} />
                {campos.descripcion && <p className="text-xs text-destructive">{campos.descripcion}</p>}
              </div>
              <div className="space-y-1">
                <Label>Categoría</Label>
                <Input value={form.categoria} onChange={e => set("categoria", e.target.value)}
                  placeholder="Ej: Mejora, Nuevo uso..." />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !form.producto_id}>
                {loading ? "Guardando..." : "Crear Idea"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-2 items-center">
        {[{ value: "todos", label: "Todos" }, ...ESTADOS].map(e => (
          <button key={e.value} onClick={() => setFiltroEstado(e.value)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              filtroEstado === e.value
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            }`}>{e.label}</button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{lista.length} idea{lista.length !== 1 ? "s" : ""}</span>
      </div>

      {productos.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Primero agrega productos</p>
        </CardContent></Card>
      ) : lista.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">{filtroEstado === "todos" ? "No hay ideas" : `Sin ideas en "${filtroEstado}"`}</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lista.map(idea => {
            const est = ESTADOS.find(e => e.value === idea.estado) ?? ESTADOS[0]
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
                        <p className="text-xs text-muted-foreground">{idea.productos?.nombre}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(idea.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="line-clamp-3">{idea.descripcion}</CardDescription>
                  <div className="flex items-center justify-between">
                    {idea.categoria && <Badge variant="outline">{idea.categoria}</Badge>}
                    <Select value={idea.estado} onValueChange={v => handleEstado(idea.id, v)}>
                      <SelectTrigger className={`w-auto h-7 text-xs ${est.color}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
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
