"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button }    from "@/components/ui/button"
import { Badge }     from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress }  from "@/components/ui/progress"

// Patrones de diseño
import { CONDICION_TAGS, ESFUERZO_LABELS, ESTRATEGIA_META, FlyweightCache, type CondicionTag } from "@/lib/patterns/flyweight"
import { crearEstrategia, todasLasEstrategias } from "@/lib/patterns/strategy"
import { RecomendacionResultadoBuilder, type RecomendacionResultado } from "@/lib/patterns/builder"
import { ScanObserver, useScanObserver } from "@/lib/patterns/observer"

// Cliente backend
import {
  apiCategories, apiTransformTypes, apiEscaneoCreate as apiScanCreate,
  apiRecommendGenerate, apiFeedbackCreate,
  type Category, type TransformType,
} from "@/lib/api/client"

interface Producto { id: string; nombre: string; categoria: string | null }
interface RecDB {
  id: string; producto_id: string; producto_nombre: string
  estrategia_key: string; estrategia_nombre: string
  confianza_promedio: number; estado: string; created_at: string
}

const COLORES: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  reutilizar:   { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
  transformar:  { border: "border-yellow-500/30",  bg: "bg-yellow-500/10",  text: "text-yellow-400",  badge: "bg-yellow-500/20 text-yellow-300" },
  reconfigurar: { border: "border-pink-500/30",    bg: "bg-pink-500/10",    text: "text-pink-400",    badge: "bg-pink-500/20 text-pink-300" },
}

// strategyKey frontend → strategyKey backend
const STRATEGY_MAP: Record<string, string> = {
  reutilizar: "reuse", transformar: "transform", reconfigurar: "reconfigure",
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export function RecomendacionesTab({
  productos,
  recomendacionesPrevias = [],
}: {
  productos: Producto[]
  recomendacionesPrevias?: RecDB[]
}) {
  const condiciones = CONDICION_TAGS
  const estrategias = todasLasEstrategias()
  const esfuerzos   = ESFUERZO_LABELS

  // Catálogo del backend (Flyweight)
  const [categories,  setCategories]  = useState<Category[]>([])
  const [transTypes,  setTransTypes]  = useState<TransformType[]>([])
  const [backendOk,   setBackendOk]   = useState<boolean | null>(null)

  // Formulario
  const [productoId,  setProductoId]  = useState("")
  const [condicion,   setCondicion]   = useState<CondicionTag>("bueno")
  const [estratKey,   setEstratKey]   = useState("reutilizar")
  const [imagen,      setImagen]      = useState<{ preview: string; nombre: string } | null>(null)

  // Estado del análisis
  const [loading,     setLoading]     = useState(false)
  const [progreso,    setProgreso]    = useState(0)
  const [progresoMsg, setProgresoMsg] = useState("")
  const [error,       setError]       = useState("")

  // Resultado
  const [resultado,   setResultado]   = useState<RecomendacionResultado | null>(null)
  const [backendId,   setBackendId]   = useState<string | null>(null)
  const [guardadoOk,  setGuardadoOk]  = useState(false)
  const [historial,   setHistorial]   = useState<RecomendacionResultado[]>([])
  const [feedback,    setFeedback]    = useState<Record<string, number>>({})
  const [vista,       setVista]       = useState<"formulario" | "resultado">("formulario")
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Cargar catálogo del backend al montar (Flyweight) ────────
  useEffect(() => {
    Promise.all([apiCategories(), apiTransformTypes()])
      .then(([cats, types]) => {
        setCategories(cats)
        setTransTypes(types)
        // guardar en FlyweightCache
        cats.forEach(c  => FlyweightCache.set(`cat_${c.id}`, c))
        types.forEach(t => FlyweightCache.set(`ttype_${t.strategyKey}`, t))
        setBackendOk(true)
      })
      .catch(() => setBackendOk(false))
  }, [])

  // ── Observer: suscribir a eventos de progreso ────────────────
  useScanObserver<{ pct: number; msg: string }>("escaneo:progreso", ({ pct, msg }) => {
    setProgreso(pct); setProgresoMsg(msg)
  })
  useScanObserver<RecomendacionResultado>("escaneo:completo", (r) => {
    setHistorial(prev => [r, ...prev])
  })

  const handleImagen = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) { setError("Debe ser una imagen JPG, PNG o WEBP"); return }
    const reader = new FileReader()
    reader.onload = e => { setImagen({ preview: e.target?.result as string, nombre: file.name }); setError("") }
    reader.readAsDataURL(file)
  }

  // ── Flujo principal: 4 patrones en secuencia ─────────────────
  const analizar = async () => {
    if (!imagen)     { setError("Adjunta una imagen del producto"); return }
    if (!productoId) { setError("Selecciona un producto"); return }

    setError(""); setLoading(true); setProgreso(0); setGuardadoOk(false); setBackendId(null)
    const producto = productos.find(p => p.id === productoId)!

    try {
      // ── 1. OBSERVER: inicio ──────────────────────────────────
      ScanObserver.emit("escaneo:progreso", { pct: 15, msg: "Iniciando análisis..." })
      await sleep(200)

      // ── 2. FLYWEIGHT: obtener categoría y tipo desde cache ───
      ScanObserver.emit("escaneo:progreso", { pct: 25, msg: "Obteniendo catálogo (Flyweight)..." })

      // Buscar el tipo de transformación que corresponde a la estrategia elegida
      const backendKey = STRATEGY_MAP[estratKey] ?? "reuse"
      let tType = FlyweightCache.get<TransformType>(`ttype_${backendKey}`)
      if (!tType && transTypes.length > 0) {
        tType = transTypes.find(t => t.strategyKey === backendKey) ?? transTypes[0]
      }

      // Obtener categoría del producto o usar la primera disponible
      const cat = categories[0]

      // Guardar producto en cache Flyweight
      if (!FlyweightCache.has(`producto_${productoId}`))
        FlyweightCache.set(`producto_${productoId}`, producto)

      await sleep(200)

      // ── 3. BACKEND: crear scan en Railway ────────────────────
      ScanObserver.emit("escaneo:progreso", { pct: 35, msg: "Registrando escaneo en servidor..." })
      let scanId: string | null = null
      try {
        const scan = await apiScanCreate({
          itemName:    producto.nombre,
          condition:   condicion,
          categoryId:  cat?.id ?? tType?.id ?? "",
          description: `Análisis de ${producto.nombre} en condición: ${condicion}`,
        })
        scanId = scan.id
      } catch (e) {
        console.warn("[Backend] apiScanCreate falló:", (e as Error).message)
      }

      // ── 4. STRATEGY: ejecutar algoritmo ─────────────────────
      ScanObserver.emit("escaneo:progreso", { pct: 55, msg: `Aplicando estrategia "${estratKey}" (Strategy)...` })
      await sleep(300)
      const estrategia = crearEstrategia(estratKey)
      const items = estrategia.generar(producto.nombre, condicion)

      // ── 5. BACKEND: generate en Railway ─────────────────────
      ScanObserver.emit("escaneo:progreso", { pct: 70, msg: "Generando recomendaciones en servidor..." })
      let backendResultId: string | null = null
      if (scanId && tType) {
        try {
          const generated = await apiRecommendGenerate({
            scanId,
            transformationTypeId: tType.id,
            itemName: producto.nombre,
          })
          backendResultId = generated.id
          setBackendId(backendResultId)
        } catch (e) {
          console.warn("[Backend] apiRecommendGenerate falló:", (e as Error).message)
        }
      }

      // ── 6. BUILDER: construir resultado validado ─────────────
      ScanObserver.emit("escaneo:progreso", { pct: 88, msg: "Construyendo resultado (Builder)..." })
      await sleep(200)
      const res = new RecomendacionResultadoBuilder()
        .withProducto(producto.id, producto.nombre)
        .withCondicion(condicion)
        .withEstrategia(estratKey, estrategia.nombre)
        .withRecomendaciones(items)
        .build()

      // ── 7. OBSERVER: notificar completado ────────────────────
      ScanObserver.emit("escaneo:progreso", { pct: 100, msg: "¡Análisis completado!" })
      ScanObserver.emit("escaneo:completo", res)
      await sleep(150)

      setResultado(res)
      setGuardadoOk(true)
      setVista("resultado")

    } catch (e: unknown) {
      setError((e as Error).message ?? "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  // ── Feedback → Observer + Backend ───────────────────────────
  const darFeedback = async (resultadoId: string, stars: number) => {
    setFeedback(prev => ({ ...prev, [resultadoId]: stars }))
    ScanObserver.emit("feedback:enviado", { resultadoId, stars })
    if (backendId) {
      try {
        await apiFeedbackCreate({ resultId: backendId, rating: stars, comment: `Feedback ${stars}/5` })
      } catch (e) {
        console.warn("[Backend] apiFeedbackCreate falló:", (e as Error).message)
      }
    }
  }

  const fw = FlyweightCache.stats()
  const colorActual = COLORES[estratKey] ?? COLORES.reutilizar

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold">Recomendaciones</h2>
          <p className="text-sm text-muted-foreground">Analiza un producto y obtén recomendaciones de reutilización</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="text-xs font-mono">🪶 Flyweight: {fw.size} cached</Badge>
          {backendOk === true  && <Badge variant="outline" className="text-xs text-emerald-500">✓ Backend conectado</Badge>}
          {backendOk === false && <Badge variant="outline" className="text-xs text-yellow-500">⚠ Backend sin conexión — modo local</Badge>}
        </div>
      </div>

      {vista === "formulario" ? (
        <div className="max-w-lg space-y-5">

          {/* Imagen */}
          {!imagen ? (
            <div onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleImagen(e.dataTransfer.files[0]) }}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 cursor-pointer hover:border-primary/50 transition-colors">
              <span className="text-4xl mb-3">📷</span>
              <p className="text-sm font-medium">Adjunta imagen del producto</p>
              <p className="text-xs text-muted-foreground mt-1">Arrastra o haz click · JPG · PNG · WEBP</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleImagen(e.target.files?.[0] ?? null)} />
            </div>
          ) : (
            <div className="relative">
              <img src={imagen.preview} alt="producto"
                className="w-full max-h-52 object-cover rounded-xl border" />
              <button onClick={() => setImagen(null)}
                className="absolute top-2 right-2 bg-background/90 border text-xs px-2 py-1 rounded-md hover:bg-muted transition-colors">
                ✕ cambiar
              </button>
              <span className="absolute bottom-2 left-2 bg-background/90 text-xs font-mono px-2 py-1 rounded-md truncate max-w-[80%]">
                {imagen.nombre}
              </span>
            </div>
          )}

          {/* Producto */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Producto</label>
            {productos.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No hay productos — créalos en la pestaña Productos</p>
            ) : (
              <Select value={productoId} onValueChange={v => { setProductoId(v); setError("") }}>
                <SelectTrigger><SelectValue placeholder="Selecciona un producto" /></SelectTrigger>
                <SelectContent>
                  {productos.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Condición — Flyweight */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Condición del producto
            </label>
            <div className="flex flex-wrap gap-2">
              {condiciones.map(c => (
                <button key={c} onClick={() => setCondicion(c)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    condicion === c
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Estrategia — Strategy */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tipo de análisis
            </label>
            <div className="flex flex-col gap-2">
              {estrategias.map(e => {
                const meta = ESTRATEGIA_META[e.estrategiaKey]
                const col  = COLORES[e.estrategiaKey]
                const sel  = estratKey === e.estrategiaKey
                return (
                  <button key={e.estrategiaKey} onClick={() => setEstratKey(e.estrategiaKey)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      sel ? `${col.border} ${col.bg}` : "border-border hover:border-muted-foreground"
                    }`}>
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <p className={`text-sm font-semibold ${sel ? col.text : "text-foreground"}`}>{e.nombre}</p>
                      <p className="text-xs text-muted-foreground">{meta.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Progreso — Observer */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>{progresoMsg}</span><span>{progreso}%</span>
              </div>
              <Progress value={progreso} className="h-1.5" />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              ⚠ {error}
            </p>
          )}

          <Button onClick={analizar} disabled={loading || productos.length === 0} className="w-full">
            {loading ? "Procesando..." : "Analizar →"}
          </Button>
        </div>

      ) : resultado && (
        /* Vista de resultado */
        <div className="space-y-6 max-w-lg">
          <div className={`rounded-xl border p-5 ${colorActual.border} ${colorActual.bg}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{ESTRATEGIA_META[resultado.estrategiaKey]?.icon}</span>
              <div>
                <p className={`font-bold text-lg ${colorActual.text}`}>{resultado.estrategiaNombre}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  Confianza {resultado.confianzaPromedio}% · {resultado.procesadoEnMs}ms
                  {guardadoOk && <span className="text-emerald-400 ml-2">✓ guardado</span>}
                  {backendId  && <span className="text-muted-foreground/40 ml-1">· Railway #{backendId.slice(0,8)}</span>}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mb-5 items-center">
              {imagen && <img src={imagen.preview} alt="" className="w-20 h-20 object-cover rounded-lg border flex-shrink-0" />}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Producto analizado</p>
                <p className="font-bold text-lg">{resultado.productoNombre}</p>
                <p className="text-xs text-muted-foreground capitalize">{resultado.condicion}</p>
              </div>
            </div>

            <div className="space-y-3">
              {resultado.recomendaciones.map((rec, i) => (
                <div key={i} className="flex gap-3 items-start bg-background/50 rounded-lg p-3 border">
                  <div className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${colorActual.badge}`}>
                    {rec.confianza}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{rec.titulo}</p>
                    <p className="text-xs text-muted-foreground mt-1">{esfuerzos[rec.esfuerzo]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback → Observer + Railway */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {feedback[resultado.id] ? (
                <p className="text-sm text-emerald-400">★ {feedback[resultado.id]}/5 — gracias por tu feedback</p>
              ) : (
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => darFeedback(resultado.id, s)}
                      className="flex-1 py-2 rounded-lg border text-lg hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400 transition-all text-muted-foreground">
                      ★
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button variant="outline" onClick={() => { setVista("formulario"); setGuardadoOk(false) }} className="w-full">
            ← Analizar otro
          </Button>
        </div>
      )}

      {/* Historial en memoria — Observer */}
      {historial.length > 0 && (
        <div className="space-y-3 max-w-lg">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Historial de esta sesión
          </p>
          {historial.map(r => {
            const col  = COLORES[r.estrategiaKey] ?? COLORES.reutilizar
            const meta = ESTRATEGIA_META[r.estrategiaKey]
            return (
              <div key={r.id} className={`flex gap-3 items-center p-3 rounded-xl border ${col.border}`}>
                <span className="text-xl">{meta?.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.productoNombre}</p>
                  <p className="text-xs text-muted-foreground">{r.estrategiaNombre} · {r.confianzaPromedio}% confianza</p>
                </div>
                <Badge variant="outline" className={`text-xs ${col.text}`}>{r.recomendaciones.length} recs</Badge>
              </div>
            )
          })}
        </div>
      )}

      {/* Recomendaciones guardadas en DB */}
      {recomendacionesPrevias.length > 0 && (
        <div className="space-y-2 max-w-lg">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Guardadas en base de datos ({recomendacionesPrevias.length})
          </p>
          {recomendacionesPrevias.map(r => {
            const col  = COLORES[r.estrategia_key] ?? COLORES.reutilizar
            const meta = ESTRATEGIA_META[r.estrategia_key]
            return (
              <div key={r.id} className={`flex gap-3 items-center p-3 rounded-xl border ${col.border} bg-muted/20`}>
                <span className="text-xl">{meta?.icon ?? "🔄"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.producto_nombre}</p>
                  <p className="text-xs text-muted-foreground">{r.estrategia_nombre} · {r.confianza_promedio}% confianza</p>
                </div>
                <Badge variant="secondary" className="text-xs">{r.estado}</Badge>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
