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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, ScanLine, MapPin, Calendar, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Producto { id: string; nombre: string }
interface Escaneo {
  id: string; producto_id: string; created_at: string
  ubicacion: string | null; notas: string | null
  productos?: { nombre: string }
}

export function EscaneosTab({ escaneos, productos }: { escaneos: Escaneo[]; productos: Producto[] }) {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [campoErr, setCampoErr] = useState("")
  const [filtroProd, setFiltroProd] = useState("")
  const [filtroDesde, setFiltroDesde] = useState("")
  const [filtroHasta, setFiltroHasta] = useState("")
  const [form, setForm] = useState({ producto_id: "", ubicacion: "", notas: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.producto_id) { setCampoErr("Selecciona un producto"); return }
    setCampoErr(""); setLoading(true); setError("")
    const { error: err } = await createClient().from("escaneos").insert({
      producto_id: form.producto_id,
      ubicacion: form.ubicacion || null,
      notas: form.notas || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setForm({ producto_id: "", ubicacion: "", notas: "" })
    setOpen(false); setLoading(false); router.refresh()
  }

  async function handleDelete(id: string) {
    await createClient().from("escaneos").delete().eq("id", id)
    router.refresh()
  }

  function fmt(d: string) {
    return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const lista = escaneos.filter(es => {
    const n = !filtroProd.trim() || es.productos?.nombre.toLowerCase().includes(filtroProd.toLowerCase())
    const f = new Date(es.created_at)
    const d = !filtroDesde || f >= new Date(filtroDesde)
    const h = !filtroHasta || f <= new Date(filtroHasta + "T23:59:59")
    return n && d && h
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Historial de Escaneos</h2>
          <p className="text-sm text-muted-foreground">Registro de productos escaneados</p>
        </div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); setError(""); setCampoErr("") }}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={productos.length === 0}>
              <Plus className="h-4 w-4" />Registrar Escaneo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Escaneo</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-destructive bg-destructive/10 rounded p-2">{error}</p>}
              <div className="space-y-1">
                <Label>Producto *</Label>
                <Select value={form.producto_id}
                  onValueChange={v => { setForm(p => ({ ...p, producto_id: v })); setCampoErr("") }}>
                  <SelectTrigger className={campoErr ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
                {campoErr && <p className="text-xs text-destructive">{campoErr}</p>}
              </div>
              <div className="space-y-1">
                <Label>Ubicación</Label>
                <Input value={form.ubicacion} onChange={e => setForm(p => ({ ...p, ubicacion: e.target.value }))}
                  placeholder="Dónde se escaneó" />
              </div>
              <div className="space-y-1">
                <Label>Notas</Label>
                <Textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                  placeholder="Observaciones del escaneo" rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !form.producto_id}>
                {loading ? "Guardando..." : "Registrar Escaneo"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end rounded-lg border bg-muted/30 p-3">
        <div className="space-y-1">
          <Label className="text-xs">Producto</Label>
          <Input className="h-8 w-44" placeholder="Filtrar..." value={filtroProd} onChange={e => setFiltroProd(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Desde</Label>
          <Input type="date" className="h-8 w-36" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hasta</Label>
          <Input type="date" className="h-8 w-36" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} />
        </div>
        {(filtroProd || filtroDesde || filtroHasta) && (
          <Button variant="ghost" size="sm" className="h-8 text-xs"
            onClick={() => { setFiltroProd(""); setFiltroDesde(""); setFiltroHasta("") }}>
            Limpiar
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{lista.length} resultado{lista.length !== 1 ? "s" : ""}</span>
      </div>

      {productos.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12">
          <ScanLine className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Primero agrega productos</p>
        </CardContent></Card>
      ) : lista.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12">
          <ScanLine className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Sin resultados</p>
        </CardContent></Card>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {lista.map(es => (
              <Card key={es.id} className="group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                        <ScanLine className="h-5 w-5 text-chart-3" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{es.productos?.nombre}</CardTitle>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />{fmt(es.created_at)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(es.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {es.ubicacion && <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3" />{es.ubicacion}</div>}
                  {es.notas && <CardDescription className="mt-2 line-clamp-2">{es.notas}</CardDescription>}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="hidden md:block rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead><TableHead>Fecha</TableHead>
                  <TableHead>Ubicación</TableHead><TableHead>Notas</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map(es => (
                  <TableRow key={es.id}>
                    <TableCell className="font-medium">{es.productos?.nombre}</TableCell>
                    <TableCell>{fmt(es.created_at)}</TableCell>
                    <TableCell>{es.ubicacion || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate">{es.notas || "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(es.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
