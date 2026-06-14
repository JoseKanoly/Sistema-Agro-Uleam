"use client"

import { useState, useEffect } from "react"
import {
  getUsuariosSistema,
  getCarrerasList,
  updateUsuarioPerfil,
  type UsuarioSistema,
} from "@/app/actions/usuarios"
import type { Rol } from "@/lib/types/database"
import { ROLES } from "@/lib/types/database"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Search, Users, GraduationCap, Microscope } from "lucide-react"
import { toast } from "sonner"

const ROL_COLOR: Record<Rol, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  COORDINADOR: "bg-indigo-100 text-indigo-700",
  PROFESOR: "bg-green-100 text-green-700",
  SECRETARIA: "bg-yellow-100 text-yellow-700",
  ESTUDIANTE: "bg-gray-100 text-gray-700",
}

type Carrera = { id: number; nombre: string; siglas: string }

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([])
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UsuarioSistema | null>(null)
  const [rol, setRol] = useState<Rol>("ESTUDIANTE")
  const [carreraId, setCarreraId] = useState<string>("null")
  const [esTutorTitulacion, setEsTutorTitulacion] = useState(false)
  const [esInvestigador, setEsInvestigador] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [users, carrerasList] = await Promise.all([getUsuariosSistema(), getCarrerasList()])
    setUsuarios(users)
    setCarreras(carrerasList)
  }

  useEffect(() => { load() }, [])

  const filtered = usuarios.filter((u) =>
    `${u.nombre} ${u.email} ${u.rol}`.toLowerCase().includes(search.toLowerCase())
  )

  const openEdit = (u: UsuarioSistema) => {
    setEditing(u)
    setRol(u.rol)
    setCarreraId(u.carreraId ? String(u.carreraId) : "null")
    setEsTutorTitulacion(u.esTutorTitulacion)
    setEsInvestigador(u.esInvestigador)
    setOpen(true)
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await updateUsuarioPerfil(editing.userId, {
        rol,
        carreraId: carreraId === "null" ? null : Number(carreraId),
        esTutorTitulacion: rol === "PROFESOR" || rol === "COORDINADOR" ? esTutorTitulacion : false,
        esInvestigador: rol === "PROFESOR" || rol === "COORDINADOR" ? esInvestigador : false,
      })
      toast.success("Permisos actualizados")
      setOpen(false)
      load()
    } catch {
      toast.error("Error al guardar permisos")
    } finally {
      setSaving(false)
    }
  }

  const puedePermisosExtra = rol === "PROFESOR" || rol === "COORDINADOR"

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Usuarios del sistema</h1>
        <p className="text-[#64748b] mt-1">
          Todos los usuarios registrados aparecen aquí. Asigne roles y permisos especiales.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {ROLES.map((r) => {
          const count = usuarios.filter((u) => u.rol === r.value).length
          return (
            <Card key={r.value} className="border-[#e2e8f0]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#64748b]">{r.label}</p>
                  <p className="text-2xl font-bold text-[#0f172a]">{count}</p>
                </div>
                <Users className="w-5 h-5 text-[#1a6b3c]" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-[#e2e8f0]">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <Input placeholder="Buscar por nombre, correo o rol..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[#64748b] py-8">
                    No hay usuarios registrados aún.
                  </TableCell>
                </TableRow>
              ) : filtered.map((u) => (
                <TableRow key={u.userId}>
                  <TableCell className="font-medium">{u.nombre}</TableCell>
                  <TableCell className="text-[#64748b] text-sm">{u.email}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROL_COLOR[u.rol]}`}>
                      {ROLES.find((r) => r.value === u.rol)?.label ?? u.rol}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {u.esTutorTitulacion && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <GraduationCap className="w-3 h-3" />Tutor
                        </Badge>
                      )}
                      {u.esInvestigador && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Microscope className="w-3 h-3" />Investigación
                        </Badge>
                      )}
                      {!u.esTutorTitulacion && !u.esInvestigador && (
                        <span className="text-xs text-[#94a3b8]">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#64748b]">
                    {new Date(u.createdAt).toLocaleDateString("es-EC")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
                      <Pencil className="w-4 h-4 mr-1" />Permisos
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar permisos</DialogTitle>
            {editing && (
              <p className="text-sm text-[#64748b]">{editing.nombre} — {editing.email}</p>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Rol del sistema *</Label>
              <Select value={rol} onValueChange={(v) => setRol(v as Rol)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.filter((r) => r.value !== "SUPER_ADMIN").map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Carrera (opcional)</Label>
              <Select value={carreraId} onValueChange={setCarreraId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Sin carrera</SelectItem>
                  {carreras.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {puedePermisosExtra && (
              <div className="space-y-3 border border-[#e2e8f0] rounded-lg p-4 bg-[#f8fafc]">
                <p className="text-sm font-medium text-[#0f172a]">Permisos adicionales</p>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="tutor"
                    checked={esTutorTitulacion}
                    onCheckedChange={(v) => setEsTutorTitulacion(v === true)}
                  />
                  <Label htmlFor="tutor" className="font-normal cursor-pointer">
                    Tutor de titulación
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="investigador"
                    checked={esInvestigador}
                    onCheckedChange={(v) => setEsInvestigador(v === true)}
                  />
                  <Label htmlFor="investigador" className="font-normal cursor-pointer">
                    Investigador (proyectos e hitos)
                  </Label>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#1a6b3c] hover:bg-[#155730] text-white">
              {saving ? "Guardando..." : "Guardar permisos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
