'use server'

import { db } from '@/lib/db'
import { laboratorios, practicas } from '@/lib/db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserId } from './auth'

export type EquipoItem = { nombre: string; cantidad: number }
export type ReactivoItem = { nombre: string; cantidad: number }
export type AsistenciaItem = { id?: number; nombre: string; cedula?: string; asistencia: 'PRESENTE' | 'AUSENTE' }

export type PracticaInput = {
  tema: string
  subtema?: string
  logroAprendizaje?: string
  laboratorioId: number
  laboratorioNombre?: string
  asignatura?: string
  unidadAcademica?: string
  semestre?: string
  carrera?: string
  carreraId?: number
  materiaId?: number
  periodoId?: number
  institucion?: string
  ciudad?: string
  numEstudiantes?: number
  horaEntrada?: string
  horaSalida?: string
  docenteNombre?: string
  fecha: string
  objetivo?: string
  metodologia?: string
  resultados?: string
  conclusiones?: string
  observacionesDetalle?: string
  equipos: EquipoItem[]
  reactivos: ReactivoItem[]
  asistencia: AsistenciaItem[]
  estado?: string
}

export type LaboratorioInput = {
  nombre: string
  ubicacion?: string
  carreraId?: number | null
  capacidad?: number
  responsable?: string
  estado?: string
}

export async function getLaboratorios() {
  return db.select().from(laboratorios).orderBy(asc(laboratorios.nombre))
}

export async function createLaboratorio(data: LaboratorioInput) {
  await getUserId()
  const [row] = await db.insert(laboratorios).values({
    nombre: data.nombre,
    ubicacion: data.ubicacion ?? null,
    carreraId: data.carreraId ?? null,
    capacidad: data.capacidad ?? 30,
    responsable: data.responsable ?? null,
    estado: data.estado ?? 'activo',
  }).returning()
  revalidatePath('/dashboard/laboratorio')
  return row
}

export async function updateLaboratorio(id: number, data: LaboratorioInput) {
  await getUserId()
  const [row] = await db.update(laboratorios).set({
    nombre: data.nombre,
    ubicacion: data.ubicacion ?? null,
    carreraId: data.carreraId ?? null,
    capacidad: data.capacidad ?? 30,
    responsable: data.responsable ?? null,
    estado: data.estado ?? 'activo',
  }).where(eq(laboratorios.id, id)).returning()
  revalidatePath('/dashboard/laboratorio')
  return row
}

export async function deleteLaboratorio(id: number) {
  await getUserId()
  await db.delete(laboratorios).where(eq(laboratorios.id, id))
  revalidatePath('/dashboard/laboratorio')
}

export async function getPracticas() {
  return db.select().from(practicas).orderBy(desc(practicas.createdAt))
}

export async function getPracticaById(id: number) {
  const [row] = await db.select().from(practicas).where(eq(practicas.id, id)).limit(1)
  return row ?? null
}

export async function createPractica(data: PracticaInput) {
  const userId = await getUserId()
  const [row] = await db.insert(practicas).values({
    tema: data.tema,
    subtema: data.subtema ?? null,
    logroAprendizaje: data.logroAprendizaje ?? null,
    laboratorioId: data.laboratorioId,
    carreraId: data.carreraId ?? null,
    materiaId: data.materiaId ?? null,
    periodoId: data.periodoId ?? null,
    docenteId: userId,
    docenteNombre: data.docenteNombre ?? null,
    asignatura: data.asignatura ?? null,
    unidadAcademica: data.unidadAcademica ?? null,
    semestre: data.semestre ?? null,
    institucion: data.institucion ?? null,
    ciudad: data.ciudad ?? null,
    numEstudiantes: data.numEstudiantes ?? null,
    horaEntrada: data.horaEntrada ?? null,
    horaSalida: data.horaSalida ?? null,
    fecha: data.fecha,
    objetivo: data.objetivo ?? null,
    metodologia: data.metodologia ?? null,
    resultados: data.resultados ?? null,
    conclusiones: data.conclusiones ?? null,
    observacionesDetalle: data.observacionesDetalle ?? null,
    equiposUsados: JSON.stringify(data.equipos),
    reactivosUsados: JSON.stringify(data.reactivos),
    asistencia: JSON.stringify(data.asistencia),
    estado: data.estado ?? 'programada',
  }).returning()
  revalidatePath('/dashboard/laboratorio/practicas')
  return row
}

export async function updatePractica(id: number, data: PracticaInput) {
  await getUserId()
  const [row] = await db.update(practicas).set({
    tema: data.tema,
    subtema: data.subtema ?? null,
    logroAprendizaje: data.logroAprendizaje ?? null,
    laboratorioId: data.laboratorioId,
    carreraId: data.carreraId ?? null,
    materiaId: data.materiaId ?? null,
    periodoId: data.periodoId ?? null,
    docenteNombre: data.docenteNombre ?? null,
    asignatura: data.asignatura ?? null,
    unidadAcademica: data.unidadAcademica ?? null,
    semestre: data.semestre ?? null,
    institucion: data.institucion ?? null,
    ciudad: data.ciudad ?? null,
    numEstudiantes: data.numEstudiantes ?? null,
    horaEntrada: data.horaEntrada ?? null,
    horaSalida: data.horaSalida ?? null,
    fecha: data.fecha,
    objetivo: data.objetivo ?? null,
    metodologia: data.metodologia ?? null,
    resultados: data.resultados ?? null,
    conclusiones: data.conclusiones ?? null,
    observacionesDetalle: data.observacionesDetalle ?? null,
    equiposUsados: JSON.stringify(data.equipos),
    reactivosUsados: JSON.stringify(data.reactivos),
    asistencia: JSON.stringify(data.asistencia),
    estado: data.estado ?? 'programada',
  }).where(eq(practicas.id, id)).returning()
  revalidatePath('/dashboard/laboratorio/practicas')
  return row
}

export async function deletePractica(id: number) {
  await getUserId()
  await db.delete(practicas).where(eq(practicas.id, id))
  revalidatePath('/dashboard/laboratorio/practicas')
}
