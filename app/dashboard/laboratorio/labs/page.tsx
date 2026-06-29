"use client"

import { useEffect, useState } from "react"
import { getLaboratorios, createLaboratorio, updateLaboratorio, deleteLaboratorio, type LaboratorioInput } from "@/app/actions/laboratorio"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, FlaskConical, MapPin, User } from "lucide-react"
import { toast } from "sonner"
import type { laboratorios } from "@/lib/db/schema"

type Lab = typeof laboratorios.$inferSelect

const empty: LaboratorioInput = { nombre: "", ubicacion: "", capacidad: 30, responsable: "", estado: "activo" }

export default function LabsCrudPage() {
  const [labs, setLabs] = useState<Lab[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Lab | null>(null)
  const [form, setForm] = useState<LaboratorioInput>(empty)

  const load = () => getLaboratorios().then(setLabs)
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (lab: Lab) => {
    setEditing(lab)
    setForm({ nombre: lab.nombre, ubicacion: lab.ubicacion ?? "", capacidad: lab.capacidad, responsable: lab.responsable ?? "", estado: lab.estado })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return }
    try {
      if (editing) {
        await updateLaboratorio(editing.id, form)
        toast.success("Laboratorio actualizado")
      } else {
        await createLaboratorio(form)
        toast.success("Laboratorio creado")
      }
      setOpen(false)
      load()
    } catch {
      toast.error("Error al guardar")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteLaboratorio(id)
      toast.success("Laboratorio eliminado")
      load()
    } catch {
      toast.error("Error al eliminar")
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Laboratorios</h1>
          <p className="text-[#6B7280] mt-1">Crear, editar y eliminar espacios de práctica</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C]">
          <Plus className="w-4 h-4 mr-2" />Nuevo laboratorio
        </Button>
      </div>

      {labs.length === 0 ? (
        <Card className="border-[#D9D9D9]"><CardContent className="p-12 text-center text-[#6B7280]">No hay laboratorios. Cree el primero.</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab) => (
            <Card key={lab.id} className="border-[#D9D9D9]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E0EEEF] flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-[#3C6E71]" />
                  </div>
                  <Badge variant={lab.estado === "activo" ? "default" : "secondary"}>{lab.estado}</Badge>
                </div>
                <h3 className="font-semibold text-[#353535] mb-2">{lab.nombre}</h3>
                {lab.ubicacion && (
                  <p className="text-xs text-[#6B7280] flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" />{lab.ubicacion}</p>
                )}
                {lab.responsable && (
                  <p className="text-xs text-[#6B7280] flex items-center gap-1 mb-2"><User className="w-3 h-3" />{lab.responsable}</p>
                )}
                <p className="text-xs text-[#9CA3AF] mb-3">Capacidad: {lab.capacidad}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(lab)}><Pencil className="w-3.5 h-3.5 mr-1" />Editar</Button>
                  <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(lab.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar laboratorio" : "Nuevo laboratorio"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nombre *</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
            <div><Label>Ubicación</Label><Input value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} /></div>
            <div><Label>Responsable</Label><Input value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} /></div>
            <div><Label>Capacidad</Label><Input type="number" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: Number(e.target.value) })} /></div>
            <div>
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-[#3C6E71]" onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
