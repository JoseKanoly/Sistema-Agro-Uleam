"use client"

import { useEffect, useState, useRef } from "react"
import { getMisDocumentosPorGrupo } from "@/app/actions/grupos-documentos"
import { registrarArchivo } from "@/app/actions/documentos"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FolderOpen, Upload, ExternalLink, FileText, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import type { archivos } from "@/lib/db/schema"

type Archivo = typeof archivos.$inferSelect

type Requisito = { id: number; grupoId: number; nombre: string; orden: number; activo: boolean }
type Grupo = { id: number; nombre: string; descripcion: string | null; activo: boolean; requisitos: Requisito[] }

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pendiente: { label: "Pendiente", variant: "secondary" },
  aprobado: { label: "Aprobado", variant: "default" },
  rechazado: { label: "Rechazado", variant: "destructive" },
}

export function MisDocumentosClient() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [userName, setUserName] = useState("")
  const [cedula, setCedula] = useState<string | null>(null)
  const [folderName, setFolderName] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null)
  const [selectedRequisito, setSelectedRequisito] = useState<Requisito | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const data = await getMisDocumentosPorGrupo()
    setGrupos(data.grupos as Grupo[])
    setArchivos(data.archivos)
    setUserName(data.user.name)
    setCedula(data.cedula)
    setFolderName(data.folderName)
  }

  useEffect(() => { load() }, [])

  const openUpload = (grupo: Grupo, requisito: Requisito) => {
    setSelectedGrupo(grupo)
    setSelectedRequisito(requisito)
    setOpen(true)
  }

  const getArchivoRequisito = (grupoId: number, requisitoId: number) =>
    archivos.find((a) => a.grupoId === grupoId && a.requisitoId === requisitoId)

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file || !selectedGrupo || !selectedRequisito) {
      toast.error("Seleccione un archivo")
      return
    }

    const existente = getArchivoRequisito(selectedGrupo.id, selectedRequisito.id)
    if (existente && existente.estado === 'aprobado') {
      toast.error("Este requisito ya fue aprobado")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("grupoId", String(selectedGrupo.id))
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await registrarArchivo({
        nombre: selectedRequisito.nombre,
        tipo: selectedRequisito.nombre,
        archivoUrl: data.url,
        grupoId: selectedGrupo.id,
        requisitoId: selectedRequisito.id,
      })

      toast.success("Documento subido correctamente")
      setOpen(false)
      if (fileRef.current) fileRef.current.value = ""
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al subir el archivo")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Mis Documentos</h1>
        <p className="text-[#64748b] mt-1">
          Carpeta personal: <span className="font-medium text-[#0f172a]">{folderName ?? userName}</span>
          {cedula && <span className="text-[#64748b]"> · Cédula {cedula}</span>}
        </p>
      </div>

      {grupos.length === 0 ? (
        <Card className="border-[#e2e8f0]">
          <CardContent className="py-12 text-center text-[#64748b]">
            No hay grupos de documentos activos. El administrador debe crear grupos (ej. SGA).
          </CardContent>
        </Card>
      ) : (
        grupos.map((grupo) => (
          <Card key={grupo.id} className="border-[#e2e8f0]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0f172a]">
                <FolderOpen className="w-5 h-5 text-[#1a6b3c]" />
                {grupo.nombre}
              </CardTitle>
              <CardDescription>
                {grupo.descripcion ?? `Subcarpeta: ${folderName ?? userName}/${grupo.nombre}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {grupo.requisitos.map((req) => {
                const archivo = getArchivoRequisito(grupo.id, req.id)
                const cfg = archivo ? estadoConfig[archivo.estado] ?? estadoConfig.pendiente : null
                return (
                  <div
                    key={req.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-[#1a6b3c] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-[#0f172a] truncate">{req.nombre}</p>
                        <p className="text-xs text-[#64748b] flex items-center gap-1">
                          <span>{folderName ?? userName}</span>
                          <ChevronRight className="w-3 h-3" />
                          <span>{grupo.nombre}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {archivo && (
                        <>
                          <Badge variant={cfg?.variant}>{cfg?.label}</Badge>
                          <a
                            href={archivo.archivoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#1a6b3c] text-sm flex items-center gap-1"
                          >
                            Ver <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                      {(!archivo || archivo.estado !== 'aprobado') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUpload(grupo, req)}
                          className="border-[#1a6b3c] text-[#1a6b3c]"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          {archivo ? "Reemplazar" : "Subir"}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Subir: {selectedRequisito?.nombre}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748b]">
            Se guardará en: {folderName}/{selectedGrupo?.nombre}/
          </p>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="w-full text-sm" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-[#1a6b3c]" disabled={uploading} onClick={handleUpload}>
              {uploading ? "Subiendo..." : "Subir archivo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
