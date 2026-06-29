import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { proyectosInvestigacion, hitosInvestigacion } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Microscope, BookMarked, GitBranch, CheckCircle } from "lucide-react"

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendiente: { label: "Pendiente", variant: "secondary" },
  aprobado: { label: "Aprobado", variant: "default" },
  rechazado: { label: "Rechazado", variant: "destructive" },
  en_progreso: { label: "En Progreso", variant: "default" },
  completado: { label: "Completado", variant: "outline" },
}

export default async function InvestigacionPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const [totalProy, totalHitos, aprobados, pendientes] = await Promise.all([
    db.select({ c: count() }).from(proyectosInvestigacion),
    db.select({ c: count() }).from(hitosInvestigacion),
    db.select({ c: count() }).from(proyectosInvestigacion).where(eq(proyectosInvestigacion.estado, "aprobado")),
    db.select({ c: count() }).from(proyectosInvestigacion).where(eq(proyectosInvestigacion.estado, "pendiente")),
  ])

  const proyectos = await db.select().from(proyectosInvestigacion).limit(50)
  const hitos = await db.select().from(hitosInvestigacion).limit(50)

  const n = (r: { c: number }[]) => r[0]?.c ?? 0

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Investigacion</h1>
        <p className="text-[#6B7280] mt-1">Proyectos e informes de investigacion cientifica</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Proyectos", value: n(totalProy), icon: Microscope, color: "#3C6E71" },
          { label: "Hitos Registrados", value: n(totalHitos), icon: GitBranch, color: "#536493" },
          { label: "Aprobados", value: n(aprobados), icon: CheckCircle, color: "#72c184" },
          { label: "Pendientes", value: n(pendientes), icon: BookMarked, color: "#D4A373" },
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#D9D9D9]">
          <CardHeader>
            <CardTitle className="text-[#353535]">Proyectos de Investigacion</CardTitle>
            <CardDescription>Proyectos registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {proyectos.length === 0 ? (
              <p className="text-[#6B7280] text-sm py-6 text-center">No hay proyectos registrados aun.</p>
            ) : (
              <div className="space-y-3">
                {proyectos.slice(0, 8).map((p) => {
                  const cfg = estadoConfig[p.estado] ?? estadoConfig.pendiente
                  return (
                    <div key={p.id} className="flex items-start justify-between py-2 border-b border-[#F5F5F5] last:border-0">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-medium text-[#353535] line-clamp-1">{p.titulo}</p>
                        {p.lineaInvestigacion && (
                          <p className="text-xs text-[#6B7280] mt-0.5">{p.lineaInvestigacion}</p>
                        )}
                      </div>
                      <Badge variant={cfg.variant} className="shrink-0">{cfg.label}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#D9D9D9]">
          <CardHeader>
            <CardTitle className="text-[#353535]">Hitos Recientes</CardTitle>
            <CardDescription>Avances y entregables de proyectos</CardDescription>
          </CardHeader>
          <CardContent>
            {hitos.length === 0 ? (
              <p className="text-[#6B7280] text-sm py-6 text-center">No hay hitos registrados aun.</p>
            ) : (
              <div className="space-y-3">
                {hitos.slice(0, 8).map((h) => {
                  const cfg = estadoConfig[h.estado] ?? estadoConfig.pendiente
                  return (
                    <div key={h.id} className="flex items-start justify-between py-2 border-b border-[#F5F5F5] last:border-0">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-medium text-[#353535] line-clamp-1">{h.descripcion}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{h.fecha}</p>
                      </div>
                      <Badge variant={cfg.variant} className="shrink-0">{cfg.label}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
