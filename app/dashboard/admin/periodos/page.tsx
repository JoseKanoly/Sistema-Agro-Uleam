"use client"

import { useState, useEffect } from "react"
import { PeriodoService } from "@/lib/services"
import type { PeriodoAcademico } from "@/lib/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, CalendarRange, CheckCircle2, Clock, Calendar } from "lucide-react"
import { toast } from "sonner"

type EstadoPeriodo = PeriodoAcademico["estado"]

const ESTADO_CONFIG: Record<EstadoPeriodo, { label: string; color: string; icon: React.ElementType }> = {
  activo: { label: "Activo", color: "bg-[#E0EEEF] text-[#3C6E71]", icon: CheckCircle2 },
  finalizado: { label: "Finalizado", color: "bg-gray-100 text-gray-600", icon: Clock },
  planificado: { label: "Planificado", color: "bg-blue-100 text-blue-700", icon: Calendar },
}

const empty: Omit<PeriodoAcademico, "id"> = { nombre: "", fechaInicio: "", fechaFin: "", estado: "planificado" }

export default function PeriodosPage() {
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PeriodoAcademico | null>(null)
  const [form, setForm] = useState<Omit<PeriodoAcademico, "id">>(empty)

  useEffect(() => { PeriodoService.getAll().then(setPeriodos) }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (p: PeriodoAcademico) => {
    setEditing(p)
    setForm({ nombre: p.nombre, fechaInicio: p.fechaInicio, fechaFin: p.fechaFin, estado: p.estado })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.nombre || !form.fechaInicio || !form.fechaFin) { toast.error("Complete todos los campos"); return }
    if (editing) {
      const updated = await PeriodoService.update(editing.id, form)
      if (updated) { setPeriodos((prev) => prev.map((p) => p.id === editing.id ? updated : p)); toast.success("Periodo actualizado") }
    } else {
      const created = await PeriodoService.create(form)
      setPeriodos((prev) => [created, ...prev]); toast.success("Periodo creado")
    }
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    await PeriodoService.delete(id)
    setPeriodos((prev) => prev.filter((p) => p.id !== id))
    toast.success("Periodo eliminado")
  }

  const activo = periodos.find((p) => p.estado === "activo")
  const planificados = periodos.filter((p) => p.estado === "planificado")
  const finalizados = periodos.filter((p) => p.estado === "finalizado")

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Periodos Academicos</h1>
          <p className="text-[#6B7280] mt-1">Gestion de periodos lectivos</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">
          <Plus className="w-4 h-4 mr-2" />Nuevo periodo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-[#D9D9D9] border-l-4 border-l-[#72c184]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-[#72c184]" />
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wider">Activo</p>
                <p className="font-bold text-[#353535]">{activo?.nombre ?? "Ninguno"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9] border-l-4 border-l-blue-400">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wider">Planificados</p>
                <p className="text-2xl font-bold text-[#353535]">{planificados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9] border-l-4 border-l-gray-300">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wider">Finalizados</p>
                <p className="text-2xl font-bold text-[#353535]">{finalizados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Periods list */}
      <div className="space-y-3">
        {periodos.map((p) => {
          const cfg = ESTADO_CONFIG[p.estado]
          const Icon = cfg.icon
          return (
            <div key={p.id} className="bg-white border border-[#D9D9D9] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E0EEEF] flex items-center justify-center">
                  <CalendarRange className="w-5 h-5 text-[#3C6E71]" />
                </div>
                <div>
                  <p className="font-semibold text-[#353535]">{p.nombre}</p>
                  <p className="text-sm text-[#6B7280]">
                    {new Date(p.fechaInicio + "T00:00:00").toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" })}
                    {" — "}
                    {new Date(p.fechaFin + "T00:00:00").toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                  <Icon className="w-3.5 h-3.5" />{cfg.label}
                </span>
                <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Editar periodo" : "Nuevo periodo"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input placeholder="2026 - Primer Periodo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fecha inicio *</Label>
                <Input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha fin *</Label>
                <Input type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as EstadoPeriodo })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="planificado">Planificado</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
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
