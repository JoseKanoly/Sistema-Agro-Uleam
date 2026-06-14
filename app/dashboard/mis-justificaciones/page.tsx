import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { justificaciones } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, Clock, CheckCircle, XCircle } from "lucide-react"

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendiente: { label: "Pendiente", variant: "secondary" },
  aprobado: { label: "Aprobado", variant: "default" },
  rechazado: { label: "Rechazado", variant: "destructive" },
}

export default async function MisJustificacionesPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const rows = await db
    .select()
    .from(justificaciones)
    .where(eq(justificaciones.solicitanteId, data.user.id))
    .limit(50)

  const total = rows.length
  const pendientes = rows.filter((r) => r.estado === "pendiente").length
  const aprobadas = rows.filter((r) => r.estado === "aprobado").length
  const rechazadas = rows.filter((r) => r.estado === "rechazado").length

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Mis Justificaciones</h1>
        <p className="text-[#64748b] mt-1">Solicitudes de justificacion de faltas enviadas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: total, icon: ClipboardCheck, color: "#1a6b3c" },
          { label: "Pendientes", value: pendientes, icon: Clock, color: "#f59e0b" },
          { label: "Aprobadas", value: aprobadas, icon: CheckCircle, color: "#22c55e" },
          { label: "Rechazadas", value: rechazadas, icon: XCircle, color: "#ef4444" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-[#e2e8f0]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">{label}</p>
                  <p className="text-3xl font-bold text-[#0f172a] mt-1">{value}</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "18" }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#e2e8f0]">
        <CardHeader>
          <CardTitle className="text-[#0f172a]">Mis Justificaciones</CardTitle>
          <CardDescription>Historial de solicitudes enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardCheck className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-[#475569] font-medium">No tienes justificaciones registradas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left py-3 px-3 text-[#64748b] font-medium">Motivo</th>
                    <th className="text-left py-3 px-3 text-[#64748b] font-medium">Fecha</th>
                    <th className="text-left py-3 px-3 text-[#64748b] font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((j) => {
                    const cfg = estadoConfig[j.estado] ?? estadoConfig.pendiente
                    return (
                      <tr key={j.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                        <td className="py-3 px-3 font-medium text-[#0f172a]">{j.motivo}</td>
                        <td className="py-3 px-3 text-[#475569]">{j.fecha}</td>
                        <td className="py-3 px-3">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
