"use client"

import { useEffect, useState, useRef } from "react"
import { getMisArchivos, getConvocatoriasActivas, registrarArchivo } from "@/app/actions/documentos"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FileText, Upload, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import type { archivos, convocatorias } from "@/lib/db/schema"

type Archivo = typeof archivos.$inferSelect
type Convocatoria = typeof convocatorias.$inferSelect

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pendiente: { label: "Pendiente", variant: "secondary" },
  aprobado: { label: "Aprobado", variant: "default" },
  rechazado: { label: "Rechazado", variant: "destructive" },
}

export function MisDocumentosClient() {
  const [docs, setDocs] = useState<Archivo[]>([])
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([])
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [tipo, setTipo] = useState("academico")
  const [convocatoriaId, setConvocatoriaId] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const [archivos, convs] = await Promise.all([getMisArchivos(), getConvocatoriasActivas()])
    setDocs(archivos)
    setConvocatorias(convs)
  }

  useEffect(() => { load() }, [])

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file || !nombre.trim()) {
      toast.error("Seleccione un archivo y escriba un nombre")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await registrarArchivo({
        nombre,
        tipo,
        archivoUrl: data.url,
        convocatoriaId: convocatoriaId ? Number(convocatoriaId) : undefined,
      })
      toast.success("Documento subido. Pendiente de revisión.")
      setOpen(false)
      setNombre("")
      setTipo("academico")
      setConvocatoriaId("")
      if (fileRef.current) fileRef.current.value = ""
      load()
    } catch {
      toast.error("Error al subir el archivo")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Mis Documentos</h1>
          <p className="text-[#64748b] mt-1">Suba archivos según las convocatorias activas</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[#1a6b3c] hover:bg-[#155730]">
          <Upload className="w-4 h-4 mr-2" />Subir documento
        </Button>
      </div>

      {convocatorias.length > 0 && (
        <Card className="border-[#e2e8f0]">
          <CardHeader><CardTitle className="text-sm">Convocatorias activas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {convocatorias.map((c) => (
              <div key={c.id} className="text-sm border border-[#e2e8f0] rounded-lg p-3">
                <p className="font-medium">{c.titulo}</p>
                <p className="text-[#64748b] text-xs">{c.modulo} — {c.fechaInicio} al {c.fechaFin}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-[#e2e8f0]">
        <CardHeader>
          <CardTitle>Mis archivos</CardTitle>
          <CardDescription>{docs.length} documento(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-[#64748b]">No has subido documentos aún.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  <th className="text-left py-3 px-3 text-[#64748b]">Nombre</th>
                  <th className="text-left py-3 px-3 text-[#64748b]">Tipo</th>
                  <th className="text-left py-3 px-3 text-[#64748b]">Estado</th>
                  <th className="text-left py-3 px-3 text-[#64748b]">Archivo</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => {
                  const cfg = estadoConfig[d.estado] ?? estadoConfig.pendiente
                  return (
                    <tr key={d.id} className="border-b border-[#f1f5f9]">
                      <td className="py-3 px-3 font-medium">{d.nombre}</td>
                      <td className="py-3 px-3">{d.tipo}</td>
                      <td className="py-3 px-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                      <td className="py-3 px-3">
                        <a href={d.archivoUrl} target="_blank" rel="noreferrer" className="text-[#1a6b3c] flex items-center gap-1">
                          Ver <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Subir documento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nombre del documento *</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="academico">Académico</SelectItem>
                  <SelectItem value="identidad">Identidad</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="silabo">Sílabo</SelectItem>
                  <SelectItem value="informe">Informe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {convocatorias.length > 0 && (
              <div>
                <Label>Convocatoria (opcional)</Label>
                <Select value={convocatoriaId} onValueChange={setConvocatoriaId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {convocatorias.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.titulo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div><Label>Archivo *</Label><Input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-[#1a6b3c]" disabled={uploading} onClick={handleUpload}>
              {uploading ? "Subiendo..." : "Subir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
