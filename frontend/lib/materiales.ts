/**
 * Sistema de detección de materiales para el visor AR.
 * Lee la respuesta de la IA y determina qué modelo 3D mostrar.
 */

export type Material =
  | "madera"
  | "plastico"
  | "metal"
  | "carton"
  | "vidrio"
  | "electronico"
  | "tela"
  | "organico"
  | "default"

type MaterialKey = Exclude<Material, "default">

const KEYWORDS_POR_MATERIAL: Record<MaterialKey, string[]> = {
  electronico: [
    "electronico", "electronica", "electronicos", "electronicas",
    "circuito", "bateria", "pila", "chip",
    "dispositivo electronico", "componente electronico",
  ],
  vidrio: [
    "vidrio", "cristal", "cristales", "vidrios",
  ],
  metal: [
    "metal", "metalico", "metalica", "metales",
    "aluminio", "acero", "hierro", "lata", "estanio", "cobre",
  ],
  carton: [
    "carton", "cartones", "cartulina",
    "papel", "papeles", "celulosa",
  ],
  madera: [
    "madera", "maderas",
    "bambu", "corcho",
  ],
  tela: [
    "tela", "telas", "tejido", "textil", "fibra",
    "algodon", "lana", "poliester",
  ],
  organico: [
    "organico", "organica", "organicos", "organicas",
    "biodegradable", "compost", "compostable",
    "alimento", "comida", "fruta", "verdura",
  ],
  plastico: [
    "plastico", "plastica", "plasticos", "plasticas",
    "pet", "polietileno", "polipropileno", "pvc", "polimero",
  ],
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function detectarMaterial(texto: string | null | undefined): Material {
  if (!texto || typeof texto !== "string") {
    return "default"
  }

  const textoNormalizado = normalizar(texto)
  const entradas = Object.entries(KEYWORDS_POR_MATERIAL) as [MaterialKey, string[]][]

  for (const [material, keywords] of entradas) {
    for (const keyword of keywords) {
      const regex = new RegExp(`(^|\\s)${keyword}(\\s|$)`)
      if (regex.test(textoNormalizado)) {
        return material
      }
    }
  }

  return "default"
}

export function rutaModelo(material: Material): string {
  if (material === "default") return "/models/generico.glb"
  return `/models/${material}.glb`
}
