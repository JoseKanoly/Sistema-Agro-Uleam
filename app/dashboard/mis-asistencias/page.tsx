import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { faltas, materias } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarCheck, AlertCircle, Clock, CheckCircle } from "lucide-react"

const tipoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  injustificada: { label: "Injustificada", variant: "destructive" },
  justificada: { label: "Justificada", variant: "default" },
  atraso: { label: "Atraso", variant: "secondary" },
}

export default async function MisAsistenciasPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const [total, injustificadas, justificadasCount, atrasos] = await Promise.all([
    db.select({ c: count() }).from(faltas).where(eq(faltas.estudianteId, data.user.id)),
    db.select({ c: count() }).from(faltas).where(eq(faltas.estudianteId, data.user.id)),
    db.select({ c: count() }).from(faltas).where(eq(faltas.estudianteId, data.user.id)),
    db.select({ c: count() }).from(faltas).where(eq(faltas.estudianteId, data.user.id)),
  ])

  const rows = await db
    .select()
    .from(faltas)
    .where(eq(faltas.estudianteId, data.user.id))
    .limit(50)

  const materiasList = await db.select().from(materias)
  const materiaMap = Object.fromEntries(materiasList.map((m) => [m.id, m.nombre]))

  const inj = rows.filter((r) => r.tipo === "injustificada").length
  const jus = rows.filter((r) => r.tipo === "justificada").length
  const atr = rows.filter((r) => r.tipo === "atraso").length

  const n = (r: { c: number }[]) => r[0]?.c ?? 0

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Mis Asistencias</h1>
        <p className="text-[#6B7280] mt-1">Registro de faltas y atrasos por materia</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Faltas", value: n(total), icon: CalendarCheck, color: "#3C6E71" },
          { label: "Injustificadas", value: inj, icon: AlertCircle, color: "#ef4444" },
          { label: "Justificadas", value: jus, icon: CheckCircle, color: "#72c184" },
          { label: "Atrasos", value: atr, icon: Clock, color: "#D4A373" },
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
          <CardTitle className="text-[#353535]">Registro de Asistencias</CardTitle>
          <CardDescription>Historial completo de faltas y atrasos</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarCheck className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-[#475569] font-medium">Sin registro de faltas.</p>
              <p className="text-sm text-[#72c184] mt-1 font-medium">Excelente asistencia!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D9D9D9]">
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Materia</th>
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Fecha</th>
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Tipo</th>
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Observacion</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f) => {
                    const cfg = tipoConfig[f.tipo] ?? tipoConfig.injustificada
                    return (
                      <tr key={f.id} className="border-b border-[#F5F5F5] hover:bg-[#F5F5F5] transition-colors">
                        <td className="py-3 px-3 font-medium text-[#353535]">{materiaMap[f.materiaId] ?? `Materia #${f.materiaId}`}</td>
                        <td className="py-3 px-3 text-[#475569]">{f.fecha}</td>
                        <td className="py-3 px-3">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>
                        <td className="py-3 px-3 text-[#475569]">{f.observacion ?? "—"}</td>
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
