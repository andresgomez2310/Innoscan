"use client"

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductosTab }       from "@/components/productos-tab"
import { RecomendacionesTab } from "@/components/recomendaciones-tab"
import { 
  Package, Lightbulb, ScanLine, Sparkles, Wand2, 
  LayoutDashboard, Settings, MessageSquare, Menu 
} from "lucide-react"

// --- Estilos de colores ---
const COLORS = {
  bg: "bg-[#02040A]",
  sidebar: "bg-[#0B0E14]",
  card: "bg-[#0D1117]", 
  primary: "text-[#00FF66]", 
  primaryBg: "bg-[#00FF66]",
  border: "border-white/10"
}

export function Dashboard({ productos, ideas, escaneos, recomendaciones }: any) {
  const [activeTab, setActiveTab] = useState("recomendaciones")

  return (
    <div className={`flex min-h-screen ${COLORS.bg} text-slate-200 font-sans`}>
      
      {/* --- SIDEBAR LATERAL --- */}
      <aside className={`w-64 ${COLORS.sidebar} border-r ${COLORS.border} flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg ${COLORS.primaryBg} flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.4)]`}>
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">InnoScan</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem 
            icon={<Wand2 size={20}/>} 
            label="Recomendaciones" 
            active={activeTab === "recomendaciones"} 
            onClick={() => setActiveTab("recomendaciones")}
          />
          <SidebarItem 
            icon={<Package size={20}/>} 
            label="Productos" 
            active={activeTab === "productos"} 
            onClick={() => setActiveTab("productos")}
          />
          <SidebarItem icon={<ScanLine size={20}/>} label="Historial Scans" />
          <SidebarItem icon={<MessageSquare size={20}/>} label="Feedback" />
        </nav>

        <div className={`p-4 border-t ${COLORS.border} mt-auto`}>
          <SidebarItem icon={<Settings size={20}/>} label="Configuración" />
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col">
        
        {/* Header Superior */}
        <header className={`h-16 border-b ${COLORS.border} flex items-center justify-between px-8 bg-black/20 backdrop-blur-md`}>
           <div className="flex items-center gap-2 text-sm text-slate-400">
             <span></span> / <span className="text-white capitalize">{activeTab}</span>
           </div>
           <div className="flex items-center gap-4 text-xs font-medium">
             <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
             </div>
           </div>
        </header>

        <div className="p-8 overflow-y-auto">
          {/* Tarjetas de estadísticas con estilo GLOW */}
          <div className="grid gap-6 md:grid-cols-4 mb-10">
            <StatCard label="Productos" value={productos.length} icon={<Package />} color="blue" />
            <StatCard label="Ideas" value={ideas.length} icon={<Lightbulb />} color="amber" />
            <StatCard label="Escaneos" value={escaneos.length} icon={<ScanLine />} color="orange" />
            <StatCard label="Analisis" value={recomendaciones.length} icon={<Sparkles />} color="emerald" />
          </div>

          {/* Área de Tabs adaptada */}
          <div className={`${COLORS.card} rounded-2xl border ${COLORS.border} p-1 shadow-2xl`}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="recomendaciones" className="mt-0 outline-none">
                <div className="p-6">
                  <RecomendacionesTab productos={productos} recomendacionesPrevias={recomendaciones} />
                </div>
              </TabsContent>
              <TabsContent value="productos" className="mt-0 outline-none">
                <div className="p-6">
                  <ProductosTab productos={productos} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

// --- SUB-COMPONENTES CON ESTILO PROFESIONAL ---

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active 
        ? "bg-[#00FF66] text-black font-bold shadow-[0_0_20px_rgba(0,255,102,0.2)]" 
        : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  )
}

function StatCard({ label, value, icon, color }: any) {
  const colorMap: any = {
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    orange: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    emerald: "text-[#00FF66] bg-[#00FF66]/10 border-[#00FF66]/20",
  }

  return (
    <div className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-6 hover:border-white/20 transition-all group relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
          {React.cloneElement(icon as React.ReactElement, { size: 24 })}
        </div>
      </div>
      {/* Efecto de luz al fondo */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 blur-[50px] opacity-10 rounded-full ${colorMap[color].split(' ')[1]}`} />
    </div>
  )
}