import malla from "@/lib/data/malla-curriculum.json"
import type { Materia } from "@/lib/types/database"

type MallaCarrera = {
  materias: Array<{
    codigo: string
    nombre: string
    nivel: number
    acd: number
    ape: number
    aa: number
    creditos: number
    horas: number
  }>
}

let nextId = 1

export const materiasMock: Materia[] = (malla as MallaCarrera[]).flatMap((carrera, carreraIndex) =>
  carrera.materias.map((materia) => ({
    id: nextId++,
    carreraId: carreraIndex + 1,
    nombre: materia.nombre,
    codigo: materia.codigo,
    creditos: materia.creditos,
    nivel: materia.nivel,
    acd: materia.acd,
    ape: materia.ape,
    aa: materia.aa,
    horas: materia.horas,
    docente: "",
    activa: true,
  })),
)
