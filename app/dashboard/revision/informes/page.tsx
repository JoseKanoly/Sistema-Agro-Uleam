"use client"

import { useState } from "react"
import { informesDocenciaMock } from "@/lib/mock/docencia"
import { materiasMock } from "@/lib/mock/materias"
import { periodosMock } from "@/lib/mock/periodos"
import type { InformeDocencia } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, CheckCircle2, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

type Estado = InformeDocencia["estado"]

const ESTADO_STYLES: Record<Estado, string> = {
  pendiente: "bg-amber-50 text-amber-700",
  aprobado: "bg-[#E0EEEF] text-[#3C6E71]",
  rechazado: "bg-red-50 text-red-700",
}

export default function RevisionInformesPage() {
  const asignaturaOnly = informesDocenciaMock.filter((i) => i.tipo === "asignatura")
  const [items, setItems] = useState(asignaturaOnly)
  const [search, setSearch] = useState("")
  const [filtro, setFiltro] = useState("todos")

  const materiaMap = Object.fromEntries(materiasMock.map((m) => [m.id, m]))
  const periodoMap = Object.fromEntries(periodosMock.map((p) => [p.id, p]))

  const filtered = items.filter((i) => {
    const materia = materiaMap[i.materiaId]
    const matchSearch = [i.docente, materia?.nombre ?? ""].join(" ").toLowerCase().includes(search.toLowerCase())
    const matchFiltro = filtro === "todos" || i.estado === filtro
    return matchSearch && matchFiltro
  })

  const cambiarEstado = (id: number, estado: Estado) => {
    setItems((p) => p.map((i) => i.id === id ? { ...i, estado } : i))
    toast.success(`Informe ${estado}`)
  }

  const pendientes = items.filter((i) => i.estado === "pendiente").length
  const aprobados = items.filter((i) => i.estado === "aprobado").length
  const rechazados = items.filter((i) => i.estado === "rechazado").length

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Revision de Informes</h1>
        <p className="text-[#6B7280] mt-1">Informes de asignatura entregados por los docentes</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pendientes", value: pendientes, icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Aprobados", value: aprobados, icon: CheckCircle2, color: "text-[#3C6E71]", bg: "bg-[#E0EEEF]" },
          { label: "Rechazados", value: rechazados, icon: XCircle, color: "text-red-700", bg: "bg-red-50" },
        ].map((s) => (
          <Card key={s.label} className="border-[#D9D9D9]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#353535]">{s.value}</p>
                <p className="text-xs text-[#6B7280]">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#353535]">
            <FileText className="w-4 h-4 text-[#3C6E71]" />
            Informes de asignatura ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input placeholder="Buscar por docente o materia..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-[#D9D9D9]" />
            </div>
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger className="w-full sm:w-44 border-[#D9D9D9]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="divide-y divide-[#F5F5F5]">
            {filtered.map((i) => {
              const materia = materiaMap[i.materiaId]
              const periodo = periodoMap[i.periodoId]
              return (
                <div key={i.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#3C6E71]/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-[#3C6E71]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#353535] truncate">{materia?.nombre ?? `Materia #${i.materiaId}`}</p>
                      <p className="text-xs text-[#6B7280]">{i.docente} · {periodo?.nombre}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-[#9CA3AF]">{i.fechaEntrega}</span>
                    <Badge className={`text-xs border-0 ${ESTADO_STYLES[i.estado]}`}>{i.estado}</Badge>
                    {i.estado === "pendiente" && (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => cambiarEstado(i.id, "aprobado")} className="h-7 text-xs bg-[#3C6E71] hover:bg-[#2F5A5C] text-white px-2">
                          <CheckCircle2 className="w-3 h-3 mr-1" />Aprobar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => cambiarEstado(i.id, "rechazado")} className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 px-2">
                          <XCircle className="w-3 h-3 mr-1" />Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-[#9CA3AF]">No se encontraron informes.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
