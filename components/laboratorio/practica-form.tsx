"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  createPractica,
  updatePractica,
  type PracticaInput,
  type EquipoItem,
  type ReactivoItem,
  type AsistenciaItem,
} from "@/app/actions/laboratorio"
import type { practicas, laboratorios } from "@/lib/db/schema"

type PracticaRow = typeof practicas.$inferSelect
type LabRow = typeof laboratorios.$inferSelect

const cell = "border border-black px-2"
const headerGreen = "bg-[#B8D4C8] border border-black font-bold px-2"
const headerBlue = "bg-[#C8D1E0] border border-black font-bold px-2"

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

interface PracticaFormProps {
  laboratorios: LabRow[]
  docenteNombre: string
  initial?: PracticaRow
}

export function PracticaForm({ laboratorios, docenteNombre, initial }: PracticaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [laboratorioId, setLaboratorioId] = useState(String(initial?.laboratorioId ?? laboratorios[0]?.id ?? ""))
  const [numEstudiantes, setNumEstudiantes] = useState(String(initial?.numEstudiantes ?? "20"))
  const [asignatura, setAsignatura] = useState(initial?.asignatura ?? "")
  const [unidadAcademica, setUnidadAcademica] = useState(initial?.unidadAcademica ?? "")
  const [semestre, setSemestre] = useState(initial?.semestre ?? "")
  const [carrera, setCarrera] = useState("")
  const [institucion, setInstitucion] = useState(initial?.institucion ?? "ULEAM")
  const [ciudad, setCiudad] = useState(initial?.ciudad ?? "Manta")
  const [horaEntrada, setHoraEntrada] = useState(initial?.horaEntrada ?? "17:00")
  const [horaSalida, setHoraSalida] = useState(initial?.horaSalida ?? "19:00")
  const [docente, setDocente] = useState(initial?.docenteNombre ?? docenteNombre)
  const [fecha, setFecha] = useState(initial?.fecha ?? new Date().toISOString().slice(0, 10))
  const [tema, setTema] = useState(initial?.tema ?? "")
  const [subtema, setSubtema] = useState(initial?.subtema ?? "")
  const [logroAprendizaje, setLogroAprendizaje] = useState(initial?.logroAprendizaje ?? "")
  const [objetivo, setObjetivo] = useState(initial?.objetivo ?? "")
  const [metodologia, setMetodologia] = useState(initial?.metodologia ?? "")
  const [resultados, setResultados] = useState(initial?.resultados ?? "")
  const [conclusiones, setConclusiones] = useState(initial?.conclusiones ?? "")
  const [observacionesDetalle, setObservacionesDetalle] = useState(initial?.observacionesDetalle ?? "")

  const [equipos, setEquipos] = useState<EquipoItem[]>(
    parseJson(initial?.equiposUsados ?? null, [{ nombre: "", cantidad: 1 }])
  )
  const [reactivos, setReactivos] = useState<ReactivoItem[]>(
    parseJson(initial?.reactivosUsados ?? null, [{ nombre: "", cantidad: 1 }])
  )
  const [estudiantes, setEstudiantes] = useState<AsistenciaItem[]>(
    parseJson(initial?.asistencia ?? null, [
      { id: 1, nombre: "", asistencia: "PRESENTE" },
    ])
  )

  const marcar = (index: number, estado: "PRESENTE" | "AUSENTE") => {
    setEstudiantes((prev) =>
      prev.map((e, i) => (i === index ? { ...e, asistencia: estado } : e))
    )
  }

  const buildPayload = (): PracticaInput => ({
    tema,
    subtema,
    logroAprendizaje,
    laboratorioId: Number(laboratorioId),
    asignatura,
    unidadAcademica,
    semestre,
    institucion,
    ciudad,
    numEstudiantes: Number(numEstudiantes) || 0,
    horaEntrada,
    horaSalida,
    docenteNombre: docente,
    fecha,
    objetivo,
    metodologia,
    resultados,
    conclusiones,
    observacionesDetalle,
    equipos: equipos.filter((e) => e.nombre.trim()),
    reactivos: reactivos.filter((r) => r.nombre.trim()),
    asistencia: estudiantes.filter((e) => e.nombre.trim()),
  })

  const handleSubmit = async () => {
    if (!tema.trim() || !laboratorioId || !fecha) {
      toast.error("Complete tema, laboratorio y fecha")
      return
    }
    setLoading(true)
    try {
      const payload = buildPayload()
      if (initial) {
        await updatePractica(initial.id, payload)
        toast.success("Práctica actualizada")
      } else {
        await createPractica(payload)
        toast.success("Práctica registrada")
      }
      router.push("/dashboard/laboratorio/practicas")
      router.refresh()
    } catch {
      toast.error("Error al guardar la práctica")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl bg-white border border-black shadow">
      <table className="w-full border-collapse text-[13px]">
        <tbody>
          <tr>
            <td colSpan={6} className={`${cell} text-center font-bold py-2`}>
              REGISTRO DE PRÁCTICA DE LABORATORIO
            </td>
          </tr>

          <tr>
            <td colSpan={6} className={headerGreen}>1. DATOS INFORMATIVOS</td>
          </tr>

          <tr>
            <td className={`${cell} font-semibold`}>LABORATORIO:</td>
            <td className={cell}>
              <select
                className="w-full outline-none bg-transparent"
                value={laboratorioId}
                onChange={(e) => setLaboratorioId(e.target.value)}
              >
                {laboratorios.map((l) => (
                  <option key={l.id} value={l.id}>{l.nombre}</option>
                ))}
              </select>
            </td>
            <td colSpan={2} className={`${cell} font-semibold`}>Nº de Estudiantes:</td>
            <td colSpan={2} className={cell}>
              <input type="number" className="w-full outline-none" value={numEstudiantes} onChange={(e) => setNumEstudiantes(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td className={`${cell} font-semibold`}>Asignatura:</td>
            <td className={cell}>
              <input className="w-full outline-none" value={asignatura} onChange={(e) => setAsignatura(e.target.value)} />
            </td>
            <td className={`${cell} font-semibold`}>Unidad Académica:</td>
            <td colSpan={3} className={cell}>
              <input className="w-full outline-none" value={unidadAcademica} onChange={(e) => setUnidadAcademica(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td className={`${cell} font-semibold`}>Semestre:</td>
            <td className={cell}>
              <input className="w-full outline-none" value={semestre} onChange={(e) => setSemestre(e.target.value)} />
            </td>
            <td className={`${cell} font-semibold`}>Carrera:</td>
            <td className={cell}>
              <input className="w-full outline-none" value={carrera} onChange={(e) => setCarrera(e.target.value)} />
            </td>
            <td className={`${cell} font-semibold`}>Hora Entrada:</td>
            <td className={cell}>
              <input type="time" className="w-full outline-none" value={horaEntrada} onChange={(e) => setHoraEntrada(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td className={`${cell} font-semibold`}>Institución:</td>
            <td className={cell}>
              <input className="w-full outline-none" value={institucion} onChange={(e) => setInstitucion(e.target.value)} />
            </td>
            <td className={`${cell} font-semibold`}>Ciudad:</td>
            <td className={cell}>
              <input className="w-full outline-none" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
            </td>
            <td className={`${cell} font-semibold`}>Hora Salida:</td>
            <td className={cell}>
              <input type="time" className="w-full outline-none" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td colSpan={4} className={cell}>
              <span className="font-semibold">Docente Responsable:</span>
              <input className="ml-2 outline-none w-[70%]" value={docente} onChange={(e) => setDocente(e.target.value)} />
            </td>
            <td className={`${cell} font-semibold`}>Fecha:</td>
            <td className={cell}>
              <input type="date" className="w-full outline-none" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td colSpan={6} className={headerGreen}>2. DATOS ACADÉMICOS</td>
          </tr>

          <tr>
            <td className={`${cell} font-semibold`}>Tema de la Práctica/Visita:</td>
            <td className={cell}>
              <textarea rows={3} className="w-full resize-none outline-none" value={tema} onChange={(e) => setTema(e.target.value)} />
            </td>
            <td className={`${cell} font-semibold`}>Subtema(s):</td>
            <td className={cell}>
              <textarea rows={3} className="w-full resize-none outline-none" value={subtema} onChange={(e) => setSubtema(e.target.value)} />
            </td>
            <td className={`${cell} font-semibold`}>Logro de aprendizaje:</td>
            <td className={cell}>
              <textarea rows={3} className="w-full resize-none outline-none" value={logroAprendizaje} onChange={(e) => setLogroAprendizaje(e.target.value)} />
            </td>
          </tr>

          <tr><td colSpan={6} className={headerBlue}>2.1 Objetivos de la Práctica</td></tr>
          <tr>
            <td colSpan={6} className={`${cell} p-2`}>
              <textarea rows={4} className="w-full resize-none outline-none" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
            </td>
          </tr>

          <tr><td colSpan={6} className={headerBlue}>2.2 Metodología de la Práctica</td></tr>
          <tr>
            <td colSpan={6} className={`${cell} p-2`}>
              <textarea rows={6} className="w-full resize-none outline-none" value={metodologia} onChange={(e) => setMetodologia(e.target.value)} />
            </td>
          </tr>

          <tr><td colSpan={6} className={headerBlue}>2.3 Resultados a obtenerse</td></tr>
          <tr>
            <td colSpan={6} className={`${cell} p-2`}>
              <textarea rows={5} className="w-full resize-none outline-none" value={resultados} onChange={(e) => setResultados(e.target.value)} />
            </td>
          </tr>

          <tr><td colSpan={6} className={headerBlue}>2.4 Conclusiones y Recomendaciones</td></tr>
          <tr>
            <td colSpan={6} className={`${cell} p-2`}>
              <textarea rows={5} className="w-full resize-none outline-none" value={conclusiones} onChange={(e) => setConclusiones(e.target.value)} />
            </td>
          </tr>

          <tr><td colSpan={6} className={headerBlue}>2.5 Observaciones</td></tr>
          <tr>
            <td colSpan={6} className={`${cell} p-2`}>
              <textarea rows={5} className="w-full resize-none outline-none" value={observacionesDetalle} onChange={(e) => setObservacionesDetalle(e.target.value)} />
            </td>
          </tr>

          {/* Equipos dentro del formulario */}
          <tr><td colSpan={6} className={headerGreen}>3. EQUIPOS Y MATERIALES</td></tr>
          <tr>
            <td colSpan={6} className={cell}>
              <div className="flex justify-end mb-2">
                <Button type="button" size="sm" className="bg-[#3C6E71] hover:bg-[#2F5A5C]" onClick={() => setEquipos((p) => [...p, { nombre: "", cantidad: 1 }])}>
                  + Añadir equipo
                </Button>
              </div>
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-black p-2">Equipo y Material</th>
                    <th className="border border-black p-2 w-[180px]">Cantidad</th>
                    <th className="border border-black p-2 w-[80px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map((equipo, index) => (
                    <tr key={index}>
                      <td className="border border-black p-2">
                        <input className="w-full outline-none" value={equipo.nombre} onChange={(e) => setEquipos((p) => p.map((x, i) => i === index ? { ...x, nombre: e.target.value } : x))} />
                      </td>
                      <td className="border border-black p-2">
                        <input type="number" className="w-full outline-none" value={equipo.cantidad} onChange={(e) => setEquipos((p) => p.map((x, i) => i === index ? { ...x, cantidad: Number(e.target.value) } : x))} />
                      </td>
                      <td className="border border-black p-2 text-center">
                        {equipos.length > 1 && (
                          <button type="button" className="text-red-600 text-xs" onClick={() => setEquipos((p) => p.filter((_, i) => i !== index))}>Eliminar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>

          {/* Reactivos dentro del formulario */}
          <tr><td colSpan={6} className={headerGreen}>4. REACTIVOS E INSUMOS</td></tr>
          <tr>
            <td colSpan={6} className={cell}>
              <div className="flex justify-end mb-2">
                <Button type="button" size="sm" className="bg-[#536493] hover:bg-[#3F516E]" onClick={() => setReactivos((p) => [...p, { nombre: "", cantidad: 1 }])}>
                  + Añadir reactivo
                </Button>
              </div>
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-black p-2">Reactivo e Insumo</th>
                    <th className="border border-black p-2 w-[180px]">Cantidad</th>
                    <th className="border border-black p-2 w-[80px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {reactivos.map((reactivo, index) => (
                    <tr key={index}>
                      <td className="border border-black p-2">
                        <input className="w-full outline-none" value={reactivo.nombre} onChange={(e) => setReactivos((p) => p.map((x, i) => i === index ? { ...x, nombre: e.target.value } : x))} />
                      </td>
                      <td className="border border-black p-2">
                        <input type="number" className="w-full outline-none" value={reactivo.cantidad} onChange={(e) => setReactivos((p) => p.map((x, i) => i === index ? { ...x, cantidad: Number(e.target.value) } : x))} />
                      </td>
                      <td className="border border-black p-2 text-center">
                        {reactivos.length > 1 && (
                          <button type="button" className="text-red-600 text-xs" onClick={() => setReactivos((p) => p.filter((_, i) => i !== index))}>Eliminar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>

          {/* Nómina estudiantes */}
          <tr><td colSpan={6} className={headerGreen}>5. NÓMINA DE ESTUDIANTES</td></tr>
          <tr>
            <td colSpan={6} className={cell}>
              <div className="flex justify-end mb-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setEstudiantes((p) => [...p, { id: p.length + 1, nombre: "", asistencia: "PRESENTE" }])}>
                  + Añadir estudiante
                </Button>
              </div>
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-black p-2 w-12">#</th>
                    <th className="border border-black p-2">Estudiante</th>
                    <th className="border border-black p-2 w-[220px]">Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.map((est, index) => (
                    <tr key={index}>
                      <td className="border border-black p-2 text-center">{index + 1}</td>
                      <td className="border border-black p-2">
                        <input className="w-full outline-none" placeholder="Nombre completo" value={est.nombre} onChange={(e) => setEstudiantes((p) => p.map((x, i) => i === index ? { ...x, nombre: e.target.value } : x))} />
                      </td>
                      <td className="border border-black p-2">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => marcar(index, "PRESENTE")}
                            className={`rounded px-3 py-1 text-xs font-bold ${est.asistencia === "PRESENTE" ? "bg-green-600 text-white" : "bg-green-100 text-green-700"}`}
                          >
                            PRESENTE
                          </button>
                          <button
                            type="button"
                            onClick={() => marcar(index, "AUSENTE")}
                            className={`rounded px-3 py-1 text-xs font-bold ${est.asistencia === "AUSENTE" ? "bg-red-600 text-white" : "bg-red-100 text-red-700"}`}
                          >
                            AUSENTE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end gap-4 p-6">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/laboratorio/practicas")}>
          Cancelar
        </Button>
        <Button type="button" className="bg-[#536493] hover:bg-[#3F516E] text-white" disabled={loading} onClick={handleSubmit}>
          {loading ? "Guardando..." : initial ? "Actualizar práctica" : "Guardar práctica"}
        </Button>
      </div>
    </div>
  )
}
