"use client"

import { useState, useEffect } from "react"
import { MateriaService } from "@/lib/services"
import { carrerasMock } from "@/lib/mock/carreras"
import type { Materia } from "@/lib/types/database"
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

const empty: Omit<Materia, "id"> = { nombre: "", codigo: "", carreraId: 1, nivel: 1, creditos: 3, docente: "", activa: true }

export default function MateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([])
  const [search, setSearch] = useState("")
  const [filterCarrera, setFilterCarrera] = useState("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Materia | null>(null)
  const [form, setForm] = useState<Omit<Materia, "id">>(empty)

  useEffect(() => { MateriaService.getAll().then(setMaterias) }, [])

  const filtered = materias.filter((m) => {
    const matchSearch = `${m.nombre} ${m.codigo} ${m.docente}`.toLowerCase().includes(search.toLowerCase())
    const matchCarrera = filterCarrera === "all" || m.carreraId === Number(filterCarrera)
    return matchSearch && matchCarrera
  })

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (m: Materia) => { setEditing(m); setForm({ nombre: m.nombre, codigo: m.codigo, carreraId: m.carreraId, nivel: m.nivel, creditos: m.creditos, docente: m.docente, activa: m.activa }); setOpen(true) }

  const handleSave = async () => {
    if (!form.nombre || !form.codigo) { toast.error("Complete los campos obligatorios"); return }
    if (editing) {
      const updated = await MateriaService.update(editing.id, form)
      if (updated) { setMaterias((prev) => prev.map((m) => m.id === editing.id ? updated : m)); toast.success("Materia actualizada") }
    } else {
      const created = await MateriaService.create(form)
      setMaterias((prev) => [created, ...prev]); toast.success("Materia creada")
    }
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    await MateriaService.delete(id)
    setMaterias((prev) => prev.filter((m) => m.id !== id))
    toast.success("Materia eliminada")
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Materias</h1>
          <p className="text-[#64748b] mt-1">Plan de estudios por carrera</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1a6b3c] hover:bg-[#155730] text-white">
          <Plus className="w-4 h-4 mr-2" />Nueva materia
        </Button>
      </div>

      <Card className="border-[#e2e8f0]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <Input placeholder="Buscar materia..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterCarrera} onValueChange={setFilterCarrera}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Carrera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las carreras</SelectItem>
                {carrerasMock.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.siglas}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codigo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>ACD</TableHead>
                <TableHead>APE</TableHead>
                <TableHead>AA</TableHead>
                <TableHead>HRS</TableHead>
                <TableHead>Creditos</TableHead>
                <TableHead>Docente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell><Badge variant="outline" className="font-mono text-xs">{m.codigo}</Badge></TableCell>
                  <TableCell className="font-medium">{m.nombre}</TableCell>
                  <TableCell className="text-sm text-[#64748b]">{carrerasMock.find((c) => c.id === m.carreraId)?.siglas}</TableCell>
                  <TableCell className="text-center">{m.nivel}</TableCell>
                  <TableCell className="text-center text-sm">{m.acd ?? 0}</TableCell>
                  <TableCell className="text-center text-sm">{m.ape ?? 0}</TableCell>
                  <TableCell className="text-center text-sm">{m.aa ?? 0}</TableCell>
                  <TableCell className="text-center text-sm font-medium">{m.horas ?? 0}</TableCell>
                  <TableCell className="text-center">{m.creditos}</TableCell>
                  <TableCell className="text-sm text-[#64748b]">{m.docente}</TableCell>
                  <TableCell>
                    <Badge className={m.activa ? "bg-[#e8f5ee] text-[#1a6b3c] hover:bg-[#e8f5ee]" : "bg-gray-100 text-gray-600"}>
                      {m.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Editar materia" : "Nueva materia"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Nombre *</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Codigo *</Label>
              <Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Carrera</Label>
              <Select value={String(form.carreraId)} onValueChange={(v) => setForm({ ...form, carreraId: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{carrerasMock.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Nivel</Label>
              <Input type="number" min={1} max={10} value={form.nivel} onChange={(e) => setForm({ ...form, nivel: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Creditos</Label>
              <Input type="number" min={1} max={6} value={form.creditos} onChange={(e) => setForm({ ...form, creditos: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Docente</Label>
              <Input value={form.docente} onChange={(e) => setForm({ ...form, docente: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.activa ? "activa" : "inactiva"} onValueChange={(v) => setForm({ ...form, activa: v === "activa" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="inactiva">Inactiva</SelectItem>
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
