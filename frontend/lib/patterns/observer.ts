// lib/patterns/observer.ts
//
// ══════════════════════════════════════════════════════════════
// PATRÓN OBSERVER (Comportamiento)
//
// ScanObserver.emit()      → Subject notifica sin saber quién escucha
// ScanObserver.subscribe() → Observer se registra a un evento
// useScanObserver()        → Hook React, se desuscribe al desmontar
//
// Eventos del dominio:
//   "escaneo:progreso"  → resultado parcial durante el procesamiento
//   "escaneo:completo"  → resultado final listo (Builder.build() exitoso)
//   "feedback:enviado"  → usuario calificó un resultado
// ══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react"

type Listener<T = unknown> = (data: T) => void

const _listeners = new Map<string, Listener[]>()

export const ScanObserver = {
  // Subject: emite sin conocer a los observadores
  emit(evento: string, data?: unknown): void {
    ;(_listeners.get(evento) ?? []).forEach((cb) => cb(data))
  },

  // Observer: se suscribe y recibe función de limpieza
  subscribe(evento: string, cb: Listener): () => void {
    if (!_listeners.has(evento)) _listeners.set(evento, [])
    _listeners.get(evento)!.push(cb)
    return () => {
      _listeners.set(evento, (_listeners.get(evento) ?? []).filter((x) => x !== cb))
    }
  },
}

// Hook React: suscribe el componente y limpia al desmontar
export function useScanObserver<T = unknown>(evento: string, callback: Listener<T>): void {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    const unsub = ScanObserver.subscribe(evento, (d) => cbRef.current(d as T))
    return unsub
  }, [evento])
}
