"use client"

import { useState, useEffect } from "react"
import { JustificacionService, EstudianteService, FaltaService } from "@/lib/services"
import type { Justificacion, Estudiante, Falta } from "@/lib/types/database"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Search, CheckCircle2, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

const ESTADO_COLOR: Record<Justificacion["estado"], string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobado: "bg-[#e8f5ee] text-[#1a6b3c]",
  rechazado: "bg-red-100 text-red-700",
}

const motivos = [
  "Cita medica programada",
  "Calamidad domestica familiar",
  "Participacion en evento academico",
  "Problema de transporte",
  "Enfermedad con certificado medico",
]

const empty: Omit<Justificacion, "id"> = { estudianteId: 1, faltaId: 1, motivo: motivos[0], fecha: "", estado: "pendiente" }

export default function JustificacionesPage() {
  const [justificaciones, setJustificaciones] = useState<Justificacion[]>([])
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [faltas, setFaltas] = useState<Falta[]>([])
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Justificacion | null>(null)
  const [form, setForm] = useState<Omit<Justificacion, "id">>(empty)

  useEffect(() => {
    JustificacionService.getAll().then(setJustificaciones)
    EstudianteService.getAll().then(setEstudiantes)
    FaltaService.getAll().then(setFaltas)
  }, [])

  const getEstudiante = (id: number) => estudiantes.find((e) => e.id === id)

  const filtered = justificaciones
    .filter((j) => {
      const est = getEstudiante(j.estudianteId)
      return `${est?.nombres} ${est?.apellidos} ${j.motivo}`.toLowerCase().includes(search.toLowerCase())
    })
    .filter((j) => filterEstado === "all" || j.estado === filterEstado)

  const pendientes = justificaciones.filter((j) => j.estado === "pendiente").length

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (j: Justificacion) => {
    setEditing(j)
    setForm({ estudianteId: j.estudianteId, faltaId: j.faltaId, motivo: j.motivo, fecha: j.fecha, estado: j.estado })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.fecha || !form.motivo) { toast.error("Complete los campos obligatorios"); return }
    if (editing) {
      const updated = await JustificacionService.update(editing.id, form)
      if (updated) { setJustificaciones((prev) => prev.map((x) => x.id === editing.id ? updated : x)); toast.success("Justificacion actualizada") }
    } else {
      const created = await JustificacionService.create(form)
      setJustificaciones((prev) => [created, ...prev]); toast.success("Justificacion registrada")
    }
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    await JustificacionService.delete(id)
    setJustificaciones((prev) => prev.filter((x) => x.id !== id))
    toast.success("Justificacion eliminada")
  }

  const handleEstado = async (id: number, estado: Justificacion["estado"]) => {
    const updated = await JustificacionService.update(id, { estado })
    if (updated) {
      setJustificaciones((prev) => prev.map((x) => x.id === id ? updated : x))
      toast.success(`Justificacion ${estado}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Justificaciones</h1>
          <p className="text-[#64748b] mt-1">Solicitudes de justificacion de faltas</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1a6b3c] hover:bg-[#155730] text-white">
          <Plus className="w-4 h-4 mr-2" />Nueva justificacion
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-5 flex items-center gap-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div><p className="text-xs text-[#64748b]">Pendientes</p><p className="text-2xl font-bold text-[#0f172a]">{pendientes}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-5 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
            <div><p className="text-xs text-[#64748b]">Aprobadas</p><p className="text-2xl font-bold text-[#0f172a]">{justificaciones.filter((j) => j.estado === "aprobado").length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-5 flex items-center gap-4">
            <XCircle className="w-8 h-8 text-red-500" />
            <div><p className="text-xs text-[#64748b]">Rechazadas</p><p className="text-2xl font-bold text-[#0f172a]">{justificaciones.filter((j) => j.estado === "rechazado").length}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#e2e8f0]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <Input placeholder="Buscar estudiante o motivo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((j) => {
                const est = getEstudiante(j.estudianteId)
                return (
                  <TableRow key={j.id}>
                    <TableCell className="font-medium">{est ? `${est.nombres} ${est.apellidos}` : `Est. ${j.estudianteId}`}</TableCell>
                    <TableCell className="text-sm text-[#64748b] max-w-[200px] truncate">{j.motivo}</TableCell>
                    <TableCell className="text-sm">{j.fecha}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_COLOR[j.estado]}`}>{j.estado}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {j.estado === "pendiente" && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEstado(j.id, "aprobado")} className="text-[#1a6b3c] hover:bg-[#e8f5ee]"><CheckCircle2 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEstado(j.id, "rechazado")} className="text-red-500 hover:bg-red-50"><XCircle className="w-4 h-4" /></Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(j)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(j.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar justificacion" : "Nueva justificacion"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Estudiante</Label>
              <Select value={String(form.estudianteId)} onValueChange={(v) => setForm({ ...form, estudianteId: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{estudiantes.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.nombres} {e.apellidos}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Falta asociada</Label>
                <Select value={String(form.faltaId)} onValueChange={(v) => setForm({ ...form, faltaId: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{faltas.map((f) => <SelectItem key={f.id} value={String(f.id)}>Falta #{f.id} - {f.fecha}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha *</Label>
                <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Motivo *</Label>
              <Textarea value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as Justificacion["estado"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-[#1a6b3c] hover:bg-[#155730] text-white">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
