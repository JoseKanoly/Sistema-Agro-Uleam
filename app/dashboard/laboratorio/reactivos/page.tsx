import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { reactivos, laboratorios } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestTube, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  disponible: { label: "Disponible", variant: "default" },
  bajo_stock: { label: "Bajo Stock", variant: "secondary" },
  agotado: { label: "Agotado", variant: "destructive" },
}

export default async function ReactivosPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const [total, disponibles, bajoStock, agotados] = await Promise.all([
    db.select({ c: count() }).from(reactivos),
    db.select({ c: count() }).from(reactivos).where(eq(reactivos.estado, "disponible")),
    db.select({ c: count() }).from(reactivos).where(eq(reactivos.estado, "bajo_stock")),
    db.select({ c: count() }).from(reactivos).where(eq(reactivos.estado, "agotado")),
  ])

  const rows = await db.select().from(reactivos).limit(60)
  const labsList = await db.select().from(laboratorios)
  const labMap = Object.fromEntries(labsList.map((l) => [l.id, l.nombre]))

  const n = (r: { c: number }[]) => r[0]?.c ?? 0

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Reactivos de Laboratorio</h1>
        <p className="text-[#64748b] mt-1">Inventario de reactivos quimicos y biologicos</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Reactivos", value: n(total), icon: TestTube, color: "#1a6b3c" },
          { label: "Disponibles", value: n(disponibles), icon: CheckCircle, color: "#22c55e" },
          { label: "Bajo Stock", value: n(bajoStock), icon: AlertTriangle, color: "#f59e0b" },
          { label: "Agotados", value: n(agotados), icon: XCircle, color: "#ef4444" },
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
          <CardTitle className="text-[#0f172a]">Inventario de Reactivos</CardTitle>
          <CardDescription>Stock actual de reactivos por laboratorio</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-[#64748b] text-sm py-8 text-center">No hay reactivos registrados aun.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left py-3 px-3 text-[#64748b] font-medium">Nombre</th>
                    <th className="text-left py-3 px-3 text-[#64748b] font-medium">Formula</th>
                    <th className="text-left py-3 px-3 text-[#64748b] font-medium">Laboratorio</th>
                    <th className="text-left py-3 px-3 text-[#64748b] font-medium">Cantidad</th>
                    <th className="text-left py-3 px-3 text-[#64748b] font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const cfg = estadoConfig[r.estado] ?? estadoConfig.disponible
                    return (
                      <tr key={r.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                        <td className="py-3 px-3 font-medium text-[#0f172a]">{r.nombre}</td>
                        <td className="py-3 px-3 font-mono text-xs text-[#64748b]">{r.formula ?? "—"}</td>
                        <td className="py-3 px-3 text-[#475569]">{labMap[r.laboratorioId] ?? `Lab #${r.laboratorioId}`}</td>
                        <td className="py-3 px-3 text-[#475569]">{r.cantidad} {r.unidad}</td>
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
