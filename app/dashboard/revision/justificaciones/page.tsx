"use client"

import { useState } from "react"
import { justificacionesMock } from "@/lib/mock/academico"
import { faltasMock } from "@/lib/mock/academico"
import { estudiantesMock } from "@/lib/mock/estudiantes"
import { materiasMock } from "@/lib/mock/materias"
import type { Justificacion } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Search, CheckCircle2, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

type Estado = Justificacion["estado"]

const ESTADO_STYLES: Record<Estado, { badge: string }> = {
  pendiente: { badge: "bg-amber-50 text-amber-700" },
  aprobado: { badge: "bg-[#E0EEEF] text-[#3C6E71]" },
  rechazado: { badge: "bg-red-50 text-red-700" },
}

export default function RevisionJustificacionesPage() {
  const [items, setItems] = useState<Justificacion[]>(justificacionesMock)
  const [search, setSearch] = useState("")
  const [filtro, setFiltro] = useState("todos")

  const estudianteMap = Object.fromEntries(estudiantesMock.map((e) => [e.id, e]))
  const faltaMap = Object.fromEntries(faltasMock.map((f) => [f.id, f]))
  const materiaMap = Object.fromEntries(materiasMock.map((m) => [m.id, m]))

  const filtered = items.filter((j) => {
    const est = estudianteMap[j.estudianteId]
    const matchSearch = est
      ? `${est.nombres} ${est.apellidos} ${j.motivo}`.toLowerCase().includes(search.toLowerCase())
      : false
    const matchFiltro = filtro === "todos" || j.estado === filtro
    return matchSearch && matchFiltro
  })

  const cambiarEstado = (id: number, estado: Estado) => {
    setItems((p) => p.map((j) => j.id === id ? { ...j, estado } : j))
    toast.success(`Justificacion ${estado}`)
  }

  const pendientes = items.filter((j) => j.estado === "pendiente").length
  const aprobadas = items.filter((j) => j.estado === "aprobado").length
  const rechazadas = items.filter((j) => j.estado === "rechazado").length

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Revision de Justificaciones</h1>
        <p className="text-[#6B7280] mt-1">Solicitudes de justificacion de faltas presentadas por estudiantes</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pendientes", value: pendientes, icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Aprobadas", value: aprobadas, icon: CheckCircle2, color: "text-[#3C6E71]", bg: "bg-[#E0EEEF]" },
          { label: "Rechazadas", value: rechazadas, icon: XCircle, color: "text-red-700", bg: "bg-red-50" },
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
            <AlertCircle className="w-4 h-4 text-[#3C6E71]" />
            Solicitudes ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input placeholder="Buscar por estudiante o motivo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-[#D9D9D9]" />
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
            {filtered.map((j) => {
              const est = estudianteMap[j.estudianteId]
              const falta = faltaMap[j.faltaId]
              const materia = falta ? materiaMap[falta.materiaId] : undefined
              const { badge } = ESTADO_STYLES[j.estado]
              return (
                <div key={j.id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#353535]">
                          {est ? `${est.nombres} ${est.apellidos}` : `Estudiante #${j.estudianteId}`}
                        </p>
                        {materia && <p className="text-xs text-[#6B7280]">{materia.nombre} — {falta?.fecha}</p>}
                      </div>
                    </div>
                    <Badge className={`text-xs border-0 ${badge}`}>{j.estado}</Badge>
                  </div>
                  <p className="text-sm text-[#475569] bg-[#F5F5F5] rounded-lg px-3 py-2 ml-11">{j.motivo}</p>
                  {j.estado === "pendiente" && (
                    <div className="flex gap-2 ml-11">
                      <Button size="sm" onClick={() => cambiarEstado(j.id, "aprobado")} className="h-7 text-xs bg-[#3C6E71] hover:bg-[#2F5A5C] text-white px-3">
                        <CheckCircle2 className="w-3 h-3 mr-1" />Aprobar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => cambiarEstado(j.id, "rechazado")} className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 px-3">
                        <XCircle className="w-3 h-3 mr-1" />Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-[#9CA3AF]">No se encontraron justificaciones.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
