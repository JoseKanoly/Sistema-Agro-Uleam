"use client"

import { useState, useEffect } from "react"
import { FaltaService, EstudianteService } from "@/lib/services"
import { materiasMock } from "@/lib/mock/materias"
import type { Falta, Estudiante } from "@/lib/types/database"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Search, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"

const TIPO_COLOR: Record<Falta["tipo"], string> = {
  injustificada: "bg-red-100 text-red-700",
  justificada: "bg-[#E0EEEF] text-[#3C6E71]",
  atraso: "bg-yellow-100 text-yellow-700",
}

const empty: Omit<Falta, "id"> = { estudianteId: 1, materiaId: 1, fecha: "", tipo: "injustificada", observacion: "" }

export default function FaltasPage() {
  const [faltas, setFaltas] = useState<Falta[]>([])
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [search, setSearch] = useState("")
  const [filterTipo, setFilterTipo] = useState("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Falta | null>(null)
  const [form, setForm] = useState<Omit<Falta, "id">>(empty)

  useEffect(() => {
    FaltaService.getAll().then(setFaltas)
    EstudianteService.getAll().then(setEstudiantes)
  }, [])

  const getEstudiante = (id: number) => estudiantes.find((e) => e.id === id)

  const filtered = faltas
    .filter((f) => {
      const est = getEstudiante(f.estudianteId)
      return `${est?.nombres} ${est?.apellidos}`.toLowerCase().includes(search.toLowerCase())
    })
    .filter((f) => filterTipo === "all" || f.tipo === filterTipo)

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (f: Falta) => { setEditing(f); setForm({ estudianteId: f.estudianteId, materiaId: f.materiaId, fecha: f.fecha, tipo: f.tipo, observacion: f.observacion }); setOpen(true) }

  const handleSave = async () => {
    if (!form.fecha) { toast.error("Ingrese la fecha"); return }
    if (editing) {
      const updated = await FaltaService.update(editing.id, form)
      if (updated) { setFaltas((prev) => prev.map((x) => x.id === editing.id ? updated : x)); toast.success("Falta actualizada") }
    } else {
      const created = await FaltaService.create(form)
      setFaltas((prev) => [created, ...prev]); toast.success("Falta registrada")
    }
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    await FaltaService.delete(id)
    setFaltas((prev) => prev.filter((x) => x.id !== id))
    toast.success("Falta eliminada")
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Faltas</h1>
          <p className="text-[#6B7280] mt-1">Registro de asistencia y faltas</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">
          <Plus className="w-4 h-4 mr-2" />Registrar falta
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div><p className="text-xs text-[#6B7280]">Injustificadas</p><p className="text-2xl font-bold text-[#353535]">{faltas.filter((f) => f.tipo === "injustificada").length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-[#72c184]" />
            <div><p className="text-xs text-[#6B7280]">Justificadas</p><p className="text-2xl font-bold text-[#353535]">{faltas.filter((f) => f.tipo === "justificada").length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div><p className="text-xs text-[#6B7280]">Atrasos</p><p className="text-2xl font-bold text-[#353535]">{faltas.filter((f) => f.tipo === "atraso").length}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input placeholder="Buscar estudiante..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="injustificada">Injustificada</SelectItem>
                <SelectItem value="justificada">Justificada</SelectItem>
                <SelectItem value="atraso">Atraso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Observacion</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => {
                const est = getEstudiante(f.estudianteId)
                const materia = materiasMock.find((m) => m.id === f.materiaId)
                return (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{est ? `${est.nombres} ${est.apellidos}` : `Est. ${f.estudianteId}`}</TableCell>
                    <TableCell className="text-sm text-[#6B7280]">{materia?.nombre ?? `Materia ${f.materiaId}`}</TableCell>
                    <TableCell className="text-sm">{f.fecha}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TIPO_COLOR[f.tipo]}`}>{f.tipo}</span>
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280] max-w-[200px] truncate">{f.observacion}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(f)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Editar falta" : "Registrar falta"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Estudiante</Label>
              <Select value={String(form.estudianteId)} onValueChange={(v) => setForm({ ...form, estudianteId: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{estudiantes.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.nombres} {e.apellidos}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Materia</Label>
              <Select value={String(form.materiaId)} onValueChange={(v) => setForm({ ...form, materiaId: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{materiasMock.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fecha *</Label>
              <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as Falta["tipo"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="injustificada">Injustificada</SelectItem>
                  <SelectItem value="justificada">Justificada</SelectItem>
                  <SelectItem value="atraso">Atraso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Observacion</Label>
              <Textarea value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
