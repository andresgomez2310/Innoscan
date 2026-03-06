"use client"

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductosTab }       from "@/components/productos-tab"
import { IdeasTab }           from "@/components/ideas-tab"
import { EscaneosTab }        from "@/components/escaneos-tab"
import { RecomendacionesTab } from "@/components/recomendaciones-tab"
import { Package, Lightbulb, ScanLine, Sparkles, Wand2 } from "lucide-react"

interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string | null
  codigo_barras: string | null
  created_at: string
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
interface Escaneo {
  id: string
  producto_id: string
  created_at: string
  ubicacion: string | null
  notas: string | null
  productos?: { nombre: string }
}
interface DashboardProps {
  productos: Producto[]
  ideas: Idea[]
  escaneos: Escaneo[]
}

export function Dashboard({ productos, ideas, escaneos }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("recomendaciones")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">InnoScan</h1>
              <p className="text-sm text-muted-foreground">Sistema de Innovacion para Emprendedores</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard icon={<Package className="h-5 w-5" />}   label="Productos"  value={productos.length} color="bg-chart-1" />
          <StatCard icon={<Lightbulb className="h-5 w-5" />} label="Ideas"      value={ideas.length}     color="bg-chart-2" />
          <StatCard icon={<ScanLine className="h-5 w-5" />}  label="Escaneos"   value={escaneos.length}  color="bg-chart-3" />
          <StatCard icon={<Wand2 className="h-5 w-5" />}     label="Patrones de diseño activos" value={4} color="bg-chart-4" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:gap-2">
            <TabsTrigger value="recomendaciones" className="gap-2">
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">Recomendaciones</span>
            </TabsTrigger>
            <TabsTrigger value="productos" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="ideas" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Ideas</span>
            </TabsTrigger>
            <TabsTrigger value="escaneos" className="gap-2">
              <ScanLine className="h-4 w-4" />
              <span className="hidden sm:inline">Escaneos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recomendaciones">
            <RecomendacionesTab productos={productos} />
          </TabsContent>
          <TabsContent value="productos">
            <ProductosTab productos={productos} />
          </TabsContent>
          <TabsContent value="ideas">
            <IdeasTab ideas={ideas} productos={productos} />
          </TabsContent>
          <TabsContent value="escaneos">
            <EscaneosTab escaneos={escaneos} productos={productos} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color} text-primary-foreground flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}
