"use client"

import { useState } from "react"
import { estudiantesMock } from "@/lib/mock/estudiantes"
import { carrerasMock } from "@/lib/mock/carreras"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Search, TrendingUp } from "lucide-react"

const ESTADO_STYLES: Record<string, string> = {
  activo: "bg-[#E0EEEF] text-[#3C6E71]",
  egresado: "bg-blue-50 text-blue-700",
  retirado: "bg-red-50 text-red-700",
}

export default function CoordinacionEstudiantesPage() {
  const [search, setSearch] = useState("")
  const [carreraFilter, setCarreraFilter] = useState("todos")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [nivelFilter, setNivelFilter] = useState("todos")

  const filtered = estudiantesMock.filter((e) => {
    const matchSearch = `${e.nombres} ${e.apellidos} ${e.cedula}`.toLowerCase().includes(search.toLowerCase())
    const matchCarrera = carreraFilter === "todos" || String(e.carreraId) === carreraFilter
    const matchEstado = estadoFilter === "todos" || e.estado === estadoFilter
    const matchNivel = nivelFilter === "todos" || String(e.nivel) === nivelFilter
    return matchSearch && matchCarrera && matchEstado && matchNivel
  })

  const carreraMap = Object.fromEntries(carrerasMock.map((c) => [c.id, c]))
  const niveles = [...new Set(estudiantesMock.map((e) => e.nivel))].sort((a, b) => a - b)

  const promedioFiltrado = filtered.length > 0
    ? (filtered.reduce((acc, e) => acc + e.promedio, 0) / filtered.length).toFixed(2)
    : "0.00"

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Estudiantes</h1>
        <p className="text-[#6B7280] mt-1">Registro completo de estudiantes por carrera y nivel</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#353535]">{estudiantesMock.filter((e) => e.estado === "activo").length}</p>
            <p className="text-xs text-[#3C6E71] font-medium mt-0.5">Activos</p>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#353535]">{estudiantesMock.filter((e) => e.estado === "egresado").length}</p>
            <p className="text-xs text-blue-700 font-medium mt-0.5">Egresados</p>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#353535]">{estudiantesMock.filter((e) => e.estado === "retirado").length}</p>
            <p className="text-xs text-red-700 font-medium mt-0.5">Retirados</p>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-4 text-center flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#3C6E71]" />
            <div>
              <p className="text-2xl font-bold text-[#353535]">{promedioFiltrado}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#353535]">
            <GraduationCap className="w-4 h-4 text-[#3C6E71]" />
            Estudiantes ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input placeholder="Buscar por nombre o cedula..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-[#D9D9D9]" />
            </div>
            <Select value={carreraFilter} onValueChange={setCarreraFilter}>
              <SelectTrigger className="w-full sm:w-44 border-[#D9D9D9]"><SelectValue placeholder="Carrera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las carreras</SelectItem>
                {carrerasMock.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.siglas}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full sm:w-36 border-[#D9D9D9]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="egresado">Egresado</SelectItem>
                <SelectItem value="retirado">Retirado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={nivelFilter} onValueChange={setNivelFilter}>
              <SelectTrigger className="w-full sm:w-32 border-[#D9D9D9]"><SelectValue placeholder="Nivel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los niveles</SelectItem>
                {niveles.map((n) => <SelectItem key={n} value={String(n)}>Nivel {n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="divide-y divide-[#F5F5F5]">
            {filtered.map((e) => {
              const carrera = carreraMap[e.carreraId]
              const promedioColor = e.promedio >= 8 ? "text-[#3C6E71]" : e.promedio >= 7 ? "text-[#353535]" : "text-red-600"
              return (
                <div key={e.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#3C6E71]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#3C6E71] text-sm font-bold">
                        {e.nombres.charAt(0)}{e.apellidos.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#353535] truncate">{e.nombres} {e.apellidos}</p>
                      <p className="text-xs text-[#6B7280]">CI: {e.cedula} · {carrera?.siglas} · Nivel {e.nivel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[50px]">
                      <p className={`text-lg font-bold ${promedioColor}`}>{e.promedio}</p>
                      <p className="text-xs text-[#9CA3AF]">Prom.</p>
                    </div>
                    <Badge className={`text-xs border-0 ${ESTADO_STYLES[e.estado]}`}>{e.estado}</Badge>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-[#9CA3AF]">No se encontraron estudiantes.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
