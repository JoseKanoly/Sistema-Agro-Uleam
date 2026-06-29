"use client"

import { useState, useEffect } from "react"
import { DocenciaService } from "@/lib/services"
import { materiasMock } from "@/lib/mock/materias"
import { periodosMock } from "@/lib/mock/periodos"
import type { InformeDocencia } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, FileText, Clock, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

const ESTADO_COLOR: Record<InformeDocencia["estado"], string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobado: "bg-[#E0EEEF] text-[#3C6E71]",
  rechazado: "bg-red-100 text-red-700",
}

const empty: Omit<InformeDocencia, "id"> = {
  docente: "",
  materiaId: 1,
  periodoId: 1,
  tipo: "asignatura",
  fechaEntrega: "",
  estado: "pendiente",
}

export default function InformesDocentePage() {
  const [informes, setInformes] = useState<InformeDocencia[]>([])
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<InformeDocencia | null>(null)
  const [form, setForm] = useState<Omit<InformeDocencia, "id">>(empty)

  useEffect(() => { DocenciaService.getAll().then(setInformes) }, [])

  const filtered = informes
    .filter((i) => `${i.docente}`.toLowerCase().includes(search.toLowerCase()))
    .filter((i) => filterEstado === "all" || i.estado === filterEstado)

  const pendientes = informes.filter((i) => i.estado === "pendiente").length
  const aprobados = informes.filter((i) => i.estado === "aprobado").length
  const rechazados = informes.filter((i) => i.estado === "rechazado").length

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (i: InformeDocencia) => {
    setEditing(i)
    setForm({ docente: i.docente, materiaId: i.materiaId, periodoId: i.periodoId, tipo: i.tipo, fechaEntrega: i.fechaEntrega, estado: i.estado })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.docente || !form.fechaEntrega) { toast.error("Complete los campos obligatorios"); return }
    if (editing) {
      const updated = await DocenciaService.update(editing.id, form)
      if (updated) { setInformes((prev) => prev.map((x) => x.id === editing.id ? updated : x)); toast.success("Informe actualizado") }
    } else {
      const created = await DocenciaService.create(form)
      setInformes((prev) => [created, ...prev]); toast.success("Informe registrado")
    }
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    await DocenciaService.delete(id)
    setInformes((prev) => prev.filter((x) => x.id !== id))
    toast.success("Informe eliminado")
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Mis Informes de Asignatura</h1>
          <p className="text-[#6B7280] mt-1">Gestion de informes docentes por asignatura</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">
          <Plus className="w-4 h-4 mr-2" />Nuevo informe
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-xs text-[#6B7280]">Pendientes</p>
              <p className="text-2xl font-bold text-[#353535]">{pendientes}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-[#72c184]" />
            <div>
              <p className="text-xs text-[#6B7280]">Aprobados</p>
              <p className="text-2xl font-bold text-[#353535]">{aprobados}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-xs text-[#6B7280]">Rechazados</p>
              <p className="text-2xl font-bold text-[#353535]">{rechazados}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input placeholder="Buscar docente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
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
                <TableHead>Docente</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha entrega</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[#6B7280] py-8">
                    No se encontraron informes.
                  </TableCell>
                </TableRow>
              ) : filtered.map((inf) => (
                <TableRow key={inf.id}>
                  <TableCell className="font-medium">{inf.docente}</TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {materiasMock.find((m) => m.id === inf.materiaId)?.nombre ?? `Materia ${inf.materiaId}`}
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {periodosMock.find((p) => p.id === inf.periodoId)?.nombre ?? `Periodo ${inf.periodoId}`}
                  </TableCell>
                  <TableCell className="text-sm capitalize">{inf.tipo}</TableCell>
                  <TableCell className="text-sm">{inf.fechaEntrega}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_COLOR[inf.estado]}`}>
                      {inf.estado}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(inf)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(inf.id)} className="text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar informe" : "Nuevo informe de asignatura"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Docente *</Label>
              <Input value={form.docente} onChange={(e) => setForm({ ...form, docente: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Materia</Label>
              <Select value={String(form.materiaId)} onValueChange={(v) => setForm({ ...form, materiaId: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {materiasMock.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Periodo</Label>
              <Select value={String(form.periodoId)} onValueChange={(v) => setForm({ ...form, periodoId: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {periodosMock.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as InformeDocencia["tipo"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asignatura">Asignatura</SelectItem>
                  <SelectItem value="silabo">Silabo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fecha entrega *</Label>
              <Input type="date" value={form.fechaEntrega} onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as InformeDocencia["estado"] })}>
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
            <Button onClick={handleSave} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
