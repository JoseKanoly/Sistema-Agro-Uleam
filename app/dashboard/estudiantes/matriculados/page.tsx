"use client"

import { useState, useEffect } from "react"
import { MatriculaService, EstudianteService } from "@/lib/services"
import { materiasMock } from "@/lib/mock/materias"
import { periodosMock } from "@/lib/mock/periodos"
import type { Matricula, Estudiante } from "@/lib/types/database"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { toast } from "sonner"

const ESTADO_COLOR: Record<Matricula["estado"], string> = {
  matriculado: "bg-blue-100 text-blue-700",
  aprobado: "bg-[#E0EEEF] text-[#3C6E71]",
  reprobado: "bg-red-100 text-red-700",
  retirado: "bg-gray-100 text-gray-600",
}

const empty: Omit<Matricula, "id"> = { estudianteId: 1, materiaId: 1, periodoId: 1, estado: "matriculado", nota: 0 }

export default function MatriculadosPage() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Matricula | null>(null)
  const [form, setForm] = useState<Omit<Matricula, "id">>(empty)

  useEffect(() => {
    MatriculaService.getAll().then(setMatriculas)
    EstudianteService.getAll().then(setEstudiantes)
  }, [])

  const getEstudiante = (id: number) => estudiantes.find((e) => e.id === id)

  const filtered = matriculas.filter((m) => {
    const est = getEstudiante(m.estudianteId)
    const materia = materiasMock.find((x) => x.id === m.materiaId)
    return `${est?.nombres} ${est?.apellidos} ${materia?.nombre}`.toLowerCase().includes(search.toLowerCase())
  })

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (m: Matricula) => { setEditing(m); setForm({ estudianteId: m.estudianteId, materiaId: m.materiaId, periodoId: m.periodoId, estado: m.estado, nota: m.nota }); setOpen(true) }

  const handleSave = async () => {
    if (editing) {
      const updated = await MatriculaService.update(editing.id, form)
      if (updated) { setMatriculas((prev) => prev.map((x) => x.id === editing.id ? updated : x)); toast.success("Matricula actualizada") }
    } else {
      const created = await MatriculaService.create(form)
      setMatriculas((prev) => [created, ...prev]); toast.success("Matricula registrada")
    }
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    await MatriculaService.delete(id)
    setMatriculas((prev) => prev.filter((x) => x.id !== id))
    toast.success("Matricula eliminada")
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Matriculados</h1>
          <p className="text-[#6B7280] mt-1">Registro de matriculas por materia y periodo</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">
          <Plus className="w-4 h-4 mr-2" />Nueva matricula
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {(["matriculado", "aprobado", "reprobado", "retirado"] as Matricula["estado"][]).map((estado) => (
          <Card key={estado} className="border-[#D9D9D9]">
            <CardContent className="p-4">
              <p className="text-xs text-[#6B7280] capitalize">{estado}</p>
              <p className="text-2xl font-bold text-[#353535]">{matriculas.filter((m) => m.estado === estado).length}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input placeholder="Buscar estudiante o materia..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const est = getEstudiante(m.estudianteId)
                const materia = materiasMock.find((x) => x.id === m.materiaId)
                const periodo = periodosMock.find((p) => p.id === m.periodoId)
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{est ? `${est.nombres} ${est.apellidos}` : `Est. ${m.estudianteId}`}</TableCell>
                    <TableCell className="text-sm text-[#6B7280]">{materia?.nombre ?? `Materia ${m.materiaId}`}</TableCell>
                    <TableCell className="text-sm text-[#6B7280]">{periodo?.nombre ?? `Periodo ${m.periodoId}`}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${m.nota >= 7 ? "text-[#3C6E71]" : "text-red-600"}`}>{m.nota}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_COLOR[m.estado]}`}>{m.estado}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Editar matricula" : "Nueva matricula"}</DialogTitle></DialogHeader>
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
              <Label>Periodo</Label>
              <Select value={String(form.periodoId)} onValueChange={(v) => setForm({ ...form, periodoId: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{periodosMock.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Nota</Label>
              <Input type="number" min={0} max={10} step={0.1} value={form.nota} onChange={(e) => setForm({ ...form, nota: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as Matricula["estado"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="matriculado">Matriculado</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="reprobado">Reprobado</SelectItem>
                  <SelectItem value="retirado">Retirado</SelectItem>
                </SelectContent>
              </Select>
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
