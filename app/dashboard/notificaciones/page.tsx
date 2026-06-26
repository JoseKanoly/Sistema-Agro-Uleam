"use client"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { getNotificaciones, marcarLeida, marcarTodasLeidas } from "./actions"

interface Notificacion {
  id: number
  titulo: string
  mensaje: string
  tipo: string
  leida: boolean
  createdAt: string
}

const tipoMap: Record<string, string> = {
  advertencia: 'warning',
  urgente: 'error',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
}

const tipoIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const tipoColor: Record<string, string> = {
  info: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs} h`
  return `Hace ${Math.floor(hrs / 24)} dias`
}

export default function NotificacionesPage() {
  const [notifs, setNotifs] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getNotificaciones().then((data) => {
      setNotifs(data)
      setLoading(false)
    })
  }, [])

  const unread = notifs.filter((n) => !n.leida).length

  const handleMarkRead = (id: number) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
    startTransition(async () => {
      await marcarLeida(id)
    })
  }

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })))
    startTransition(async () => {
      await marcarTodasLeidas()
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Notificaciones</h1>
            <p className="text-[#64748b] mt-1">
              {loading
                ? "Cargando..."
                : unread > 0
                ? `Tienes ${unread} notificacion${unread > 1 ? "es" : ""} sin leer`
                : "Todas las notificaciones han sido leidas"}
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: notifs.length, color: "#1a6b3c" },
          { label: "Sin leer", value: unread, color: "#3b82f6" },
          { label: "Leidas", value: notifs.length - unread, color: "#22c55e" },
          { label: "Alertas", value: notifs.filter((n) => n.tipo === "warning" || n.tipo === "error").length, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-[#e2e8f0]">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">{label}</p>
              <p className="text-3xl font-bold text-[#0f172a] mt-1" style={{ color: value > 0 ? color : undefined }}>
                {loading ? "—" : value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#e2e8f0]">
        <CardHeader>
          <CardTitle className="text-[#0f172a]">Centro de notificaciones</CardTitle>
          <CardDescription>Actividad reciente del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-[#1a6b3c] animate-spin mx-auto mb-3" />
              <p className="text-[#64748b] text-sm">Cargando notificaciones...</p>
            </div>
          ) : notifs.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-[#475569] font-medium">No tienes notificaciones.</p>
              <p className="text-[#94a3b8] text-sm mt-1">
                Las notificaciones del sistema apareceran aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifs.map((n) => {
                const tipo = tipoMap[n.tipo] ?? n.tipo
                const Icon = tipoIcon[tipo] ?? Info
                const color = tipoColor[tipo] ?? "#3b82f6"
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                      n.leida ? "border-[#f1f5f9] bg-white" : "border-[#dbeafe] bg-[#eff6ff]"
                    }`}
                    onClick={() => !n.leida && handleMarkRead(n.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && !n.leida && handleMarkRead(n.id)}
                    aria-label={`Notificacion: ${n.titulo}`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: color + "18" }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${n.leida ? "text-[#475569]" : "text-[#0f172a]"}`}>
                          {n.titulo}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-[#94a3b8]">{timeAgo(n.createdAt)}</span>
                          {!n.leida && (
                            <div className="w-2 h-2 rounded-full bg-[#3b82f6]" aria-label="No leida" />
                          )}
                        </div>
                      </div>
                      <p className={`text-xs mt-0.5 leading-relaxed ${n.leida ? "text-[#94a3b8]" : "text-[#64748b]"}`}>
                        {n.mensaje}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
