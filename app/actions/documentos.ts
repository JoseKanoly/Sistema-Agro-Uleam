'use server'

import { db } from '@/lib/db'
import { archivos, convocatorias, documentosEstudiante, user } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentPerfil, getUserId } from './auth'
import { crearNotificacion } from './notificaciones'

export type ConvocatoriaInput = {
  titulo: string
  descripcion?: string
  modulo: string
  tipoDocumento: string
  fechaInicio: string
  fechaFin: string
  estado?: string
}

export async function getConvocatorias() {
  return db.select().from(convocatorias).orderBy(desc(convocatorias.createdAt))
}

export async function getConvocatoriasActivas() {
  const all = await getConvocatorias()
  return all.filter((c) => c.estado === 'activa')
}

export async function createConvocatoria(data: ConvocatoriaInput) {
  const userId = await getUserId()
  const perfil = await getCurrentPerfil()
  const rol = perfil?.perfil?.rol?.toUpperCase()
  if (!rol || !['SUPER_ADMIN', 'ADMIN', 'SECRETARIA'].includes(rol)) {
    throw new Error('No autorizado')
  }
  const [row] = await db.insert(convocatorias).values({
    titulo: data.titulo,
    descripcion: data.descripcion ?? null,
    modulo: data.modulo,
    tipoDocumento: data.tipoDocumento,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin,
    creadoPor: userId,
    estado: data.estado ?? 'activa',
  }).returning()
  revalidatePath('/dashboard/fechas-limite')
  return row
}

export async function updateConvocatoria(id: number, data: ConvocatoriaInput) {
  await getUserId()
  const [row] = await db.update(convocatorias).set({
    titulo: data.titulo,
    descripcion: data.descripcion ?? null,
    modulo: data.modulo,
    tipoDocumento: data.tipoDocumento,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin,
    estado: data.estado ?? 'activa',
  }).where(eq(convocatorias.id, id)).returning()
  revalidatePath('/dashboard/fechas-limite')
  return row
}

export async function deleteConvocatoria(id: number) {
  await getUserId()
  await db.delete(convocatorias).where(eq(convocatorias.id, id))
  revalidatePath('/dashboard/fechas-limite')
}

export async function getArchivosPendientesRevision() {
  const rows = await db.select().from(archivos).orderBy(desc(archivos.createdAt))
  const users = await db.select({ id: user.id, name: user.name, email: user.email }).from(user)
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))
  return rows.map((a) => ({
    ...a,
    usuario: userMap[a.userId] ?? { name: 'Desconocido', email: '' },
  }))
}

export async function getMisArchivos() {
  const userId = await getUserId()
  return db.select().from(archivos).where(eq(archivos.userId, userId)).orderBy(desc(archivos.createdAt))
}

export async function registrarArchivo(data: {
  nombre: string
  tipo: string
  archivoUrl: string
  convocatoriaId?: number
  grupoId?: number
  requisitoId?: number
}) {
  const userId = await getUserId()
  const [row] = await db.insert(archivos).values({
    userId,
    nombre: data.nombre,
    tipo: data.tipo,
    archivoUrl: data.archivoUrl,
    convocatoriaId: data.convocatoriaId ?? null,
    grupoId: data.grupoId ?? null,
    requisitoId: data.requisitoId ?? null,
    estado: 'pendiente',
  }).returning()

  // Mantener compatibilidad con documentos_estudiante para estudiantes
  const perfil = await getCurrentPerfil()
  if (perfil?.perfil?.rol?.toUpperCase() === 'ESTUDIANTE') {
    await db.insert(documentosEstudiante).values({
      estudianteId: userId,
      nombre: data.nombre,
      tipo: data.tipo,
      archivoUrl: data.archivoUrl,
      estado: 'pendiente',
    })
  }

  revalidatePath('/dashboard/mis-documentos')
  revalidatePath('/dashboard/revision/documentos')
  return row
}

export async function revisarArchivo(id: number, estado: 'aprobado' | 'rechazado', observacion?: string) {
  const userId = await getUserId()
  const perfil = await getCurrentPerfil()
  const rol = perfil?.perfil?.rol?.toUpperCase()
  if (!rol || !['SUPER_ADMIN', 'ADMIN', 'SECRETARIA'].includes(rol)) {
    throw new Error('No autorizado')
  }
  const [row] = await db.update(archivos).set({
    estado,
    revisadoPor: userId,
    observacion: observacion ?? null,
  }).where(eq(archivos.id, id)).returning()

  if (row) {
    const titulo = estado === 'aprobado' ? 'Documento aprobado' : 'Documento rechazado'
    const mensaje =
      estado === 'aprobado'
        ? `Tu documento "${row.nombre}" fue aprobado.`
        : `Tu documento "${row.nombre}" fue rechazado. ${observacion ? `Observación: ${observacion}` : ''}`

    await crearNotificacion({
      destinatarioId: row.userId,
      titulo,
      mensaje,
      tipo: estado === 'aprobado' ? 'success' : 'error',
    })
  }

  revalidatePath('/dashboard/revision/documentos')
  return row
}
