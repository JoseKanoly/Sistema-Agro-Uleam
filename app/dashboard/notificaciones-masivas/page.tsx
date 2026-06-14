"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Send, Bell, Users, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const ROLES_DESTINO = [
  { value: "PROFESOR", label: "Profesores" },
  { value: "ESTUDIANTE", label: "Estudiantes" },
  { value: "COORDINADOR", label: "Coordinadores" },
  { value: "SECRETARIA", label: "Secretaria" },
  { value: "ADMIN", label: "Administradores" },
]

const TIPO_NOTIF = [
  { value: "info", label: "Informacion" },
  { value: "advertencia", label: "Advertencia" },
  { value: "urgente", label: "Urgente" },
]

interface Enviada {
  id: number
  titulo: string
  mensaje: string
  tipo: string
  destinatarios: string[]
  fecha: string
}

export default function NotificacionesMasivasPage() {
  const [titulo, setTitulo] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [tipo, setTipo] = useState("info")
  const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [enviadas, setEnviadas] = useState<Enviada[]>([
    { id: 1, titulo: "Inicio de periodo academico", mensaje: "Se inicia el periodo 2025-I. Favor actualizar silabos.", tipo: "info", destinatarios: ["PROFESOR", "COORDINADOR"], fecha: "2025-03-01" },
    { id: 2, titulo: "Plazo de entrega de informes", mensaje: "El plazo para entrega de informes vence el 30 de junio.", tipo: "advertencia", destinatarios: ["PROFESOR"], fecha: "2025-06-01" },
  ])

  const toggleRol = (rol: string) => {
    setRolesSeleccionados((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    )
  }

  const handleEnviar = async () => {
    if (!titulo.trim()) { toast.error("El titulo es obligatorio"); return }
    if (!mensaje.trim()) { toast.error("El mensaje es obligatorio"); return }
    if (rolesSeleccionados.length === 0) { toast.error("Seleccione al menos un grupo destinatario"); return }

    setLoading(true)
    // Simulated send — replace with real API call when backend is ready
    await new Promise((r) => setTimeout(r, 800))

    const nueva: Enviada = {
      id: Date.now(),
      titulo,
      mensaje,
      tipo,
      destinatarios: rolesSeleccionados,
      fecha: new Date().toISOString().split("T")[0],
    }
    setEnviadas((prev) => [nueva, ...prev])
    setTitulo("")
    setMensaje("")
    setRolesSeleccionados([])
    setTipo("info")
    setLoading(false)
    toast.success(`Notificacion enviada a ${rolesSeleccionados.length} grupo(s)`)
  }

  const TIPO_BADGE: Record<string, string> = {
    info: "bg-blue-100 text-blue-700",
    advertencia: "bg-yellow-100 text-yellow-700",
    urgente: "bg-red-100 text-red-700",
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Notificaciones Masivas</h1>
        <p className="text-[#64748b] mt-1">Envia comunicados a grupos de usuarios del sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulario */}
        <Card className="border-[#e2e8f0]">
          <CardHeader>
            <CardTitle className="text-[#0f172a] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#1a6b3c]" />
              Nueva notificacion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Titulo *</Label>
              <Input
                placeholder="Asunto de la notificacion"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mensaje *</Label>
              <Textarea
                placeholder="Contenido del mensaje..."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPO_NOTIF.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Destinatarios *</Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES_DESTINO.map((rol) => (
                  <div key={rol.value} className="flex items-center gap-2">
                    <Checkbox
                      id={rol.value}
                      checked={rolesSeleccionados.includes(rol.value)}
                      onCheckedChange={() => toggleRol(rol.value)}
                    />
                    <label htmlFor={rol.value} className="text-sm text-[#0f172a] cursor-pointer">
                      {rol.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={handleEnviar}
              disabled={loading}
              className="w-full bg-[#1a6b3c] hover:bg-[#155730] text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Enviando..." : "Enviar notificacion"}
            </Button>
          </CardContent>
        </Card>

        {/* Historial */}
        <Card className="border-[#e2e8f0]">
          <CardHeader>
            <CardTitle className="text-[#0f172a] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#1a6b3c]" />
              Historial de envios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enviadas.length === 0 ? (
              <p className="text-[#64748b] text-sm text-center py-6">No hay notificaciones enviadas.</p>
            ) : (
              <div className="space-y-3">
                {enviadas.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#0f172a] line-clamp-1">{n.titulo}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TIPO_BADGE[n.tipo] ?? "bg-gray-100 text-gray-700"}`}>
                        {n.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748b] mt-1 line-clamp-2">{n.mensaje}</p>
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {n.destinatarios.map((d) => (
                        <span key={d} className="text-[10px] bg-[#e8f5ee] text-[#1a6b3c] px-1.5 py-0.5 rounded-full font-medium">
                          {ROLES_DESTINO.find((r) => r.value === d)?.label ?? d}
                        </span>
                      ))}
                      <span className="text-[10px] text-[#94a3b8] ml-auto">{n.fecha}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
