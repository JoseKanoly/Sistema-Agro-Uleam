"use client"

import { useState, useEffect } from "react"
import {
  getProyectosVinculacion,
  createProyectoVinculacion,
  updateProyectoVinculacion,
  deleteProyectoVinculacion,
} from "@/app/actions/vinculacion"
import {
  getEmpresasVinculacion,
  createEmpresaVinculacion,
} from "@/app/actions/empresas-vinculacion"
import { getLideresVinculacion } from "@/app/actions/lideres-vinculacion"

import type { ActividadVinculacion, LiderVinculacion, EmpresaVinculacion } from "@/lib/types/database"
import { carrerasMock } from "@/lib/mock/carreras"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, Link2, Building2, Users } from "lucide-react"
import { toast } from "sonner"

const ESTADO_COLOR: Record<ActividadVinculacion["estado"], string> = {
  programada: "bg-blue-100 text-blue-700",
  en_progreso: "bg-yellow-100 text-yellow-700",
  completado: "bg-green-100 text-green-700",
  cancelada: "bg-red-100 text-red-700",
}

const emptyActividad: Omit<ActividadVinculacion, "id"> = {
  nombre: "", liderId: 1, empresaId: 1, carreraId: 1,
  fechaInicio: "", fechaFin: "", beneficiarios: 0, estado: "programada",
}

export default function VinculacionPage() {
  const [actividades, setActividades] = useState<ActividadVinculacion[]>([])
  const [lideres, setLideres] = useState<LiderVinculacion[]>([])
  const [empresas, setEmpresas] = useState<EmpresaVinculacion[]>([])
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [empresasOpen, setEmpresasOpen] = useState(false)
  const [editing, setEditing] = useState<ActividadVinculacion | null>(null)
  const [form, setForm] = useState<Omit<ActividadVinculacion, "id">>(emptyActividad)
  const [empresaForm, setEmpresaForm] = useState({
    nombre: "",
    ruc: "",
    sector: "",
    contacto: "",
    telefono: "",
  })

  useEffect(() => {
    Promise.all([
      getProyectosVinculacion(),
      getEmpresasVinculacion(),
      getLideresVinculacion()
    ]).then(([proyectosRows, empresasRows, lideresRows]) => {

      setEmpresas(
        empresasRows.map((e) => ({
          id: e.id,
          nombre: e.nombre,
          ruc: e.ruc ?? "",
          sector: e.sector ?? "",
          contacto: e.contacto ?? "",
          telefono: e.telefono ?? "",
          convenios: 0,
        }))
      )
      setLideres(
        lideresRows.map((u, index) => ({
          id: index + 1,
          nombres: u.nombre,
          apellidos: "",
          correo: u.correo,
          carreraId: 1,
          proyectosActivos: proyectosRows.filter(
            (p) => Number(p.liderUserId) === index + 1
          ).length,
        }))
      )

      const proyectos: ActividadVinculacion[] =
        proyectosRows.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          liderId: p.liderUserId
            ? Number(p.liderUserId)
            : 1,
          empresaId: p.empresaId ?? 1,
          carreraId: p.carreraId ?? 1,
          fechaInicio: p.fechaInicio ?? "",
          fechaFin: p.fechaFin ?? "",
          beneficiarios: p.beneficiarios ?? 0,
          estado: p.estado as ActividadVinculacion["estado"],
        }))

      setActividades(proyectos)
    })
  }, [])

  const filtered = actividades.filter((a) =>
    a.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditing(null); setForm(emptyActividad); setOpen(true) }
  const openEdit = (a: ActividadVinculacion) => {
    setEditing(a)
    setForm({ nombre: a.nombre, liderId: a.liderId, empresaId: a.empresaId, carreraId: a.carreraId, fechaInicio: a.fechaInicio, fechaFin: a.fechaFin, beneficiarios: a.beneficiarios, estado: a.estado })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.nombre || !form.fechaInicio || !form.fechaFin) {
      toast.error("Complete los campos obligatorios")
      return
    }

    if (editing) {
      const updatedDb = await updateProyectoVinculacion(editing.id, {
        nombre: form.nombre,
        liderUserId: String(form.liderId),
        empresaId: form.empresaId,
        beneficiarios: form.beneficiarios,
        carreraId: form.carreraId,
        estado: form.estado,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
      })

      const updated: ActividadVinculacion = {
        id: updatedDb.id,
        ...form,
      }

      setActividades((prev) =>
        prev.map((a) =>
          a.id === editing.id ? updated : a
        )
      )

      toast.success("Actividad actualizada")
    } else {
      const createdDb = await createProyectoVinculacion({
        nombre: form.nombre,
        liderUserId: String(form.liderId),
        empresaId: form.empresaId,
        beneficiarios: form.beneficiarios,
        carreraId: form.carreraId,
        estado: form.estado,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
      })

      const created: ActividadVinculacion = {
        id: createdDb.id,
        ...form,
      }

      setActividades((prev) => [created, ...prev])

      toast.success("Actividad creada")
    }

    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    await deleteProyectoVinculacion(id)

    setActividades((prev) =>
      prev.filter((a) => a.id !== id)
    )

    toast.success("Actividad eliminada")
  }

  const handleCreateEmpresa = async () => {
    if (!empresaForm.nombre.trim()) {
      toast.error("Ingrese el nombre de la empresa")
      return
    }

    const creada = await createEmpresaVinculacion({
      nombre: empresaForm.nombre,
      ruc: empresaForm.ruc,
      sector: empresaForm.sector,
      contacto: empresaForm.contacto,
      telefono: empresaForm.telefono,
    })

    setEmpresas((prev) => [
      ...prev,
      {
        id: creada.id,
        nombre: creada.nombre,
        ruc: creada.ruc ?? "",
        sector: creada.sector ?? "",
        contacto: creada.contacto ?? "",
        telefono: creada.telefono ?? "",
        convenios: 0,
      },
    ])

    setEmpresaForm({
      nombre: "",
      ruc: "",
      sector: "",
      contacto: "",
      telefono: "",
    })

    toast.success("Empresa creada")
  }

  const getLider = (id: number) => { const l = lideres.find((l) => l.id === id); return l ? `${l.nombres} ${l.apellidos}` : "—" }
  const getEmpresa = (id: number) => empresas.find((e) => e.id === id)?.nombre ?? "—"
  const getCarrera = (id: number) => carrerasMock.find((c) => c.id === id)?.siglas ?? "—"

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Vinculacion con la Sociedad</h1>
          <p className="text-[#6B7280] mt-1">Proyectos de vinculacion, lideres y empresas aliadas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEmpresasOpen(true)} className="border-[#D9D9D9]">
            <Building2 className="w-4 h-4 mr-2" />Empresas
          </Button>
          <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white">
            <Plus className="w-4 h-4 mr-2" />Nueva actividad
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total actividades", value: actividades.length, color: "#3C6E71" },
          { label: "En progreso", value: actividades.filter((a) => a.estado === "en_progreso").length, color: "#D4A373" },
          { label: "Completadas", value: actividades.filter((a) => a.estado === "completado").length, color: "#72c184" },
          { label: "Lideres", value: lideres.length, color: "#536493" },
        ].map((s) => (
          <Card key={s.label} className="border-[#D9D9D9]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280]">{s.label}</p>
                <p className="text-2xl font-bold text-[#353535]">{s.value}</p>
              </div>
              <Link2 className="w-5 h-5" style={{ color: s.color }} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lideres */}
      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <CardTitle className="text-[#353535] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#3C6E71]" />Lideres de Vinculacion
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Proyectos activos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lideres.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.nombres} {l.apellidos}</TableCell>
                  <TableCell className="text-[#6B7280] text-sm">{l.correo}</TableCell>
                  <TableCell><span className="text-xs bg-[#E0EEEF] text-[#3C6E71] px-2 py-0.5 rounded-full font-medium">{getCarrera(l.carreraId)}</span></TableCell>
                  <TableCell><span className="font-semibold text-[#3C6E71]">{l.proyectosActivos}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actividades */}
      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input placeholder="Buscar actividad..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actividad</TableHead>
                <TableHead>Lider</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Fecha inicio</TableHead>
                <TableHead>Beneficiarios</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{a.nombre}</TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{getLider(a.liderId)}</TableCell>
                  <TableCell className="text-sm text-[#6B7280] max-w-[140px] truncate">{getEmpresa(a.empresaId)}</TableCell>
                  <TableCell><span className="text-xs bg-[#E0EEEF] text-[#3C6E71] px-2 py-0.5 rounded-full font-medium">{getCarrera(a.carreraId)}</span></TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{a.fechaInicio}</TableCell>
                  <TableCell className="text-sm font-semibold">{a.beneficiarios}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_COLOR[a.estado]}`}>
                      {a.estado.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal actividad */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar actividad" : "Nueva actividad"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Nombre de la actividad *</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Lider</Label>
              <Select value={String(form.liderId)} onValueChange={(v) => setForm({ ...form, liderId: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{lideres.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.nombres} {l.apellidos}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <Select value={String(form.empresaId)} onValueChange={(v) => setForm({ ...form, empresaId: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{empresas.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Carrera</Label>
              <Select value={String(form.carreraId)} onValueChange={(v) => setForm({ ...form, carreraId: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{carrerasMock.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.siglas}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as ActividadVinculacion["estado"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["programada", "en_progreso", "completado", "cancelada"] as const).map((e) => (
                    <SelectItem key={e} value={e}>{e.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fecha inicio *</Label>
              <Input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha fin *</Label>
              <Input type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Beneficiarios</Label>
              <Input type="number" min={0} value={form.beneficiarios} onChange={(e) => setForm({ ...form, beneficiarios: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-[#3C6E71] hover:bg-[#2F5A5C] text-white" onClick={handleSave}>
              {editing ? "Guardar cambios" : "Crear actividad"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal empresas */}
      <Dialog open={empresasOpen} onOpenChange={setEmpresasOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Empresas aliadas</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 mb-5">

            <Input
              placeholder="Nombre"
              value={empresaForm.nombre}
              onChange={(e) =>
                setEmpresaForm({
                  ...empresaForm,
                  nombre: e.target.value,
                })
              }
            />

            <Input
              placeholder="RUC"
              value={empresaForm.ruc}
              onChange={(e) =>
                setEmpresaForm({
                  ...empresaForm,
                  ruc: e.target.value,
                })
              }
            />

            <Input
              placeholder="Sector"
              value={empresaForm.sector}
              onChange={(e) =>
                setEmpresaForm({
                  ...empresaForm,
                  sector: e.target.value,
                })
              }
            />

            <Input
              placeholder="Contacto"
              value={empresaForm.contacto}
              onChange={(e) =>
                setEmpresaForm({
                  ...empresaForm,
                  contacto: e.target.value,
                })
              }
            />

            <Input
              placeholder="Teléfono"
              value={empresaForm.telefono}
              onChange={(e) =>
                setEmpresaForm({
                  ...empresaForm,
                  telefono: e.target.value,
                })
              }
            />

            <Button
              onClick={handleCreateEmpresa}
              className="bg-[#3C6E71] hover:bg-[#2F5A5C]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Empresa
            </Button>

          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Teléfono</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {empresas.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    {e.nombre}
                  </TableCell>

                  <TableCell>
                    {e.ruc}
                  </TableCell>

                  <TableCell>
                    {e.sector}
                  </TableCell>

                  <TableCell>
                    {e.contacto}
                  </TableCell>

                  <TableCell>
                    {e.telefono}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </DialogContent>
      </Dialog>
    </div>
  )
}
