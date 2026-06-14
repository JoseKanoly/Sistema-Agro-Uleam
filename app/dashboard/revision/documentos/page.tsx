"use client"

import { useEffect, useState } from "react"
import { getArchivosPendientesRevision, revisarArchivo } from "@/app/actions/documentos"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react"
import { toast } from "sonner"

type ArchivoRow = Awaited<ReturnType<typeof getArchivosPendientesRevision>>[number]

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobado: "bg-[#e8f5ee] text-[#1a6b3c]",
  rechazado: "bg-red-100 text-red-700",
}

export default function RevisionDocumentosPage() {
  const [docs, setDocs] = useState<ArchivoRow[]>([])
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("all")

  const load = () => getArchivosPendientesRevision().then(setDocs)
  useEffect(() => { load() }, [])

  const filtered = docs
    .filter((d) => `${d.usuario.name} ${d.usuario.email} ${d.nombre}`.toLowerCase().includes(search.toLowerCase()))
    .filter((d) => filterEstado === "all" || d.estado === filterEstado)

  const pendientes = docs.filter((d) => d.estado === "pendiente").length
  const aprobados = docs.filter((d) => d.estado === "aprobado").length
  const rechazados = docs.filter((d) => d.estado === "rechazado").length

  const handleEstado = async (id: number, estado: "aprobado" | "rechazado") => {
    try {
      await revisarArchivo(id, estado)
      toast.success(`Documento ${estado}`)
      load()
    } catch {
      toast.error("No autorizado o error al revisar")
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Revisión de Documentos</h1>
        <p className="text-[#64748b] mt-1">Aprobación de archivos subidos por estudiantes y docentes</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-5 flex items-center gap-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div><p className="text-xs text-[#64748b]">Pendientes</p><p className="text-2xl font-bold">{pendientes}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-5 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
            <div><p className="text-xs text-[#64748b]">Aprobados</p><p className="text-2xl font-bold">{aprobados}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-5 flex items-center gap-4">
            <XCircle className="w-8 h-8 text-red-500" />
            <div><p className="text-xs text-[#64748b]">Rechazados</p><p className="text-2xl font-bold">{rechazados}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#e2e8f0]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <CardTitle className="text-[#0f172a]">Documentos</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <Input placeholder="Buscar..." className="pl-9 w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="aprobado">Aprobados</SelectItem>
                  <SelectItem value="rechazado">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Archivo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-[#64748b] py-8">Sin documentos</TableCell></TableRow>
              ) : filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{d.usuario.name}</p>
                    <p className="text-xs text-[#64748b]">{d.usuario.email}</p>
                  </TableCell>
                  <TableCell>{d.nombre}</TableCell>
                  <TableCell>{d.tipo}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADO_COLOR[d.estado] ?? ESTADO_COLOR.pendiente}`}>
                      {d.estado}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a href={d.archivoUrl} target="_blank" rel="noreferrer" className="text-[#1a6b3c] text-sm flex items-center gap-1">
                      Ver <ExternalLink className="w-3 h-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    {d.estado === "pendiente" && (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" className="bg-[#1a6b3c] h-8" onClick={() => handleEstado(d.id, "aprobado")}>Aprobar</Button>
                        <Button size="sm" variant="outline" className="h-8 text-red-600" onClick={() => handleEstado(d.id, "rechazado")}>Rechazar</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
