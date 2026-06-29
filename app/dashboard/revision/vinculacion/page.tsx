"use client"

import { useState } from "react"
import { actividadesVinculacionMock } from "@/lib/mock/vinculacion"
import { lideresVinculacionMock } from "@/lib/mock/vinculacion"
import { empresasVinculacionMock } from "@/lib/mock/vinculacion"
import { carrerasMock } from "@/lib/mock/carreras"
import type { ActividadVinculacion } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Handshake, Search, CheckCircle2, XCircle, Clock, Users } from "lucide-react"
import { toast } from "sonner"

type Estado = ActividadVinculacion["estado"]

const ESTADO_STYLES: Record<Estado, string> = {
  programada: "bg-blue-50 text-blue-700",
  en_progreso: "bg-amber-50 text-amber-700",
  completado: "bg-[#E0EEEF] text-[#3C6E71]",
  cancelada: "bg-red-50 text-red-700",
}

export default function RevisionVinculacionPage() {
  const [items, setItems] = useState<ActividadVinculacion[]>(actividadesVinculacionMock)
  const [search, setSearch] = useState("")
  const [filtro, setFiltro] = useState("todos")

  const liderMap = Object.fromEntries(lideresVinculacionMock.map((l) => [l.id, l]))
  const empresaMap = Object.fromEntries(empresasVinculacionMock.map((e) => [e.id, e]))
  const carreraMap = Object.fromEntries(carrerasMock.map((c) => [c.id, c]))

  const filtered = items.filter((a) => {
    const lider = liderMap[a.liderId]
    const empresa = empresaMap[a.empresaId]
    const matchSearch = [a.nombre, lider ? `${lider.nombres} ${lider.apellidos}` : "", empresa?.nombre ?? ""]
      .join(" ").toLowerCase().includes(search.toLowerCase())
    const matchFiltro = filtro === "todos" || a.estado === filtro
    return matchSearch && matchFiltro
  })

  const cambiarEstado = (id: number, estado: Estado) => {
    setItems((p) => p.map((a) => a.id === id ? { ...a, estado } : a))
    toast.success(`Actividad marcada como ${estado}`)
  }

  const stats = {
    programadas: items.filter((a) => a.estado === "programada").length,
    en_progreso: items.filter((a) => a.estado === "en_progreso").length,
    completadas: items.filter((a) => a.estado === "completado").length,
    canceladas: items.filter((a) => a.estado === "cancelada").length,
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Revision de Vinculacion</h1>
        <p className="text-[#6B7280] mt-1">Actividades de vinculacion con la sociedad y empresas aliadas</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Programadas", value: stats.programadas, color: "text-blue-700" },
          { label: "En progreso", value: stats.en_progreso, color: "text-amber-700" },
          { label: "Completadas", value: stats.completadas, color: "text-[#3C6E71]" },
          { label: "Canceladas", value: stats.canceladas, color: "text-red-700" },
        ].map((s) => (
          <Card key={s.label} className="border-[#D9D9D9]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[#353535]">{s.value}</p>
              <p className={`text-xs font-medium mt-0.5 ${s.color}`}>{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#353535]">
            <Handshake className="w-4 h-4 text-[#3C6E71]" />
            Actividades ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input placeholder="Buscar por actividad, lider o empresa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-[#D9D9D9]" />
            </div>
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger className="w-full sm:w-44 border-[#D9D9D9]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="programada">Programada</SelectItem>
                <SelectItem value="en_progreso">En progreso</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="divide-y divide-[#F5F5F5]">
            {filtered.map((a) => {
              const lider = liderMap[a.liderId]
              const empresa = empresaMap[a.empresaId]
              const carrera = carreraMap[a.carreraId]
              return (
                <div key={a.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#3C6E71]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Handshake className="w-4 h-4 text-[#3C6E71]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#353535] truncate">{a.nombre}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {lider ? `${lider.nombres} ${lider.apellidos}` : "—"} · {empresa?.nombre ?? "—"} · {carrera?.siglas ?? "—"}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">{a.fechaInicio} — {a.fechaFin} · {a.beneficiarios} beneficiarios</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`text-xs border-0 ${ESTADO_STYLES[a.estado]}`}>{a.estado.replace("_", " ")}</Badge>
                    {a.estado === "en_progreso" && (
                      <Button size="sm" onClick={() => cambiarEstado(a.id, "completado")} className="h-7 text-xs bg-[#3C6E71] hover:bg-[#2F5A5C] text-white px-2">
                        <CheckCircle2 className="w-3 h-3 mr-1" />Completar
                      </Button>
                    )}
                    {a.estado === "programada" && (
                      <Button size="sm" variant="outline" onClick={() => cambiarEstado(a.id, "en_progreso")} className="h-7 text-xs px-2">
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-[#9CA3AF]">No se encontraron actividades.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
