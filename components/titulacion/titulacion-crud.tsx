"use client"

import { useEffect, useState } from "react"
import { getTemasTitulacion, createTemaTitulacion, updateTemaTitulacion, deleteTemaTitulacion, type TemaTitulacionInput } from "@/app/actions/titulacion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { temasTitulacion } from "@/lib/db/schema"

type Tema = typeof temasTitulacion.$inferSelect

const empty: TemaTitulacionInput = {
  titulo: "",
  estudianteId: "",
  tutor: "",
  carreraId: null,
  modalidad: "proyecto",
  estado: "propuesto",
  avance: 0,
}

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  propuesto: { label: "Propuesto", variant: "secondary" },
  en_progreso: { label: "En Progreso", variant: "default" },
  completado: { label: "Completado", variant: "outline" },
}

export function TitulacionCrud() {
  const [temas, setTemas] = useState<Tema[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Tema | null>(null)
  const [form, setForm] = useState<TemaTitulacionInput>(empty)

  const load = () => getTemasTitulacion().then(setTemas)
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (t: Tema) => {
    setEditing(t)
    setForm({
      titulo: t.titulo,
      estudianteId: t.estudianteId,
      tutor: t.tutor ?? "",
      carreraId: t.carreraId,
      modalidad: t.modalidad,
      estado: t.estado,
      avance: t.avance,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.estudianteId.trim()) {
      toast.error("Título e ID de estudiante son obligatorios")
      return
    }
    try {
      if (editing) {
        await updateTemaTitulacion(editing.id, form)
        toast.success("Tema actualizado")
      } else {
        await createTemaTitulacion(form)
        toast.success("Tema creado")
      }
      setOpen(false)
      load()
    } catch {
      toast.error("Error al guardar")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTemaTitulacion(id)
      toast.success("Tema eliminado")
      load()
    } catch {
      toast.error("Error al eliminar")
    }
  }

  return (
    <>
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Titulación</h1>
          <p className="text-[#6B7280] mt-1">Gestión de temas de titulación</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C]">
          <Plus className="w-4 h-4 mr-2" />Nuevo tema
        </Button>
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <CardTitle className="text-[#353535]">Temas registrados</CardTitle>
          <CardDescription>{temas.length} tema(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {temas.length === 0 ? (
            <p className="text-center text-[#6B7280] py-8">No hay temas registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D9D9D9]">
                    <th className="text-left py-3 px-3 text-[#6B7280]">Título</th>
                    <th className="text-left py-3 px-3 text-[#6B7280]">Tutor</th>
                    <th className="text-left py-3 px-3 text-[#6B7280]">Modalidad</th>
                    <th className="text-left py-3 px-3 text-[#6B7280]">Avance</th>
                    <th className="text-left py-3 px-3 text-[#6B7280]">Estado</th>
                    <th className="text-right py-3 px-3 text-[#6B7280]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {temas.map((t) => {
                    const cfg = estadoConfig[t.estado] ?? estadoConfig.propuesto
                    return (
                      <tr key={t.id} className="border-b border-[#F5F5F5]">
                        <td className="py-3 px-3 font-medium max-w-xs"><span className="line-clamp-2">{t.titulo}</span></td>
                        <td className="py-3 px-3">{t.tutor ?? "—"}</td>
                        <td className="py-3 px-3">{t.modalidad}</td>
                        <td className="py-3 px-3">{t.avance}%</td>
                        <td className="py-3 px-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar tema" : "Nuevo tema de titulación"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
            <div><Label>ID estudiante (userId) *</Label><Input value={form.estudianteId} onChange={(e) => setForm({ ...form, estudianteId: e.target.value })} /></div>
            <div><Label>Tutor</Label><Input value={form.tutor} onChange={(e) => setForm({ ...form, tutor: e.target.value })} /></div>
            <div>
              <Label>Modalidad</Label>
              <Select value={form.modalidad} onValueChange={(v) => setForm({ ...form, modalidad: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="proyecto">Proyecto</SelectItem>
                  <SelectItem value="tesis">Tesis</SelectItem>
                  <SelectItem value="examen_complexivo">Examen Complexivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="propuesto">Propuesto</SelectItem>
                  <SelectItem value="en_progreso">En progreso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Avance (%)</Label><Input type="number" min={0} max={100} value={form.avance} onChange={(e) => setForm({ ...form, avance: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-[#3C6E71]" onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
