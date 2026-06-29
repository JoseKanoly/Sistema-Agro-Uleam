import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { silabos, materias, periodos } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, CheckCircle, XCircle } from "lucide-react"

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendiente: { label: "Pendiente", variant: "secondary" },
  aprobado: { label: "Aprobado", variant: "default" },
  rechazado: { label: "Rechazado", variant: "destructive" },
}

export default async function SilabosPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const rol = data.perfil?.rol ?? "docente"
  const isDocente = rol === "docente"

  const [totalRows, pendientes, aprobados, rechazados] = await Promise.all([
    isDocente
      ? db.select({ c: count() }).from(silabos).where(eq(silabos.docenteId, data.user.id))
      : db.select({ c: count() }).from(silabos),
    isDocente
      ? db.select({ c: count() }).from(silabos).where(eq(silabos.docenteId, data.user.id))
      : db.select({ c: count() }).from(silabos).where(eq(silabos.estado, "pendiente")),
    db.select({ c: count() }).from(silabos).where(eq(silabos.estado, "aprobado")),
    db.select({ c: count() }).from(silabos).where(eq(silabos.estado, "rechazado")),
  ])

  const rows = isDocente
    ? await db.select().from(silabos).where(eq(silabos.docenteId, data.user.id)).limit(50)
    : await db.select().from(silabos).limit(50)

  const materiasList = await db.select().from(materias)
  const periodosList = await db.select().from(periodos)
  const materiaMap = Object.fromEntries(materiasList.map((m) => [m.id, m.nombre]))
  const periodoMap = Object.fromEntries(periodosList.map((p) => [p.id, p.nombre]))

  const n = (r: { c: number }[]) => r[0]?.c ?? 0

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Silabos</h1>
        <p className="text-[#6B7280] mt-1">{isDocente ? "Mis silabos por periodo academico" : "Gestion de silabos docentes"}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: n(totalRows), icon: BookOpen, color: "#3C6E71" },
          { label: "Pendientes", value: n(pendientes), icon: Clock, color: "#D4A373" },
          { label: "Aprobados", value: n(aprobados), icon: CheckCircle, color: "#72c184" },
          { label: "Rechazados", value: n(rechazados), icon: XCircle, color: "#ef4444" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-[#D9D9D9]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</p>
                  <p className="text-3xl font-bold text-[#353535] mt-1">{value}</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "18" }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <CardTitle className="text-[#353535]">Listado de Silabos</CardTitle>
          <CardDescription>Silabos registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-[#6B7280] text-sm py-8 text-center">No hay silabos registrados aun.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D9D9D9]">
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Materia</th>
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Periodo</th>
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Fecha registro</th>
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Estado</th>
                    {!isDocente && <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Docente ID</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const cfg = estadoConfig[s.estado] ?? estadoConfig.pendiente
                    return (
                      <tr key={s.id} className="border-b border-[#F5F5F5] hover:bg-[#F5F5F5] transition-colors">
                        <td className="py-3 px-3 font-medium text-[#353535]">{materiaMap[s.materiaId] ?? `Materia #${s.materiaId}`}</td>
                        <td className="py-3 px-3 text-[#475569]">{periodoMap[s.periodoId] ?? `Periodo #${s.periodoId}`}</td>
                        <td className="py-3 px-3 text-[#475569]">{new Date(s.createdAt).toLocaleDateString("es-EC")}</td>
                        <td className="py-3 px-3">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>
                        {!isDocente && <td className="py-3 px-3 text-[#475569] text-xs font-mono">{s.docenteId.slice(0, 8)}…</td>}
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
