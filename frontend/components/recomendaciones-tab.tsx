"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Sparkles, Loader2, RefreshCw, Wand2, CheckCircle2, AlertCircle } from "lucide-react"

import { FlyweightCache, CONDICION_TAGS } from "@/lib/patterns/flyweight"
import { RecomendacionResultadoBuilder } from "@/lib/patterns/builder"
import { useScanObserver } from "@/lib/patterns/observer"
import { apiTransformTypes, apiEscaneoCreate, apiRecommendGenerate } from "@/lib/api/client"

const THEME = {
  bgCard: "bg-[#0D1117]",
  border: "border-white/10",
  accent: "text-[#00FF66]",
  accentBg: "bg-[#00FF66]/10",
}

export function RecomendacionesTab({ productos }: { productos: any[] }) {
  // --- Estados ---
  const [loading, setLoading] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [progresoMsg, setProgresoMsg] = useState("")
  const [productoId, setProductoId] = useState("")
  const [condicion, setCondicion] = useState("bueno")
  const [tipoId, setTipoId] = useState("1") 
  const [tipos, setTipos] = useState<any[]>([])
  const [imagen, setImagen] = useState<{ file: File; preview: string; base64: string } | null>(null)
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState("")

  const fileRef = useRef<HTMLInputElement>(null)

  // --- Observer: Progreso de la IA ---
  useScanObserver<{ progress: number; message: string }>("escaneo:progreso", (data) => {
    setProgreso(data.progress)
    setProgresoMsg(data.message)
  })

  // --- Cargar tipos de estrategia ---
  useEffect(() => {
    apiTransformTypes().then(types => {
      setTipos(types)
      if (types && types.length > 0) {
        if (!tipoId) setTipoId(types[0].id)
        types.forEach(t => FlyweightCache.set(`ttype_${t.strategyKey}`, t))
      }
    })
  }, [])

  // --- NUEVA FUNCIÓN: Limpiar para nuevo análisis ---
  const nuevaConsulta = () => {
    setResultado(null)
    setImagen(null)
    setProductoId("")
    setError("")
    setProgreso(0)
    setProgresoMsg("")
    setCondicion("bueno")
  }

  // --- Manejo y Optimización de Imagen ---
  const handleImagen = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) return setError("Formato no válido")
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        // Redimensionar para ahorrar RAM en IA local
        const scale = Math.min(1, 800 / Math.max(img.width, img.height))
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

        const jpegBase64 = canvas.toDataURL('image/jpeg', 0.8)
        setImagen({ 
          file, 
          preview: jpegBase64,
          base64: jpegBase64 
        })
        setError("")
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // --- Flujo Principal ---
  const generarInnovacion = async () => {
    if (!productoId) return setError("Selecciona un producto del catálogo")
    if (!imagen) return setError("Sube una foto para el análisis de IA")

    setLoading(true)
    setError("")
    setProgreso(10)
    setProgresoMsg("Registrando escaneo...")

    try {
      const producto = productos.find(p => p.id === productoId)

      const scan = await apiEscaneoCreate({
        itemName: producto.nombre,
        condition: condicion,
        categoryId: producto.id,
      })

      setProgreso(40)
      setProgresoMsg("Analizando con IA Local...")

      const response = await apiRecommendGenerate({
        scanId: scan.id,
        transformationTypeId: tipoId, 
        itemName: producto.nombre,
        imageBase64: imagen.base64 
      })

      // Corregido: Agregada la condición al Builder
      const builderRes = new RecomendacionResultadoBuilder()
        .withProducto(producto.id, producto.nombre)
        .withCondicion(condicion) 
        .withEstrategia("AI_LOCAL", "IA Local Llava")
        .withRecomendaciones(response.recommendations || [])
        .build()

      setResultado(builderRes)
      setProgreso(100)
      setProgresoMsg("Completado")
    } catch (e: any) {
      console.error("Error:", e)
      setError("Error interno: La IA local tardó demasiado o se quedó sin memoria.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
      
      {/* COLUMNA IZQUIERDA: FORMULARIO */}
      <div className="space-y-6">
        <section className={`${THEME.bgCard} border ${THEME.border} rounded-3xl p-6 shadow-2xl space-y-6`}>
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className={`p-2 rounded-lg ${THEME.accentBg}`}>
              <Wand2 className={`h-5 w-5 ${THEME.accent}`} />
            </div>
            <h3 className="text-lg font-bold text-white italic">Configuración</h3>
          </div>

          {/* DROPZONE */}
          <div onClick={() => fileRef.current?.click()} className={`relative group border-2 border-dashed ${THEME.border} rounded-2xl p-6 transition-all cursor-pointer hover:border-[#00FF66]/50 bg-black/20`}>
            {imagen ? (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                <img src={imagen.preview} className="object-cover w-full h-full" alt="Preview" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <RefreshCw className="text-white h-8 w-8" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <Upload className="text-slate-500 h-8 w-8 mb-3" />
                <p className="text-sm font-bold text-slate-300">Subir fotografía</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest italic">Análisis Visual Requerido</p>
              </div>
            )}
            <input type="file" ref={fileRef} className="hidden" onChange={e => handleImagen(e.target.files?.[0])} />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Producto</label>
              <select value={productoId} onChange={e => setProductoId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#00FF66] outline-none">
                <option value="">Selecciona un producto...</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Condición</label>
              <div className="flex flex-wrap gap-2">
                {CONDICION_TAGS.map(c => (
                  <button key={c} onClick={() => setCondicion(c)} className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all uppercase ${condicion === c ? "bg-[#00FF66] text-black border-[#00FF66]" : "bg-white/5 border-white/10 text-slate-400"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estrategia Principal</label>
              <div className="flex flex-wrap gap-2">
                {tipos.map(t => (
                  <button key={t.id} onClick={() => setTipoId(t.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all uppercase ${tipoId === t.id ? "bg-[#00FF66] text-black border-[#00FF66]" : "bg-white/5 border-white/10 text-slate-400"}`}>
                    {(t.label || t.strategyKey).replace('Strategy', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={generarInnovacion} disabled={loading || !productoId || !imagen} className="w-full h-14 bg-[#00FF66] hover:bg-[#00D154] text-black font-black rounded-2xl shadow-[0_10px_30px_rgba(0,255,102,0.2)]">
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {loading ? "IA ANALIZANDO..." : "GENERAR RECOMENDACIÓN IA"}
          </Button>

          {loading && (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black text-[#00FF66] uppercase tracking-widest">
                <span>{progresoMsg}</span>
                <span>{progreso}%</span>
              </div>
              <Progress value={progreso} className="h-1 bg-white/5" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </section>
      </div>

      {/* COLUMNA DERECHA: RESULTADOS */}
      <div className="space-y-6">
        {!resultado && !loading && (
          <div className="h-full min-h-[450px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-600 bg-black/10">
            <Sparkles className="h-12 w-12 mb-4 opacity-5" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 text-center">Esperando Análisis</p>
          </div>
        )}

        {loading && !resultado && (
          <div className="h-full min-h-[450px] flex flex-col items-center justify-center space-y-6 bg-black/20 rounded-3xl border border-white/5 shadow-inner">
             <div className="relative">
              <div className="h-24 w-24 border-4 border-[#00FF66]/10 border-t-[#00FF66] rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-[#00FF66] animate-pulse" />
            </div>
            <p className="text-[#00FF66] font-mono text-[10px] tracking-[0.4em] uppercase animate-pulse">Neural Engine Active</p>
          </div>
        )}

        {resultado && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                <CheckCircle2 className="text-[#00FF66] h-5 w-5" />
                <h3 className="text-white font-black italic uppercase tracking-tighter text-lg">Resultados Obtenidos</h3>
              </div>
              <Badge variant="outline" className="border-[#00FF66]/20 text-[#00FF66] font-mono text-[10px]">IA LOCAL</Badge>
            </div>

            {resultado.recomendaciones?.map((rec: any, idx: number) => (
              <ResultCard key={idx} title={rec.title} desc={rec.description} color={idx === 0 ? "emerald" : "blue"} />
            ))}
            
            {/* BOTÓN DE LIMPIEZA INTEGRADO */}
            <Button 
              variant="ghost" 
              onClick={nuevaConsulta} 
              className="w-full text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#00FF66] hover:bg-[#00FF66]/5 mt-4 py-8 rounded-2xl border border-dashed border-white/5"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpiar y realizar nuevo análisis
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultCard({ title, desc, color }: any) {
  const colors: any = {
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.05)]",
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.05)]",
  }
  return (
    <div className={`p-6 rounded-3xl border ${colors[color]} backdrop-blur-md hover:scale-[1.02] transition-all duration-500 group`}>
      <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-4 opacity-40 group-hover:opacity-100 transition-opacity">{title}</h4>
      <p className="text-slate-200 text-sm leading-relaxed font-medium italic">"{desc}"</p>
    </div>
  )
}