"use client"

import { useEffect, useState, useMemo } from "react"
import {
  getTemasTitulacion,
  getCarreras,
  createTemaTitulacion,
  updateTemaTitulacion,
  deleteTemaTitulacion,
  type TemaTitulacionInput,
} from "@/app/actions/titulacion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import type { temasTitulacion, carreras } from "@/lib/db/schema"

type Tema = typeof temasTitulacion.$inferSelect
type Carrera = typeof carreras.$inferSelect

// ─── fallback de ejemplo cuando la BD está vacía ──────────────────────────────
const FALLBACK_TEMAS: (Tema & { carreraNombre?: string })[] = [
  {
    id: -1,
    estudianteId: "demo-1",
    titulo: "Impacto de la rotación de cultivos en la sostenibilidad del suelo",
    tutor: "Ing. Carlos Rodríguez",
    carreraId: null,
    carreraNombre: "Agropecuaria",
    modalidad: "proyecto",
    estado: "propuesto",
    avance: 30,
    createdAt: new Date(),
  },
  {
    id: -2,
    estudianteId: "demo-2",
    titulo: "Optimización de procesos de fermentación en productos lácteos",
    tutor: "Dra. María González",
    carreraId: null,
    carreraNombre: "Agroindustria",
    modalidad: "tesis",
    estado: "en_progreso",
    avance: 60,
    createdAt: new Date(),
  },
]

// ─── config de estados ─────────────────────────────────────────────────────────
const ESTADOS: Record<string, { label: string; color: string; bg: string }> = {
  propuesto:    { label: "Propuesto",   color: "#fff", bg: "#88C273" },
  en_progreso:  { label: "En progreso", color: "#fff", bg: "#536493" },
  completado:   { label: "Completado",  color: "#fff", bg: "#3C6E71" },
}

const estadoLabel = (e: string) => ESTADOS[e]?.label ?? e
const estadoBg    = (e: string) => ESTADOS[e]?.bg    ?? "#888"

// ─── campo vacío del formulario ────────────────────────────────────────────────
const EMPTY: TemaTitulacionInput = {
  titulo: "",
  estudianteId: "",
  tutor: "",
  carreraId: null,
  modalidad: "proyecto",
  estado: "propuesto",
  avance: 0,
}

export function TitulacionCrud() {
  // datos
  const [temas,    setTemas]    = useState<(Tema & { carreraNombre?: string })[]>([])
  const [carrerasList, setCarrerasList] = useState<Carrera[]>([])
  const [loading,  setLoading]  = useState(true)

  // filtros
  const [filterCarrera, setFilterCarrera] = useState<string>("all")
  const [filterEstado,  setFilterEstado]  = useState<string>("all")

  // dialogo
  const [open,    setOpen]    = useState(false)
  const [editing, setEditing] = useState<Tema | null>(null)
  const [form,    setForm]    = useState<TemaTitulacionInput>(EMPTY)

  // ── carga inicial ────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true)
    try {
      const [rawTemas, rawCarreras] = await Promise.all([
        getTemasTitulacion(),
        getCarreras(),
      ])
      setCarrerasList(rawCarreras)

      // enriquecer temas con nombre de carrera
      const carreraMap: Record<number, string> = {}
      rawCarreras.forEach((c) => { carreraMap[c.id] = c.nombre })

      const enriched = rawTemas.map((t) => ({
        ...t,
        carreraNombre: t.carreraId ? carreraMap[t.carreraId] : undefined,
      }))

      setTemas(enriched)
    } catch (err) {
      console.error(err)
      toast.error("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── temas filtrados ──────────────────────────────────────────────────────────
  const displayTemas = temas.length === 0 ? FALLBACK_TEMAS : temas

  const filtered = useMemo(() => {
    return displayTemas.filter((t) => {
      const carreraOk =
        filterCarrera === "all" ||
        (t.carreraId !== null && String(t.carreraId) === filterCarrera)
      const estadoOk =
        filterEstado === "all" || t.estado === filterEstado
      return carreraOk && estadoOk
    })
  }, [displayTemas, filterCarrera, filterEstado])

  // ── dialogo ──────────────────────────────────────────────────────────────────
  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit   = (t: Tema) => {
    setEditing(t)
    setForm({
      titulo:      t.titulo,
      estudianteId: t.estudianteId,
      tutor:       t.tutor ?? "",
      carreraId:   t.carreraId,
      modalidad:   t.modalidad,
      estado:      t.estado,
      avance:      t.avance,
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
    if (id < 0) { toast.error("No puedes eliminar un tema de ejemplo"); return }
    try {
      await deleteTemaTitulacion(id)
      toast.success("Tema eliminado")
      load()
    } catch {
      toast.error("Error al eliminar")
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Encabezado: título + botón "Nuevo tema" ── */}
      <div className="rounded-2xl p-4 flex items-center justify-between mb-4" style={{ backgroundColor: '#D9D9D9' }}>
        <div>
          <h1 className="text-xl font-bold text-[#353535]">Titulación</h1>
          <p className="text-[#6B7280] mt-1 text-base">Gestión de temas de titulación</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3C6E71] hover:bg-[#2F5A5C]">
          <Plus className="w-4 h-4 rounded-[12px]" />Nuevo tema
        </Button>
      </div>

      {/* ── Sección "Temas en Desarrollo" ── */}
      <div className="min-h-[60vh]">
        {/* Sub-encabezado + filtros */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#353535]">Temas en Desarrollo</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Selecciona una carrera o estado para filtrar los temas</p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-sm font-medium text-[#353535]">Filtrar por:</span>

            {/* Filtro carrera */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6B7280]">Carrera:</span>
              <Select value={filterCarrera} onValueChange={setFilterCarrera}>
                <SelectTrigger
                  className="h-9 min-w-[160px] border-0 text-[#353535] text-sm rounded-xl focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ backgroundColor: '#D9D9D9' }}
                >
                  <SelectValue placeholder="Todas las carreras" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-[#D9D9D9]">
                  <SelectItem value="all">Todas las carreras</SelectItem>
                  {carrerasList.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro estado */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6B7280]">Estado:</span>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger
                  className="h-9 min-w-[140px] border-0 text-[#353535] text-sm rounded-xl focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ backgroundColor: '#D9D9D9' }}
                >
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-[#D9D9D9]">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(ESTADOS).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: cfg.bg }}
                        />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Lista de temas */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3C6E71] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <GraduationCap className="mb-4 h-12 w-12 text-[#D9D9D9]" />
            <p className="text-lg font-medium text-[#6B7280]">
              No hay temas para los filtros seleccionados
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((tema) => (
              <div
                key={tema.id}
                className="group relative rounded-2xl p-5 transition-all duration-200 hover:shadow-md hover:translate-x-1"
                style={{ backgroundColor: '#D9D9D9' }}
              >
                {/* Badge carrera */}
                <div className="mb-3">
                  <span
                    className="inline-block rounded-lg px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: "#3C6E71" }}
                  >
                    {tema.carreraNombre ?? "Sin carrera"}
                  </span>
                </div>

                {/* Título */}
                <h3 className="mb-2 text-base font-bold text-[#1a1a1a]">
                  {tema.titulo}
                </h3>

                {/* Modalidad (como descripción secundaria) */}
                <p className="mb-3 text-sm text-[#3a3a3a]">
                  Modalidad: <span className="capitalize">{tema.modalidad}</span>
                  {tema.avance > 0 && (
                    <> · Avance: <span className="font-medium">{tema.avance}%</span></>
                  )}
                </p>

                {/* Docente / tutor */}
                <div className="mb-3 flex items-center gap-2 text-sm text-[#2d2d2d]">
                  <span className="font-medium">Docente:</span>
                  <span>{tema.tutor ?? "—"}</span>
                </div>

                {/* Estado */}
                <div className="flex items-center gap-2 text-sm text-[#2d2d2d]">
                  <span className="font-medium">Estado:</span>
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: estadoBg(tema.estado) }}
                  >
                    {estadoLabel(tema.estado)}
                  </span>
                </div>

                {/* Acciones (visible al hover) */}
                {tema.id > 0 && (
                  <div className="absolute right-4 top-4 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 border-[#D9D9D9]"
                      onClick={() => openEdit(tema as Tema)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 border-[#D9D9D9] text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(tema.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Dialogo: Nuevo / Editar tema ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar tema" : "Nuevo tema de titulación"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ej. Análisis de cultivos en suelos tropicales"
              />
            </div>

            <div>
              <Label>ID estudiante (userId) *</Label>
              <Input
                value={form.estudianteId}
                onChange={(e) => setForm({ ...form, estudianteId: e.target.value })}
                placeholder="userId del estudiante"
              />
            </div>

            <div>
              <Label>Tutor / Docente</Label>
              <Input
                value={form.tutor}
                onChange={(e) => setForm({ ...form, tutor: e.target.value })}
                placeholder="Ej. Ing. Carlos Rodríguez"
              />
            </div>

            <div>
              <Label>Carrera</Label>
              <Select
                value={form.carreraId ? String(form.carreraId) : "none"}
                onValueChange={(v) =>
                  setForm({ ...form, carreraId: v === "none" ? null : Number(v) })
                }
              >
                <SelectTrigger><SelectValue placeholder="Sin carrera asignada" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin carrera</SelectItem>
                  {carrerasList.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Modalidad</Label>
              <Select
                value={form.modalidad}
                onValueChange={(v) => setForm({ ...form, modalidad: v })}
              >
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
              <Select
                value={form.estado}
                onValueChange={(v) => setForm({ ...form, estado: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="propuesto">Propuesto</SelectItem>
                  <SelectItem value="en_progreso">En progreso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Avance (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.avance}
                onChange={(e) => setForm({ ...form, avance: Number(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-[#3C6E71] hover:bg-[#2F5A5C]" onClick={handleSave}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
