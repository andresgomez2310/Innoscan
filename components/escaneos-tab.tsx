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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, ScanLine, MapPin, Calendar, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Producto {
  id: string
  nombre: string
}

interface Escaneo {
  id: string
  producto_id: string
  created_at: string
  ubicacion: string | null
  notas: string | null
  productos?: { nombre: string }
}

interface EscaneosTabProps {
  escaneos: Escaneo[]
  productos: Producto[]
}

export function EscaneosTab({ escaneos, productos }: EscaneosTabProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    producto_id: "",
    ubicacion: "",
    notas: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("escaneos").insert({
      producto_id: formData.producto_id,
      ubicacion: formData.ubicacion || null,
      notas: formData.notas || null,
    })

    if (!error) {
      setFormData({ producto_id: "", ubicacion: "", notas: "" })
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from("escaneos").delete().eq("id", id)
    router.refresh()
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Historial de Escaneos</h2>
          <p className="text-sm text-muted-foreground">
            Registro de productos escaneados
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={productos.length === 0}>
              <Plus className="h-4 w-4" />
              Registrar Escaneo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Escaneo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="producto">Producto *</Label>
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
                <Label htmlFor="ubicacion">Ubicacion</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  placeholder="Donde se escaneo el producto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Observaciones del escaneo"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !formData.producto_id}>
                {loading ? "Guardando..." : "Registrar Escaneo"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {productos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ScanLine className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">
              Primero agrega productos
            </p>
            <p className="text-sm text-muted-foreground">
              Necesitas productos para registrar escaneos
            </p>
          </CardContent>
        </Card>
      ) : escaneos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ScanLine className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">No hay escaneos</p>
            <p className="text-sm text-muted-foreground">
              Registra tu primer escaneo de producto
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile view */}
          <div className="grid gap-4 md:hidden">
            {escaneos.map((escaneo) => (
              <Card key={escaneo.id} className="group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                        <ScanLine className="h-5 w-5 text-chart-3" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {escaneo.productos?.nombre}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(escaneo.created_at)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(escaneo.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {escaneo.ubicacion && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {escaneo.ubicacion}
                    </div>
                  )}
                  {escaneo.notas && (
                    <CardDescription className="mt-2 line-clamp-2">
                      {escaneo.notas}
                    </CardDescription>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop view */}
          <div className="hidden md:block rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Ubicacion</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escaneos.map((escaneo) => (
                  <TableRow key={escaneo.id}>
                    <TableCell className="font-medium">
                      {escaneo.productos?.nombre}
                    </TableCell>
                    <TableCell>{formatDate(escaneo.created_at)}</TableCell>
                    <TableCell>{escaneo.ubicacion || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {escaneo.notas || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(escaneo.id)}
                      >
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
