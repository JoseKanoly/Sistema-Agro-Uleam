"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getPracticas, deletePractica } from "@/app/actions/laboratorio"
import { getLaboratorios } from "@/app/actions/laboratorio"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"
import type { practicas } from "@/lib/db/schema"

type Practica = typeof practicas.$inferSelect

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  programada: { label: "Programada", variant: "secondary" },
  realizada: { label: "Realizada", variant: "default" },
  cancelada: { label: "Cancelada", variant: "destructive" },
}

export default function PracticasListPage() {
  const [rows, setRows] = useState<Practica[]>([])
  const [labMap, setLabMap] = useState<Record<number, string>>({})

  const load = async () => {
    const [practicas, labs] = await Promise.all([getPracticas(), getLaboratorios()])
    setRows(practicas)
    setLabMap(Object.fromEntries(labs.map((l) => [l.id, l.nombre])))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta práctica?")) return
    try {
      await deletePractica(id)
      toast.success("Práctica eliminada")
      load()
    } catch {
      toast.error("Error al eliminar")
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#353535]">Prácticas de Laboratorio</h1>
          <p className="text-[#6B7280] mt-1">Registro completo de prácticas con equipos, reactivos y asistencia</p>
        </div>
        <Link href="/dashboard/laboratorio/practicas/nueva">
          <Button className="bg-[#536493] hover:bg-[#3F516E]">
            <Plus className="w-4 h-4 mr-2" />Nueva práctica
          </Button>
        </Link>
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <CardTitle className="text-[#353535]">Listado</CardTitle>
          <CardDescription>{rows.length} práctica(s) registrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-center text-[#6B7280] py-8">No hay prácticas. Cree la primera con el botón superior.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((p) => {
                const cfg = estadoConfig[p.estado] ?? estadoConfig.programada
                return (
                  <div key={p.id} className="border border-[#D9D9D9] rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#353535]">{p.tema}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.fecha}</span>
                        <span>{labMap[p.laboratorioId] ?? `Lab #${p.laboratorioId}`}</span>
                        {p.docenteNombre && <span>{p.docenteNombre}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      <Link href={`/dashboard/laboratorio/practicas/${p.id}/editar`}>
                        <Button variant="outline" size="sm"><Pencil className="w-3.5 h-3.5" /></Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
