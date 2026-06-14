"use client"

import { useState } from "react"
import { usuariosMock } from "@/lib/mock/users"
import { carrerasMock } from "@/lib/mock/carreras"
import { materiasMock } from "@/lib/mock/materias"
import { informesDocenciaMock } from "@/lib/mock/docencia"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Mail, Phone, BookOpen, FileText } from "lucide-react"

export default function CoordinacionDocentesPage() {
  const [search, setSearch] = useState("")
  const [carreraFilter, setCarreraFilter] = useState("todos")

  const docentes = usuariosMock.filter((u) => u.rol === "PROFESOR")

  const filtered = docentes.filter((d) => {
    const matchSearch = `${d.nombres} ${d.apellidos} ${d.correo}`.toLowerCase().includes(search.toLowerCase())
    const matchCarrera = carreraFilter === "todos" || String(d.carreraId) === carreraFilter
    return matchSearch && matchCarrera
  })

  const carreraMap = Object.fromEntries(carrerasMock.map((c) => [c.id, c]))

  const getMateriasDocente = (nombre: string) =>
    materiasMock.filter((m) => m.docente === `${nombre.split(" ")[0]} ${nombre.split(" ")[1] ?? ""}`.trim() ||
      m.docente.toLowerCase().includes(nombre.split(" ")[0].toLowerCase()))

  const getInformesDocente = (nombre: string) =>
    informesDocenciaMock.filter((i) => i.docente.toLowerCase().includes(nombre.split(" ")[0].toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Docentes</h1>
        <p className="text-[#64748b] mt-1">Personal docente activo en la carrera</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {carrerasMock.map((c) => (
          <Card key={c.id} className="border-[#e2e8f0]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[#0f172a]">
                {docentes.filter((d) => d.carreraId === c.id).length}
              </p>
              <p className="text-xs text-[#64748b] mt-0.5">{c.siglas}</p>
            </CardContent>
          </Card>
        ))}
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a6b3c]">{docentes.length}</p>
            <p className="text-xs text-[#64748b] mt-0.5">Total</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#e2e8f0]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0f172a]">
            <Users className="w-4 h-4 text-[#1a6b3c]" />
            Personal docente ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <Input placeholder="Buscar docente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-[#e2e8f0]" />
            </div>
            <Select value={carreraFilter} onValueChange={setCarreraFilter}>
              <SelectTrigger className="w-full sm:w-52 border-[#e2e8f0]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las carreras</SelectItem>
                {carrerasMock.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.siglas}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => {
              const carrera = d.carreraId ? carreraMap[d.carreraId] : undefined
              const materias = getMateriasDocente(`${d.nombres} ${d.apellidos}`)
              const informes = getInformesDocente(`${d.nombres} ${d.apellidos}`)
              const pendientes = informes.filter((i) => i.estado === "pendiente").length
              return (
                <div key={d.id} className="border border-[#e2e8f0] rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a6b3c]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#1a6b3c] text-sm font-bold">
                        {d.nombres.charAt(0)}{d.apellidos.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0f172a] truncate">{d.nombres} {d.apellidos}</p>
                      {carrera && (
                        <Badge className="text-xs border-0 bg-[#e8f5ee] text-[#1a6b3c] mt-0.5">{carrera.siglas}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-[#64748b]">
                    <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /><span className="truncate">{d.correo}</span></div>
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /><span>{d.telefono}</span></div>
                  </div>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-[#f1f5f9]">
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-1 text-[#1a6b3c]">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold">{materias.length}</span>
                      </div>
                      <p className="text-xs text-[#94a3b8]">Materias</p>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-1 text-[#3b82f6]">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold">{informes.length}</span>
                      </div>
                      <p className="text-xs text-[#94a3b8]">Informes</p>
                    </div>
                    {pendientes > 0 && (
                      <div className="flex-1 text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-600">
                          <span className="text-sm font-bold">{pendientes}</span>
                        </div>
                        <p className="text-xs text-[#94a3b8]">Pendientes</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-[#94a3b8]">No se encontraron docentes.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
