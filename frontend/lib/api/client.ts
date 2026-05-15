const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
console.log("BASE_URL =", BASE_URL)

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`[API ${res.status}] ${path} — ${body}`)
  }
  return res.json() as Promise<T>
}

// Tipos
export type Producto      = { id: string; nombre: string; categoria: string | null; descripcion?: string; created_at: string }
export type Idea          = { id: string; titulo: string; descripcion: string; estado: string; producto_id: string | null; productos?: { nombre: string } | null; created_at: string }
export type Escaneo       = { id: string; itemName: string; condition: string; status: string; createdAt: string; category: any }
export type Category      = { id: string; label: string }
export type TransformType = { id: string; name: string; strategyKey: string }
export type RecResult     = { id: string; scanId: string; strategyName: string; recommendations: any[]; createdAt: string }

// Productos
export const apiProductosList   = (search?: string, categoria?: string) => {
  const q = new URLSearchParams()
  if (search)    q.set('search', search)
  if (categoria) q.set('categoria', categoria)
  const qs = q.toString()
  return request<Producto[]>(`/api/v1/productos${qs ? `?${qs}` : ""}`)
}
export const apiProductoCreate  = (body: { nombre: string; categoria?: string; descripcion?: string; codigo_barras?: string }) =>
  request<Producto>("/api/v1/productos", { method: "POST", body: JSON.stringify(body) })
export const apiProductoDelete  = (id: string) =>
  request<{ deleted: boolean }>(`/api/v1/productos/${id}`, { method: "DELETE" })

// Ideas
export const apiIdeasList       = (estado?: string) =>
  request<Idea[]>(`/api/v1/ideas${estado ? `?estado=${estado}` : ""}`)
export const apiIdeaCreate      = (body: { titulo: string; descripcion: string; producto_id?: string; categoria?: string; estado?: string }) =>
  request<Idea>("/api/v1/ideas", { method: "POST", body: JSON.stringify(body) })
export const apiIdeaUpdateEstado = (id: string, estado: string) =>
  request<Idea>(`/api/v1/ideas/${id}`, { method: "PATCH", body: JSON.stringify({ estado }) })
export const apiIdeaDelete      = (id: string) =>
  request<{ deleted: boolean }>(`/api/v1/ideas/${id}`, { method: "DELETE" })

// Escaneos (scans)
export const apiEscaneosList    = (page = 1, limit = 20) =>
  request<{ data: Escaneo[]; total: number }>(`/api/v1/scans?page=${page}&limit=${limit}`)
export const apiEscaneoCreate   = (body: { itemName: string; categoryId: string; condition: string; description?: string }) =>
  request<Escaneo>("/api/v1/scans", { method: "POST", body: JSON.stringify(body) })
export const apiEscaneoDelete   = (id: string) =>
  request<any>(`/api/v1/scans/${id}`, { method: "DELETE" })
export const apiEscaneosStats   = () => request<any>("/api/v1/scans/stats")

// Catálogo Flyweight
export const apiCategories      = () => request<Category[]>("/api/v1/categories")
export const apiTransformTypes  = () => request<TransformType[]>("/api/v1/transformation-types")

// Recomendaciones
export const apiRecommendGenerate = (body: { 
  scanId: string; 
  transformationTypeId: string; 
  itemName?: string;
  imageBase64?: string;  // <- agregar esto
}) =>
  request<RecResult>("/api/v1/recommendations/generate", { method: "POST", body: JSON.stringify(body) })
export const apiRecommendList   = () => request<RecResult[]>("/api/v1/recommendations")

// Feedback
export const apiFeedbackCreate  = (body: { resultId: string; rating: number; comment?: string }) =>
  request<any>("/api/v1/feedback", { method: "POST", body: JSON.stringify(body) })
