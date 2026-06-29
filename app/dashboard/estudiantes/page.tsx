"use client"

import { useState, useEffect } from "react"
import { EstudianteService } from "@/lib/services"
import { carrerasMock } from "@/lib/mock/carreras"
import type { Estudiante } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, GraduationCap, TrendingUp, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

const ESTADO_COLOR: Record<Estudiante["estado"], string> = {
  activo: "bg-[#E0EEEF] text-[#3C6E71]",
  retirado: "bg-red-100 text-red-700",
  egresado: "bg-blue-100 text-blue-700",
}

const empty: Omit<Estudiante, "id"> = { nombres: "", apellidos: "", cedula: "", correo: "", carreraId: 1, nivel: 1, estado: "activo", promedio: 0 }

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [search, setSearch] = useState("")
  const [filterCarrera, setFilterCarrera] = useState("all")
  const [filterEstado, setFilterEstado] = useState("all")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Estudiante | null>(null)
  const [form, setForm] = useState<Omit<Estudiante, "id">>(empty)

  useEffect(() => { EstudianteService.getAll().then(setEstudiantes) }, [])

  const filtered = estudiantes
    .filter((e) => `${e.nombres} ${e.apellidos} ${e.cedula} ${e.correo}`.toLowerCase().includes(search.toLowerCase()))
    .filter((e) => filterCarrera === "all" || e.carreraId === Number(filterCarrera))
    .filter((e) => filterEstado === "all" || e.estado === filterEstado)

  const activos = estudiantes.filter((e) => e.estado === "activo").length
  const retirados = estudiantes.filter((e) => e.estado === "retirado").length
  const egresados = estudiantes.filter((e) => e.estado === "egresado").length
  const promedioGlobal = estudiantes.length ? (estudiantes.reduce((a, e) => a + e.promedio, 0) / estudiantes.length).toFixed(2) : "0"

  const chartData = carrerasMock.map((c) => ({
    name: c.siglas,
    activos: estudiantes.filter((e) => e.carreraId === c.id && e.estado === "activo").length,
    egresados: estudiantes.filter((e) => e.carreraId === c.id && e.estado === "egresado").length,
  }))

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (e: Estudiante) => {
    setEditing(e)
    setForm({ nombres: e.nombres, apellidos: e.apellidos, cedula: e.cedula, correo: e.correo, carreraId: e.carreraId, nivel: e.nivel, estado: e.estado, promedio: e.promedio })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.nombres || !form.apellidos || !form.cedula) { toast.error("Complete los campos obligatorios"); return }
    if (editing) {
      const updated = await EstudianteService.update(editing.id, form)
      if (updated) { setEstudiantes((prev) => prev.map((x) => x.id === editing.id ? updated : x)); toast.success("Estudiante actualizado") }
    } else {
      const created = await EstudianteService.create(form)
      setEstudiantes((prev) => [created, ...prev]); toast.success("Estudiante registrado")
    }
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    await EstudianteService.delete(id)
    setEstudiantes((prev) => prev.filter((x) => x.id !== id))
    toast.success("Estudiante eliminado")
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Panel de Estudiantes</h1>
          <p className="text-[#6B7280] mt-1">Gestion y seguimiento academico</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">
          <Plus className="w-4 h-4 mr-2" />Nuevo estudiante
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <GraduationCap className="w-8 h-8 text-[#3C6E71]" />
            <div><p className="text-xs text-[#6B7280]">Total</p><p className="text-2xl font-bold text-[#353535]">{estudiantes.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <UserCheck className="w-8 h-8 text-[#72c184]" />
            <div><p className="text-xs text-[#6B7280]">Activos</p><p className="text-2xl font-bold text-[#353535]">{activos}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <UserX className="w-8 h-8 text-red-500" />
            <div><p className="text-xs text-[#6B7280]">Retirados</p><p className="text-2xl font-bold text-[#353535]">{retirados}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#D9D9D9]">
          <CardContent className="p-5 flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div><p className="text-xs text-[#6B7280]">Promedio global</p><p className="text-2xl font-bold text-[#353535]">{promedioGlobal}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <CardTitle className="text-[#353535]">Estudiantes por carrera</CardTitle>
          <CardDescription>Activos y egresados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="activos" name="Activos" fill="#3C6E71" radius={[4, 4, 0, 0]} />
              <Bar dataKey="egresados" name="Egresados" fill="#72c184" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input placeholder="Buscar estudiante..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterCarrera} onValueChange={setFilterCarrera}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Carrera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {carrerasMock.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.siglas}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="retirado">Retirado</SelectItem>
                <SelectItem value="egresado">Egresado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Cedula</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Promedio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{e.nombres} {e.apellidos}</p>
                      <p className="text-xs text-[#6B7280]">{e.correo}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{e.cedula}</TableCell>
                  <TableCell className="text-sm">{carrerasMock.find((c) => c.id === e.carreraId)?.siglas}</TableCell>
                  <TableCell className="text-center">{e.nivel}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${e.promedio >= 8 ? "text-[#3C6E71]" : e.promedio >= 6 ? "text-[#D4A373]" : "text-red-600"}`}>
                      {e.promedio}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${ESTADO_COLOR[e.estado]} hover:${ESTADO_COLOR[e.estado]}`}>{e.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Editar estudiante" : "Nuevo estudiante"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombres *</Label>
              <Input value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Apellidos *</Label>
              <Input value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cedula *</Label>
              <Input value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Correo</Label>
              <Input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
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
              <Label>Promedio</Label>
              <Input type="number" min={0} max={10} step={0.1} value={form.promedio} onChange={(e) => setForm({ ...form, promedio: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as Estudiante["estado"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="retirado">Retirado</SelectItem>
                  <SelectItem value="egresado">Egresado</SelectItem>
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
