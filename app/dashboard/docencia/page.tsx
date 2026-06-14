"use client"

import { useState, useEffect } from "react"
import { DocenciaService } from "@/lib/services"
import { carrerasMock } from "@/lib/mock/carreras"
import { materiasMock } from "@/lib/mock/materias"
import { periodosMock } from "@/lib/mock/periodos"
import type { InformeDocencia } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, FileText, CheckCircle2, Clock, XCircle } from "lucide-react"
import { toast } from "sonner"

const ESTADO_COLOR: Record<InformeDocencia["estado"], string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobado: "bg-[#e8f5ee] text-[#1a6b3c]",
  rechazado: "bg-red-100 text-red-700",
}

const empty: Omit<InformeDocencia, "id"> = { docente: "", materiaId: 1, periodoId: 1, tipo: "asignatura", fechaEntrega: "", estado: "pendiente" }

export default function DocenciaPage() {
  const [informes, setInformes] = useState<InformeDocencia[]>([])
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<InformeDocencia | null>(null)
  const [form, setForm] = useState<Omit<InformeDocencia, "id">>(empty)

  useEffect(() => { DocenciaService.getAll().then(setInformes) }, [])

  const filtered = informes
    .filter((i) => i.tipo === "asignatura")
    .filter((i) => `${i.docente}`.toLowerCase().includes(search.toLowerCase()))
    .filter((i) => filterEstado === "all" || i.estado === filterEstado)

  const pendientes = informes.filter((i) => i.tipo === "asignatura" && i.estado === "pendiente").length
  const aprobados = informes.filter((i) => i.tipo === "asignatura" && i.estado === "aprobado").length
  const rechazados = informes.filter((i) => i.tipo === "asignatura" && i.estado === "rechazado").length

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (i: InformeDocencia) => { setEditing(i); setForm({ docente: i.docente, materiaId: i.materiaId, periodoId: i.periodoId, tipo: i.tipo, fechaEntrega: i.fechaEntrega, estado: i.estado }); setOpen(true) }

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

  const handleEstado = async (id: number, estado: InformeDocencia["estado"]) => {
    const updated = await DocenciaService.update(id, { estado })
    if (updated) { setInformes((prev) => prev.map((x) => x.id === id ? updated : x)); toast.success(`Informe ${estado}`) }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Informes de Asignatura</h1>
          <p className="text-[#64748b] mt-1">Revision y gestion de informes docentes</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1a6b3c] hover:bg-[#155730] text-white">
          <Plus className="w-4 h-4 mr-2" />Nuevo informe
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
            <div><p className="text-xs text-[#64748b]">Aprobados</p><p className="text-2xl font-bold text-[#0f172a]">{aprobados}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-5 flex items-center gap-4">
            <XCircle className="w-8 h-8 text-red-500" />
            <div><p className="text-xs text-[#64748b]">Rechazados</p><p className="text-2xl font-bold text-[#0f172a]">{rechazados}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#e2e8f0]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
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
                <TableHead>Fecha entrega</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inf) => (
                <TableRow key={inf.id}>
                  <TableCell className="font-medium">{inf.docente}</TableCell>
                  <TableCell className="text-sm text-[#64748b]">{materiasMock.find((m) => m.id === inf.materiaId)?.nombre ?? `Materia ${inf.materiaId}`}</TableCell>
                  <TableCell className="text-sm text-[#64748b]">{periodosMock.find((p) => p.id === inf.periodoId)?.nombre ?? `Periodo ${inf.periodoId}`}</TableCell>
                  <TableCell className="text-sm">{inf.fechaEntrega}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_COLOR[inf.estado]}`}>{inf.estado}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {inf.estado === "pendiente" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEstado(inf.id, "aprobado")} className="text-[#1a6b3c] hover:bg-[#e8f5ee]"><CheckCircle2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEstado(inf.id, "rechazado")} className="text-red-500 hover:bg-red-50"><XCircle className="w-4 h-4" /></Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(inf)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(inf.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Editar informe" : "Nuevo informe"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Docente *</Label>
              <Input value={form.docente} onChange={(e) => setForm({ ...form, docente: e.target.value })} />
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
              <Label>Fecha entrega</Label>
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
            <Button onClick={handleSave} className="bg-[#1a6b3c] hover:bg-[#155730] text-white">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
