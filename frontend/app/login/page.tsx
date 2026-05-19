"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#02040A] text-slate-200 font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-[#00FF66]/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-[#00FF66] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.5)]">
            <Sparkles className="h-6 w-6 text-black" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">InnoScan</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0D1117] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <h1 className="text-2xl font-bold text-white mb-1">Iniciar sesión</h1>
          <p className="text-slate-400 text-sm mb-6">Accede a tu cuenta de InnoScan</p>

          <label className="block text-xs font-medium text-slate-300 mb-2">Email</label>
          <div className="relative mb-4">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="w-full bg-[#02040A] border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00FF66]/50 focus:ring-1 focus:ring-[#00FF66]/30 transition"
            />
          </div>

          <label className="block text-xs font-medium text-slate-300 mb-2">Contraseña</label>
          <div className="relative mb-5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#02040A] border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00FF66]/50 focus:ring-1 focus:ring-[#00FF66]/30 transition"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00FF66] hover:bg-[#00FF66]/90 text-black font-semibold rounded-lg py-2.5 text-sm transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.3)] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>

          <p className="text-center text-xs text-slate-400 mt-5">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-[#00FF66] hover:underline font-semibold">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
