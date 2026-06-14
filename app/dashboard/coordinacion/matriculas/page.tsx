"use client"

import { useState } from "react"
import { matriculasMock } from "@/lib/mock/academico"
import { estudiantesMock } from "@/lib/mock/estudiantes"
import { materiasMock } from "@/lib/mock/materias"
import { periodosMock } from "@/lib/mock/periodos"
import { carrerasMock } from "@/lib/mock/carreras"
import type { Matricula } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, Search } from "lucide-react"

type EstadoMat = Matricula["estado"]

const ESTADO_STYLES: Record<EstadoMat, string> = {
  matriculado: "bg-blue-50 text-blue-700",
  aprobado: "bg-[#e8f5ee] text-[#1a6b3c]",
  reprobado: "bg-red-50 text-red-700",
  retirado: "bg-gray-100 text-gray-600",
}

export default function CoordinacionMatriculasPage() {
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [periodoFilter, setPeriodoFilter] = useState("todos")

  const estudianteMap = Object.fromEntries(estudiantesMock.map((e) => [e.id, e]))
  const materiaMap = Object.fromEntries(materiasMock.map((m) => [m.id, m]))
  const carreraMap = Object.fromEntries(carrerasMock.map((c) => [c.id, c]))

  const filtered = matriculasMock.filter((m) => {
    const est = estudianteMap[m.estudianteId]
    const mat = materiaMap[m.materiaId]
    const matchSearch = [
      est ? `${est.nombres} ${est.apellidos}` : "",
      mat?.nombre ?? "",
      mat?.codigo ?? "",
    ].join(" ").toLowerCase().includes(search.toLowerCase())
    const matchEstado = estadoFilter === "todos" || m.estado === estadoFilter
    const matchPeriodo = periodoFilter === "todos" || String(m.periodoId) === periodoFilter
    return matchSearch && matchEstado && matchPeriodo
  })

  const stats = {
    matriculado: matriculasMock.filter((m) => m.estado === "matriculado").length,
    aprobado: matriculasMock.filter((m) => m.estado === "aprobado").length,
    reprobado: matriculasMock.filter((m) => m.estado === "reprobado").length,
    retirado: matriculasMock.filter((m) => m.estado === "retirado").length,
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Matriculas</h1>
        <p className="text-[#64748b] mt-1">Registro de matriculas por estudiante, materia y periodo</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Matriculados", value: stats.matriculado, color: "text-blue-700" },
          { label: "Aprobados", value: stats.aprobado, color: "text-[#1a6b3c]" },
          { label: "Reprobados", value: stats.reprobado, color: "text-red-700" },
          { label: "Retirados", value: stats.retirado, color: "text-gray-600" },
        ].map((s) => (
          <Card key={s.label} className="border-[#e2e8f0]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[#0f172a]">{s.value}</p>
              <p className={`text-xs font-medium mt-0.5 ${s.color}`}>{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#e2e8f0]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0f172a]">
            <ClipboardList className="w-4 h-4 text-[#1a6b3c]" />
            Matriculas ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <Input placeholder="Buscar por estudiante o materia..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-[#e2e8f0]" />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full sm:w-44 border-[#e2e8f0]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="matriculado">Matriculado</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="reprobado">Reprobado</SelectItem>
                <SelectItem value="retirado">Retirado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
              <SelectTrigger className="w-full sm:w-52 border-[#e2e8f0]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los periodos</SelectItem>
                {periodosMock.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="divide-y divide-[#f1f5f9]">
            {filtered.map((m) => {
              const est = estudianteMap[m.estudianteId]
              const mat = materiaMap[m.materiaId]
              const carrera = mat ? carreraMap[mat.carreraId] : undefined
              const notaColor = m.nota >= 7 ? "text-[#1a6b3c]" : m.nota >= 5 ? "text-amber-700" : "text-red-600"
              return (
                <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#1a6b3c]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#1a6b3c] text-xs font-bold">
                        {est ? est.nombres.charAt(0) + est.apellidos.charAt(0) : "?"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0f172a] truncate">
                        {est ? `${est.nombres} ${est.apellidos}` : `Estudiante #${m.estudianteId}`}
                      </p>
                      <p className="text-xs text-[#64748b] truncate">
                        {mat?.nombre ?? `Materia #${m.materiaId}`} · {mat?.codigo} · {carrera?.siglas}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${notaColor}`}>{m.nota}</p>
                      <p className="text-xs text-[#94a3b8]">Nota</p>
                    </div>
                    <Badge className={`text-xs border-0 ${ESTADO_STYLES[m.estado]}`}>{m.estado}</Badge>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-[#94a3b8]">No se encontraron matriculas.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
