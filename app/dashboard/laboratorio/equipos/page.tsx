import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { equipos, laboratorios } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  operativo: { label: "Operativo", variant: "default" },
  mantenimiento: { label: "Mantenimiento", variant: "secondary" },
  dañado: { label: "Dañado", variant: "destructive" },
}

export default async function EquiposPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const [total, operativos, mantenimiento, dañados] = await Promise.all([
    db.select({ c: count() }).from(equipos),
    db.select({ c: count() }).from(equipos).where(eq(equipos.estado, "operativo")),
    db.select({ c: count() }).from(equipos).where(eq(equipos.estado, "mantenimiento")),
    db.select({ c: count() }).from(equipos).where(eq(equipos.estado, "dañado")),
  ])

  const rows = await db.select().from(equipos).limit(60)
  const labsList = await db.select().from(laboratorios)
  const labMap = Object.fromEntries(labsList.map((l) => [l.id, l.nombre]))

  const n = (r: { c: number }[]) => r[0]?.c ?? 0

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Equipos de Laboratorio</h1>
        <p className="text-[#6B7280] mt-1">Inventario y estado de equipos en todos los laboratorios</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Equipos", value: n(total), icon: Wrench, color: "#3C6E71" },
          { label: "Operativos", value: n(operativos), icon: CheckCircle, color: "#72c184" },
          { label: "Mantenimiento", value: n(mantenimiento), icon: AlertTriangle, color: "#D4A373" },
          { label: "Dañados", value: n(dañados), icon: XCircle, color: "#ef4444" },
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
          <CardTitle className="text-[#353535]">Inventario de Equipos</CardTitle>
          <CardDescription>Listado completo con estado actual</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-[#6B7280] text-sm py-8 text-center">No hay equipos registrados aun.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D9D9D9]">
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Codigo</th>
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Nombre</th>
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Laboratorio</th>
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Cantidad</th>
                    <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => {
                    const cfg = estadoConfig[e.estado] ?? estadoConfig.operativo
                    return (
                      <tr key={e.id} className="border-b border-[#F5F5F5] hover:bg-[#F5F5F5] transition-colors">
                        <td className="py-3 px-3 font-mono text-xs text-[#6B7280]">{e.codigo}</td>
                        <td className="py-3 px-3 font-medium text-[#353535]">{e.nombre}</td>
                        <td className="py-3 px-3 text-[#475569]">{labMap[e.laboratorioId] ?? `Lab #${e.laboratorioId}`}</td>
                        <td className="py-3 px-3 text-[#475569]">{e.cantidad}</td>
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
