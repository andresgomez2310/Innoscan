// lib/patterns/builder.ts
//
// ══════════════════════════════════════════════════════════════
// PATRÓN BUILDER (Creacional)
//
// Construye un RecomendacionResultado paso a paso.
// build() valida que todos los campos estén presentes antes
// de retornar el objeto — nunca existe un resultado incompleto.
// ══════════════════════════════════════════════════════════════

import type { RecomendacionItem } from "./strategy"

export interface RecomendacionResultado {
  id:             string
  productoId:     string
  productoNombre: string
  condicion:      string
  estrategiaKey:  string
  estrategiaNombre: string
  recomendaciones: RecomendacionItem[]
  confianzaPromedio: number
  procesadoEnMs:  number
  estado:         "COMPLETO"
  creadoEn:       string
}

export class RecomendacionResultadoBuilder {
  private _productoId:      string | null = null
  private _productoNombre:  string | null = null
  private _condicion:       string | null = null
  private _estrategiaKey:   string | null = null
  private _estrategiaNombre: string | null = null
  private _recomendaciones: RecomendacionItem[] = []
  private readonly _inicio = Date.now()

  withProducto(id: string, nombre: string): this {
    this._productoId     = id
    this._productoNombre = nombre
    return this
  }

  withCondicion(condicion: string): this {
    this._condicion = condicion
    return this
  }

  withEstrategia(key: string, nombre: string): this {
    this._estrategiaKey    = key
    this._estrategiaNombre = nombre
    return this
  }

  withRecomendaciones(items: RecomendacionItem[]): this {
    this._recomendaciones = items
    return this
  }

  build(): RecomendacionResultado {
    // Validaciones — el objeto no puede existir si está incompleto
    if (!this._productoId)      throw new Error("[Builder] productoId es obligatorio")
    if (!this._productoNombre)  throw new Error("[Builder] productoNombre es obligatorio")
    if (!this._condicion)       throw new Error("[Builder] condicion es obligatoria")
    if (!this._estrategiaKey)   throw new Error("[Builder] estrategiaKey es obligatorio")
    if (!this._estrategiaNombre) throw new Error("[Builder] estrategiaNombre es obligatorio")
    if (this._recomendaciones.length === 0)
      throw new Error("[Builder] debe incluir al menos una recomendación")

    const confianzaPromedio = Math.round(
      this._recomendaciones.reduce((s, r) => s + r.confianza, 0) /
      this._recomendaciones.length,
    )

    return {
      id:               `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      productoId:       this._productoId,
      productoNombre:   this._productoNombre,
      condicion:        this._condicion,
      estrategiaKey:    this._estrategiaKey,
      estrategiaNombre: this._estrategiaNombre,
      recomendaciones:  this._recomendaciones,
      confianzaPromedio,
      procesadoEnMs:    Date.now() - this._inicio,
      estado:           "COMPLETO",
      creadoEn:         new Date().toISOString(),
    }
  }
}
