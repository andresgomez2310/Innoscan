"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Star, Loader2, AlertCircle, Inbox } from "lucide-react"
import { apiFeedbackList, type Feedback } from "@/lib/api/client"

export function FeedbackTab() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    apiFeedbackList()
      .then((res: any) => setFeedbacks(res.data ?? []))
      .catch(() => setError("No se pudo cargar el historial de feedbacks"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Encabezado */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 rounded-lg bg-[#00FF66]/10">
          <MessageSquare className="h-5 w-5 text-[#00FF66]" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Historial de Feedback</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">{feedbacks.length} evaluaciones registradas</p>
        </div>
      </div>

      {/* Estado: cargando */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-[#00FF66] animate-spin" />
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Cargando feedbacks...</p>
        </div>
      )}

      {/* Estado: error */}
      {!loading && error && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Estado: vacío */}
      {!loading && !error && feedbacks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-white/5 rounded-3xl">
          <Inbox className="h-10 w-10 text-slate-600" />
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Aún no hay feedbacks registrados</p>
        </div>
      )}

      {/* Lista de feedbacks */}
      {!loading && !error && feedbacks.length > 0 && (
        <div className="grid gap-4">
          {feedbacks.map((fb, idx) => (
            <FeedbackCard key={fb.id ?? idx} feedback={fb} />
          ))}
        </div>
      )}
    </div>
  )
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const fecha = feedback.createdAt
    ? new Date(feedback.createdAt).toLocaleDateString("es-CO", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—"

  return (
    <div className="bg-black/20 border border-white/10 rounded-2xl p-5 hover:border-[#00FF66]/20 transition-all duration-300 space-y-3">
      
      {/* Fila superior: estrellas + fecha */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={16}
              className={star <= feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{fecha}</span>
      </div>

      {/* Comentario */}
      {feedback.comment ? (
        <p className="text-slate-300 text-sm leading-relaxed italic">"{feedback.comment}"</p>
      ) : (
        <p className="text-slate-600 text-xs italic">Sin comentario</p>
      )}

      {/* ID de resultado */}
      <p className="text-[10px] text-slate-600 font-mono">ID: {feedback.resultId}</p>
    </div>
  )
}
