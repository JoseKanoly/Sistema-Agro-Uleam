"use client"

import { useEffect, useState } from "react"
import {
  getGruposDocumentos,
  createGrupoDocumentos,
  addRequisitoGrupo,
  deleteGrupoDocumentos,
} from "@/app/actions/grupos-documentos"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FolderPlus, Plus, Trash2, FileStack } from "lucide-react"
import { toast } from "sonner"

type Grupo = Awaited<ReturnType<typeof getGruposDocumentos>>[number]

export default function GruposDocumentosPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [requisitos, setRequisitos] = useState(["Cédula de identidad", "Título de bachiller", "Inscripción"])
  const [nuevoRequisito, setNuevoRequisito] = useState("")
  const [loading, setLoading] = useState(false)

  const load = () => getGruposDocumentos().then(setGrupos)
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!nombre.trim()) {
      toast.error("Nombre del grupo requerido")
      return
    }
    setLoading(true)
    try {
      await createGrupoDocumentos({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        requisitos: requisitos.filter((r) => r.trim()),
      })
      toast.success("Grupo creado. Se notificó a los estudiantes y se crearon subcarpetas.")
      setOpen(false)
      setNombre("")
      setDescripcion("")
      setRequisitos(["Cédula de identidad", "Título de bachiller", "Inscripción"])
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear grupo")
    } finally {
      setLoading(false)
    }
  }

  const handleAddRequisito = async (grupoId: number) => {
    if (!nuevoRequisito.trim()) return
    try {
      await addRequisitoGrupo(grupoId, nuevoRequisito.trim())
      toast.success("Requisito agregado")
      setNuevoRequisito("")
      load()
    } catch {
      toast.error("Error al agregar requisito")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteGrupoDocumentos(id)
      toast.success("Grupo desactivado")
      load()
    } catch {
      toast.error("Error al eliminar")
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Grupos de documentos</h1>
          <p className="text-[#64748b] mt-1">
            Cree grupos (SGA, etc.) con requisitos. Cada estudiante tendrá subcarpeta: Nombre_Cédula/Grupo/
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[#1a6b3c] hover:bg-[#155730]">
          <FolderPlus className="w-4 h-4 mr-2" />Nuevo grupo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {grupos.filter((g) => g.activo).map((grupo) => (
          <Card key={grupo.id} className="border-[#e2e8f0]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileStack className="w-5 h-5 text-[#1a6b3c]" />
                    {grupo.nombre}
                  </CardTitle>
                  {grupo.descripcion && <CardDescription className="mt-1">{grupo.descripcion}</CardDescription>}
                </div>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(grupo.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs font-medium text-[#64748b] uppercase">Requisitos / archivos</p>
              {grupo.requisitos.map((r) => (
                <div key={r.id} className="text-sm py-2 px-3 bg-[#f8fafc] rounded-lg border border-[#f1f5f9]">
                  {r.nombre}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Nuevo requisito..."
                  value={nuevoRequisito}
                  onChange={(e) => setNuevoRequisito(e.target.value)}
                  className="h-9"
                />
                <Button size="sm" variant="outline" onClick={() => handleAddRequisito(grupo.id)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear grupo de documentos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del grupo *</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="SGA" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Documentos de matrícula" />
            </div>
            <div>
              <Label>Requisitos (archivos a subir)</Label>
              <div className="space-y-2 mt-2">
                {requisitos.map((r, i) => (
                  <Input
                    key={i}
                    value={r}
                    onChange={(e) => setRequisitos((prev) => prev.map((x, j) => j === i ? e.target.value : x))}
                  />
                ))}
                <Button variant="outline" size="sm" onClick={() => setRequisitos((prev) => [...prev, ""])}>
                  <Plus className="w-4 h-4 mr-1" />Agregar requisito
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-[#1a6b3c]" disabled={loading} onClick={handleCreate}>
              {loading ? "Creando..." : "Crear grupo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
