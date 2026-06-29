"use client"

import { useState, useEffect } from "react"
import { DocenciaService } from "@/lib/services"
import { materiasMock } from "@/lib/mock/materias"
import { periodosMock } from "@/lib/mock/periodos"
import type { InformeDocencia } from "@/lib/types/database"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, CheckCircle2, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

const ESTADO_COLOR: Record<InformeDocencia["estado"], string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobado: "bg-[#E0EEEF] text-[#3C6E71]",
  rechazado: "bg-red-100 text-red-700",
}

const empty: Omit<InformeDocencia, "id"> = { docente: "", materiaId: 1, periodoId: 1, tipo: "silabo", fechaEntrega: "", estado: "pendiente" }

export default function SilabosPage() {
  const [items, setItems] = useState<InformeDocencia[]>([])
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<InformeDocencia | null>(null)
  const [form, setForm] = useState<Omit<InformeDocencia, "id">>(empty)

  useEffect(() => { DocenciaService.getAll().then((all) => setItems(all.filter((i) => i.tipo === "silabo"))) }, [])

  const filtered = items
    .filter((i) => `${i.docente}`.toLowerCase().includes(search.toLowerCase()))
    .filter((i) => filterEstado === "all" || i.estado === filterEstado)

  const pendientes = items.filter((i) => i.estado === "pendiente").length
  const aprobados = items.filter((i) => i.estado === "aprobado").length
  const rechazados = items.filter((i) => i.estado === "rechazado").length

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (i: InformeDocencia) => { setEditing(i); setForm({ docente: i.docente, materiaId: i.materiaId, periodoId: i.periodoId, tipo: "silabo", fechaEntrega: i.fechaEntrega, estado: i.estado }); setOpen(true) }

  const handleSave = async () => {
    if (!form.docente || !form.fechaEntrega) { toast.error("Complete los campos obligatorios"); return }
    if (editing) {
      const updated = await DocenciaService.update(editing.id, form)
      if (updated) { setItems((prev) => prev.map((x) => x.id === editing.id ? updated : x)); toast.success("Silabo actualizado") }
    } else {
      const created = await DocenciaService.create({ ...form, tipo: "silabo" })
      setItems((prev) => [created, ...prev]); toast.success("Silabo registrado")
    }
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    await DocenciaService.delete(id)
    setItems((prev) => prev.filter((x) => x.id !== id))
    toast.success("Silabo eliminado")
  }

  const handleEstado = async (id: number, estado: InformeDocencia["estado"]) => {
    const updated = await DocenciaService.update(id, { estado })
    if (updated) { setItems((prev) => prev.map((x) => x.id === id ? updated : x)); toast.success(`Silabo ${estado}`) }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Silabos</h1>
          <p className="text-[#6B7280] mt-1">Gestion de silabos por materia y periodo</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">
          <Plus className="w-4 h-4 mr-2" />Nuevo silabo
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div><p className="text-xs text-[#6B7280]">Pendientes</p><p className="text-2xl font-bold text-[#353535]">{pendientes}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-[#72c184]" />
            <div><p className="text-xs text-[#6B7280]">Aprobados</p><p className="text-2xl font-bold text-[#353535]">{aprobados}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <XCircle className="w-8 h-8 text-red-500" />
            <div><p className="text-xs text-[#6B7280]">Rechazados</p><p className="text-2xl font-bold text-[#353535]">{rechazados}</p></div>
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
                <TableHead>Fecha entrega</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.docente}</TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{materiasMock.find((m) => m.id === s.materiaId)?.nombre ?? `Materia ${s.materiaId}`}</TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{periodosMock.find((p) => p.id === s.periodoId)?.nombre ?? `Periodo ${s.periodoId}`}</TableCell>
                  <TableCell className="text-sm">{s.fechaEntrega}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_COLOR[s.estado]}`}>{s.estado}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {s.estado === "pendiente" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEstado(s.id, "aprobado")} className="text-[#3C6E71] hover:bg-[#E0EEEF]"><CheckCircle2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEstado(s.id, "rechazado")} className="text-red-500 hover:bg-red-50"><XCircle className="w-4 h-4" /></Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Editar silabo" : "Nuevo silabo"}</DialogTitle></DialogHeader>
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
            <Button onClick={handleSave} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
