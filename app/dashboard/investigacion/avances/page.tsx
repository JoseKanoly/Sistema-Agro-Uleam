"use client"

import { useState, useEffect } from "react"
import { InvestigacionService } from "@/lib/services"
import { periodosMock } from "@/lib/mock/periodos"
import type { InformeInvestigacion } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, GitBranch, CheckCircle2, Clock, XCircle } from "lucide-react"
import { toast } from "sonner"

const ESTADO_COLOR: Record<InformeInvestigacion["estado"], string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobado: "bg-[#E0EEEF] text-[#3C6E71]",
  rechazado: "bg-red-100 text-red-700",
}

const empty: Omit<InformeInvestigacion, "id"> = {
  titulo: "",
  investigador: "",
  carreraId: 1,
  lineaInvestigacion: "",
  fecha: "",
  estado: "pendiente",
}

export default function AvancesInvestigacionPage() {
  const [hitos, setHitos] = useState<InformeInvestigacion[]>([])
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<InformeInvestigacion | null>(null)
  const [form, setForm] = useState<Omit<InformeInvestigacion, "id">>(empty)

  useEffect(() => {
    InvestigacionService.getAll().then(setHitos)
  }, [])

  const filtered = hitos
    .filter((h) => `${h.titulo} ${h.investigador}`.toLowerCase().includes(search.toLowerCase()))
    .filter((h) => filterEstado === "all" || h.estado === filterEstado)

  const pendientes = hitos.filter((h) => h.estado === "pendiente").length
  const aprobados = hitos.filter((h) => h.estado === "aprobado").length
  const rechazados = hitos.filter((h) => h.estado === "rechazado").length

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (h: InformeInvestigacion) => {
    setEditing(h)
    setForm({ titulo: h.titulo, investigador: h.investigador, carreraId: h.carreraId, lineaInvestigacion: h.lineaInvestigacion, fecha: h.fecha, estado: h.estado })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.titulo || !form.investigador || !form.fecha) {
      toast.error("Complete los campos obligatorios"); return
    }
    if (editing) {
      const updated = await InvestigacionService.update(editing.id, form)
      if (updated) {
        setHitos((prev) => prev.map((x) => x.id === editing.id ? updated : x))
        toast.success("Hito actualizado")
      }
    } else {
      const created = await InvestigacionService.create(form)
      setHitos((prev) => [created, ...prev])
      toast.success("Hito registrado")
    }
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    await InvestigacionService.delete(id)
    setHitos((prev) => prev.filter((x) => x.id !== id))
    toast.success("Hito eliminado")
  }

  const handleEstado = async (id: number, estado: InformeInvestigacion["estado"]) => {
    const updated = await InvestigacionService.update(id, { estado })
    if (updated) {
      setHitos((prev) => prev.map((x) => x.id === id ? updated : x))
      toast.success(`Estado actualizado a ${estado}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Mis Hitos de Investigacion</h1>
          <p className="text-[#6B7280] mt-1">Avances y entregables de proyectos de investigacion</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">
          <Plus className="w-4 h-4 mr-2" />Nuevo hito
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
              <Input
                placeholder="Buscar por titulo o investigador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
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
                <TableHead>Titulo</TableHead>
                <TableHead>Investigador</TableHead>
                <TableHead>Linea</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[#6B7280] py-8">
                    No se encontraron hitos registrados.
                  </TableCell>
                </TableRow>
              ) : filtered.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{h.titulo}</TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{h.investigador}</TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{h.lineaInvestigacion || "—"}</TableCell>
                  <TableCell className="text-sm">{h.fecha}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_COLOR[h.estado]}`}>
                      {h.estado}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {h.estado === "pendiente" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEstado(h.id, "aprobado")} className="text-[#3C6E71] hover:bg-[#E0EEEF]">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEstado(h.id, "rechazado")} className="text-red-500 hover:bg-red-50">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(h)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(h.id)} className="text-red-500 hover:bg-red-50">
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
            <DialogTitle>{editing ? "Editar hito" : "Nuevo hito de investigacion"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Titulo *</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Investigador *</Label>
              <Input value={form.investigador} onChange={(e) => setForm({ ...form, investigador: e.target.value })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Linea de investigacion</Label>
              <Input value={form.lineaInvestigacion} onChange={(e) => setForm({ ...form, lineaInvestigacion: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha *</Label>
              <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as InformeInvestigacion["estado"] })}>
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
