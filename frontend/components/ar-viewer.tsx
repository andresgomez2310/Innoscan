"use client"

import { useEffect, useState } from "react"
import { Loader2, Box } from "lucide-react"

// Mapeo de materiales → archivos .glb
// Persona 1 pondrá los archivos reales en public/models/
const MODELOS_POR_MATERIAL: Record<string, string> = {
  madera: "/models/madera.glb",
  plastico: "/models/plastico.glb",
  metal: "/models/metal.glb",
  carton: "/models/carton.glb",
  vidrio: "/models/vidrio.glb",
  electronico: "/models/electronico.glb",
  tela: "/models/tela.glb",
  organico: "/models/organico.glb",
  default: "/models/generico.glb",
}

interface ARViewerProps {
  material?: string
  alt?: string
  className?: string
}

export function ARViewer({ material, alt = "Modelo 3D del material", className = "" }: ARViewerProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Normalizamos el material (lowercase, sin tildes) y buscamos el modelo
  const key = (material ?? "default")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()

  const modeloSrc = MODELOS_POR_MATERIAL[key] ?? MODELOS_POR_MATERIAL.default

  // Cargamos la librería @google/model-viewer SOLO en el cliente (evita errores en SSR)
  useEffect(() => {
    import("@google/model-viewer")
      .then(() => setLoaded(true))
      .catch((err) => {
        console.error("[ARViewer] Error cargando model-viewer:", err)
        setError(true)
      })
  }, [])

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-[300px] rounded-2xl bg-black/30 border border-red-500/20 text-red-400 ${className}`}>
        <Box className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-[10px] font-black uppercase tracking-widest">Error al cargar visor 3D</p>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className={`flex flex-col items-center justify-center h-[300px] rounded-2xl bg-black/30 border border-white/5 ${className}`}>
        <Loader2 className="h-8 w-8 text-[#00FF66] animate-spin mb-2" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cargando visor 3D...</p>
      </div>
    )
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-black/30 border border-white/10 ${className}`}>
      <model-viewer
        src={modeloSrc}
        alt={alt}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        camera-controls
        auto-rotate
        rotation-per-second="20deg"
        shadow-intensity="1"
        exposure="1"
        loading="lazy"
        touch-action="pan-y"
        style={{
          width: "100%",
          height: "320px",
          backgroundColor: "transparent",
        }}
      />

      {/* Etiqueta con el material detectado, esquina superior izquierda */}
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 border border-[#00FF66]/30 backdrop-blur-sm">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00FF66]">
          {material ?? "genérico"}
        </span>
      </div>
    </div>
  )
}