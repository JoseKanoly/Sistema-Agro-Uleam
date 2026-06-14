import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { laboratorios, practicas, equipos, reactivos } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { Card, CardContent } from "@/components/ui/card"
import { FlaskConical, BookOpenCheck, Wrench, TestTube, Users } from "lucide-react"

export default async function LabEstadisticasPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const [totalLabs, totalPracticas, totalEquipos, totalReactivos, programadas, realizadas] = await Promise.all([
    db.select({ c: count() }).from(laboratorios),
    db.select({ c: count() }).from(practicas),
    db.select({ c: count() }).from(equipos),
    db.select({ c: count() }).from(reactivos),
    db.select({ c: count() }).from(practicas).where(eq(practicas.estado, "programada")),
    db.select({ c: count() }).from(practicas).where(eq(practicas.estado, "realizada")),
  ])

  const practicasRecientes = await db.select().from(practicas).limit(5)
  const labsList = await db.select().from(laboratorios)
  const labMap = Object.fromEntries(labsList.map((l) => [l.id, l.nombre]))
  const n = (r: { c: number }[]) => r[0]?.c ?? 0

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Estadísticas de Laboratorio</h1>
        <p className="text-[#64748b] mt-1">Resumen operativo de prácticas y laboratorios</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Laboratorios", value: n(totalLabs), icon: FlaskConical, color: "#1a6b3c" },
          { label: "Prácticas", value: n(totalPracticas), icon: BookOpenCheck, color: "#3b82f6" },
          { label: "Programadas", value: n(programadas), icon: Users, color: "#f59e0b" },
          { label: "Realizadas", value: n(realizadas), icon: Wrench, color: "#22c55e" },
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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-6">
            <h2 className="font-bold text-[#0f172a] mb-4">Inventario general</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#64748b]">Equipos registrados</span><span className="font-semibold">{n(totalEquipos)}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Reactivos registrados</span><span className="font-semibold">{n(totalReactivos)}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Laboratorios activos</span><span className="font-semibold">{labsList.filter((l) => l.estado === "activo").length}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e2e8f0]">
          <CardContent className="p-6">
            <h2 className="font-bold text-[#0f172a] mb-4">Prácticas recientes</h2>
            {practicasRecientes.length === 0 ? (
              <p className="text-sm text-[#64748b]">No hay prácticas registradas.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {practicasRecientes.map((p) => (
                  <li key={p.id} className="flex justify-between border-b border-[#f1f5f9] pb-2">
                    <span className="truncate max-w-[60%]">{p.tema}</span>
                    <span className="text-[#64748b]">{labMap[p.laboratorioId] ?? "Lab"}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
