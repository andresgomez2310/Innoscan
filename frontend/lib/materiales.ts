export type MaterialAR = {
  nombre: string
  archivo: string
  escala?: string
}

export const MATERIALES_AR: Record<string, MaterialAR> = {
  madera:      { nombre: "Madera",      archivo: "/models/madera.glb",      escala: "1 1 1" },
  plastico:    { nombre: "Plástico",    archivo: "/models/plastico.glb",    escala: "1 1 1" },
  metal:       { nombre: "Metal",       archivo: "/models/metal.glb",       escala: "1 1 1" },
  carton:      { nombre: "Cartón",      archivo: "/models/carton.glb",      escala: "1 1 1" },
  vidrio:      { nombre: "Vidrio",      archivo: "/models/vidrio.glb",      escala: "1 1 1" },
  electronico: { nombre: "Electrónico", archivo: "/models/electronico.glb", escala: "1 1 1" },
  tela:        { nombre: "Tela",        archivo: "/models/tela.glb",        escala: "1 1 1" },
  organico:    { nombre: "Orgánico",    archivo: "/models/organico.glb",    escala: "1 1 1" },
}

export const MATERIAL_GENERICO: MaterialAR = {
  nombre: "Genérico",
  archivo: "/models/generico.glb",
  escala: "1 1 1",
}

export function detectarMaterial(respuestaOllama: string): MaterialAR {
  const texto = respuestaOllama.toLowerCase()

  const sinonimos: Record<string, string[]> = {
    madera:      ["madera", "madero", "madera natural"],
    plastico:    ["plástico", "plastico", "pvc", "polietileno"],
    metal:       ["metal", "metálico", "acero", "aluminio", "hierro", "cobre"],
    carton:      ["cartón", "carton", "papel", "cardboard"],
    vidrio:      ["vidrio", "cristal", "glass"],
    electronico: ["electrónico", "electronico", "circuito", "cable", "digital"],
    tela:        ["tela", "telas", "tejido", "textil", "ropa", "algodón"],
    organico:    ["orgánico", "organico", "natural", "maíz", "fruta", "vegetal"],
  }

  for (const [clave, palabras] of Object.entries(sinonimos)) {
    if (palabras.some(p => texto.includes(p))) {
      return MATERIALES_AR[clave]
    }
  }

  return MATERIAL_GENERICO
}