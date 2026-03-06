// lib/patterns/strategy.ts
//
// ══════════════════════════════════════════════════════════════
// PATRÓN STRATEGY (Comportamiento)
//
// Interfaz común: cada estrategia encapsula un algoritmo
// distinto de recomendación para el mismo objeto escaneado.
// El código cliente trabaja con la interfaz sin conocer
// cuál implementación se está usando.
// ══════════════════════════════════════════════════════════════

import type { CondicionTag, EsfuerzoKey } from "./flyweight"

export interface RecomendacionItem {
  titulo:     string
  confianza:  number        // 0–100
  esfuerzo:   EsfuerzoKey
}

// ── Interfaz común ────────────────────────────────────────────
export interface EstrategiaRecomendacion {
  readonly nombre:      string
  readonly estrategiaKey: string
  generar(nombreProducto: string, condicion: CondicionTag): RecomendacionItem[]
}

// ── Estrategia 1: Reutilizar ──────────────────────────────────
class EstrategiaReutilizar implements EstrategiaRecomendacion {
  readonly nombre       = "Reutilizar"
  readonly estrategiaKey = "reutilizar"

  generar(nombre: string, condicion: CondicionTag): RecomendacionItem[] {
    const buena = ["nuevo", "bueno"].includes(condicion)
    return [
      { titulo: `Donar "${nombre}" a una organización local`,        confianza: buena ? 92 : 70, esfuerzo: "bajo"  },
      { titulo: `Vender "${nombre}" en marketplace de segunda mano`, confianza: buena ? 88 : 62, esfuerzo: "bajo"  },
      { titulo: `Intercambiar en una comunidad de trueque`,          confianza: 74,              esfuerzo: "medio" },
    ]
  }
}

// ── Estrategia 2: Transformar ─────────────────────────────────
class EstrategiaTransformar implements EstrategiaRecomendacion {
  readonly nombre       = "Transformar"
  readonly estrategiaKey = "transformar"

  generar(nombre: string, condicion: CondicionTag): RecomendacionItem[] {
    const reparable = ["regular", "dañado"].includes(condicion)
    return [
      { titulo: `Upcycling: convertir "${nombre}" en elemento decorativo`, confianza: reparable ? 75 : 68, esfuerzo: "alto"  },
      { titulo: `Desmontar "${nombre}" para extraer piezas reutilizables`,  confianza: 85,                  esfuerzo: "medio" },
      { titulo: `Llevar a taller DIY comunitario`,                          confianza: 65,                  esfuerzo: "alto"  },
    ]
  }
}

// ── Estrategia 3: Reconfigurar ────────────────────────────────
class EstrategiaReconfigurar implements EstrategiaRecomendacion {
  readonly nombre       = "Reconfigurar"
  readonly estrategiaKey = "reconfigurar"

  generar(nombre: string, condicion: CondicionTag): RecomendacionItem[] {
    const viejo = ["antiguo", "raro"].includes(condicion)
    return [
      { titulo: `Reparar y actualizar los componentes de "${nombre}"`, confianza: viejo ? 72 : 82, esfuerzo: "medio" },
      { titulo: `Adaptar "${nombre}" para un propósito diferente`,     confianza: 74,              esfuerzo: "medio" },
      { titulo: `Combinar con otros objetos para nueva función`,       confianza: 66,              esfuerzo: "alto"  },
    ]
  }
}

// ── Factory: instancias únicas reutilizadas ───────────────────
const _estrategias: Record<string, EstrategiaRecomendacion> = {
  reutilizar:   new EstrategiaReutilizar(),
  transformar:  new EstrategiaTransformar(),
  reconfigurar: new EstrategiaReconfigurar(),
}

export function crearEstrategia(key: string): EstrategiaRecomendacion {
  const e = _estrategias[key]
  if (!e) throw new Error(`[Strategy] clave desconocida: "${key}"`)
  return e
}

export function todasLasEstrategias(): EstrategiaRecomendacion[] {
  return Object.values(_estrategias)
}
