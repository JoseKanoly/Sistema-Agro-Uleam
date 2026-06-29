"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Send, Bell, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { enviarNotificacionesPorRoles, getHistorialMasivas } from "@/app/actions/notificaciones"

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

const TIPO_BADGE: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  advertencia: "bg-yellow-100 text-yellow-700",
  urgente: "bg-red-100 text-red-700",
}

export default function NotificacionesMasivasPage() {
  const [titulo, setTitulo] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [tipo, setTipo] = useState("info")
  const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [enviadas, setEnviadas] = useState<Awaited<ReturnType<typeof getHistorialMasivas>>>([])

  useEffect(() => {
    getHistorialMasivas().then(setEnviadas)
  }, [])

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
    try {
      const { enviados } = await enviarNotificacionesPorRoles({
        titulo: titulo.trim(),
        mensaje: mensaje.trim(),
        tipo,
        roles: rolesSeleccionados,
      })
      toast.success(`Notificación enviada a ${enviados} usuario(s)`)
      setTitulo("")
      setMensaje("")
      setRolesSeleccionados([])
      setTipo("info")
      const historial = await getHistorialMasivas()
      setEnviadas(historial)
    } catch {
      toast.error("Error al enviar notificaciones")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Notificaciones Masivas</h1>
        <p className="text-[#6B7280] mt-1">Los usuarios verán las notificaciones en su bandeja</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#D9D9D9]">
          <CardHeader>
            <CardTitle className="text-[#353535] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#3C6E71]" />
              Nueva notificacion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Titulo *</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Asunto" />
            </div>
            <div className="space-y-1.5">
              <Label>Mensaje *</Label>
              <Textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={4} />
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
                    <label htmlFor={rol.value} className="text-sm cursor-pointer">{rol.label}</label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleEnviar} disabled={loading} className="w-full bg-[#3C6E71] hover:bg-[#2F5A5C]">
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Enviando..." : "Enviar notificacion"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#D9D9D9]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#3C6E71]" />
              Historial reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enviadas.length === 0 ? (
              <p className="text-sm text-[#6B7280] text-center py-6">Sin envíos recientes.</p>
            ) : (
              <div className="space-y-3">
                {enviadas.map((n, i) => (
                  <div key={i} className="p-3 rounded-xl border border-[#D9D9D9] bg-[#F5F5F5]">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-semibold">{n.titulo}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${TIPO_BADGE[n.tipo] ?? ""}`}>{n.tipo}</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{n.mensaje}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-2">{n.fecha}</p>
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
