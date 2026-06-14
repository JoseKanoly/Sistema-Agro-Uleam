"use client"

import { useEffect, useState } from "react"
import {
  getConvocatorias,
  createConvocatoria,
  updateConvocatoria,
  deleteConvocatoria,
  type ConvocatoriaInput,
} from "@/app/actions/documentos"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CalendarCheck, Plus, Pencil, Trash2, Clock } from "lucide-react"
import { toast } from "sonner"
import type { convocatorias } from "@/lib/db/schema"

type Convocatoria = typeof convocatorias.$inferSelect

const ESTADO_COLORS: Record<string, string> = {
  activa: "bg-[#e8f5ee] text-[#1a6b3c]",
  cerrada: "bg-gray-100 text-gray-600",
  proxima: "bg-blue-50 text-blue-700",
}

const empty: ConvocatoriaInput = {
  titulo: "",
  descripcion: "",
  modulo: "Academico",
  tipoDocumento: "general",
  fechaInicio: "",
  fechaFin: "",
  estado: "activa",
}

export default function FechasLimitePage() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Convocatoria | null>(null)
  const [form, setForm] = useState<ConvocatoriaInput>(empty)

  const load = () => getConvocatorias().then(setConvocatorias)
  useEffect(() => { load() }, [])

  const activas = convocatorias.filter((c) => c.estado === "activa").length

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (c: Convocatoria) => {
    setEditing(c)
    setForm({
      titulo: c.titulo,
      descripcion: c.descripcion ?? "",
      modulo: c.modulo,
      tipoDocumento: c.tipoDocumento,
      fechaInicio: c.fechaInicio,
      fechaFin: c.fechaFin,
      estado: c.estado,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.titulo || !form.fechaInicio || !form.fechaFin) {
      toast.error("Complete los campos obligatorios")
      return
    }
    try {
      if (editing) {
        await updateConvocatoria(editing.id, form)
        toast.success("Convocatoria actualizada")
      } else {
        await createConvocatoria(form)
        toast.success("Convocatoria creada")
      }
      setOpen(false)
      load()
    } catch {
      toast.error("Error al guardar (requiere rol admin o secretaria)")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteConvocatoria(id)
      toast.success("Convocatoria eliminada")
      load()
    } catch {
      toast.error("Error al eliminar")
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Convocatorias y Eventos</h1>
          <p className="text-[#64748b] mt-1">Cree ventanas para que docentes y estudiantes suban documentos</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1a6b3c] hover:bg-[#155730]">
          <Plus className="w-4 h-4 mr-2" />Nueva convocatoria
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-5 flex items-center gap-4">
            <CalendarCheck className="w-8 h-8 text-[#1a6b3c]" />
            <div><p className="text-xs text-[#64748b]">Activas</p><p className="text-2xl font-bold">{activas}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-5 flex items-center gap-4">
            <Clock className="w-8 h-8 text-blue-500" />
            <div><p className="text-xs text-[#64748b]">Total</p><p className="text-2xl font-bold">{convocatorias.length}</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {convocatorias.map((c) => (
          <Card key={c.id} className="border-[#e2e8f0]">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{c.titulo}</CardTitle>
                <Badge className={ESTADO_COLORS[c.estado] ?? ESTADO_COLORS.activa}>{c.estado}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#64748b] mb-2">{c.modulo} — {c.tipoDocumento}</p>
              <p className="text-xs text-[#94a3b8]">{c.fechaInicio} → {c.fechaFin}</p>
              {c.descripcion && <p className="text-xs text-[#64748b] mt-2">{c.descripcion}</p>}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5 mr-1" />Editar</Button>
                <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar convocatoria" : "Nueva convocatoria"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
            <div><Label>Descripción</Label><Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
            <div><Label>Módulo</Label>
              <Select value={form.modulo} onValueChange={(v) => setForm({ ...form, modulo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Docencia">Docencia</SelectItem>
                  <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                  <SelectItem value="Academico">Académico</SelectItem>
                  <SelectItem value="Titulacion">Titulación</SelectItem>
                  <SelectItem value="Vinculacion">Vinculación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Tipo documento</Label><Input value={form.tipoDocumento} onChange={(e) => setForm({ ...form, tipoDocumento: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Inicio *</Label><Input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} /></div>
              <div><Label>Fin *</Label><Input type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} /></div>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="proxima">Próxima</SelectItem>
                  <SelectItem value="cerrada">Cerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-[#1a6b3c]" onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
