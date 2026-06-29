"use client"

import { useState, useEffect } from "react"
import { CarreraService } from "@/lib/services"
import type { Carrera } from "@/lib/types/database"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, Building2 } from "lucide-react"
import { toast } from "sonner"

const empty: Omit<Carrera, "id"> = { nombre: "", siglas: "", facultad: "", coordinador: "", estado: "activo" }

export default function CarrerasPage() {
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Carrera | null>(null)
  const [form, setForm] = useState<Omit<Carrera, "id">>(empty)

  useEffect(() => { CarreraService.getAll().then(setCarreras) }, [])

  const filtered = carreras.filter((c) =>
    `${c.nombre} ${c.siglas} ${c.facultad}`.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (c: Carrera) => { setEditing(c); setForm({ nombre: c.nombre, siglas: c.siglas, facultad: c.facultad, coordinador: c.coordinador, estado: c.estado }); setOpen(true) }

  const handleSave = async () => {
    if (!form.nombre || !form.siglas || !form.facultad) { toast.error("Complete los campos obligatorios"); return }
    if (editing) {
      const updated = await CarreraService.update(editing.id, form)
      if (updated) { setCarreras((prev) => prev.map((c) => c.id === editing.id ? updated : c)); toast.success("Carrera actualizada") }
    } else {
      const created = await CarreraService.create(form)
      setCarreras((prev) => [created, ...prev]); toast.success("Carrera creada")
    }
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    await CarreraService.delete(id)
    setCarreras((prev) => prev.filter((c) => c.id !== id))
    toast.success("Carrera eliminada")
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Carreras</h1>
          <p className="text-[#6B7280] mt-1">Gestion de carreras universitarias</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">
          <Plus className="w-4 h-4 mr-2" />Nueva carrera
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {carreras.map((c) => (
          <Card key={c.id} className="border-[#D9D9D9]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E0EEEF] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#3C6E71]" />
                </div>
                <Badge variant={c.estado === "activo" ? "default" : "secondary"} className={c.estado === "activo" ? "bg-[#E0EEEF] text-[#3C6E71] hover:bg-[#E0EEEF]" : ""}>{c.estado}</Badge>
              </div>
              <p className="font-bold text-[#353535]">{c.nombre}</p>
              <p className="text-sm text-[#6B7280] mt-0.5">{c.siglas} &bull; {c.facultad}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Coord: {c.coordinador}</p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => openEdit(c)} className="flex-1"><Pencil className="w-3.5 h-3.5 mr-1" />Editar</Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input placeholder="Buscar carrera..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <div className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Siglas</TableHead>
                <TableHead>Facultad</TableHead>
                <TableHead>Coordinador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell><Badge variant="outline">{c.siglas}</Badge></TableCell>
                  <TableCell className="text-[#6B7280] text-sm">{c.facultad}</TableCell>
                  <TableCell className="text-[#6B7280] text-sm">{c.coordinador}</TableCell>
                  <TableCell>
                    <Badge className={c.estado === "activo" ? "bg-[#E0EEEF] text-[#3C6E71] hover:bg-[#E0EEEF]" : ""}>{c.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar carrera" : "Nueva carrera"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Nombre *</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Siglas *</Label>
              <Input value={form.siglas} onChange={(e) => setForm({ ...form, siglas: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as "activo" | "inactivo" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Facultad *</Label>
              <Input value={form.facultad} onChange={(e) => setForm({ ...form, facultad: e.target.value })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Coordinador</Label>
              <Input value={form.coordinador} onChange={(e) => setForm({ ...form, coordinador: e.target.value })} />
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
