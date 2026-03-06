// lib/patterns/flyweight.ts
//
// ══════════════════════════════════════════════════════════════
// PATRÓN FLYWEIGHT (Estructural)
//
// Problema: cada componente que necesite categorías o etiquetas
// crearía sus propias copias del mismo objeto en memoria.
//
// Solución: un único objeto compartido por toda la app.
// Los datos estáticos (condiciones, esfuerzo) nunca van a la red.
// Los datos dinámicos (categorías de Supabase) se cargan una vez.
// ══════════════════════════════════════════════════════════════

export type CondicionTag = "nuevo" | "bueno" | "regular" | "dañado" | "antiguo" | "raro"
export type EsfuerzoKey  = "bajo" | "medio" | "alto"

// ── Datos estáticos compartidos (nunca se duplican) ───────────
export const CONDICION_TAGS: readonly CondicionTag[] = [
  "nuevo", "bueno", "regular", "dañado", "antiguo", "raro",
] as const

export const ESFUERZO_LABELS: Readonly<Record<EsfuerzoKey, string>> = {
  bajo:  "🟢 Bajo",
  medio: "🟡 Medio",
  alto:  "🔴 Alto",
} as const

export const ESTRATEGIA_META: Readonly<Record<string, { icon: string; color: string; desc: string }>> = {
  reutilizar:   { icon: "♻️", color: "emerald", desc: "Donar · vender · intercambiar" },
  transformar:  { icon: "🔄", color: "yellow",  desc: "Upcycling · desmontar · DIY"   },
  reconfigurar: { icon: "⚙️", color: "pink",    desc: "Reparar · adaptar · combinar"  },
} as const

// ── Cache dinámico (singleton en módulo) ──────────────────────
const _cache = new Map<string, unknown>()

export const FlyweightCache = {
  set<T>(key: string, value: T): T {
    _cache.set(key, value)
    return value
  },
  get<T>(key: string): T | undefined {
    return _cache.get(key) as T | undefined
  },
  has(key: string): boolean {
    return _cache.has(key)
  },
  stats() {
    return { size: _cache.size, keys: [..._cache.keys()] }
  },
}
