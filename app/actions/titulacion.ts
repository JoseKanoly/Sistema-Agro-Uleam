'use server'

import { db } from '@/lib/db'
import { temasTitulacion } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserId } from './auth'

export type TemaTitulacionInput = {
  titulo: string
  estudianteId: string
  tutor?: string
  carreraId?: number | null
  modalidad: string
  estado?: string
  avance?: number
}

export async function getTemasTitulacion() {
  return db.select().from(temasTitulacion).orderBy(desc(temasTitulacion.createdAt))
}

export async function createTemaTitulacion(data: TemaTitulacionInput) {
  await getUserId()
  const [row] = await db.insert(temasTitulacion).values({
    titulo: data.titulo,
    estudianteId: data.estudianteId,
    tutor: data.tutor ?? null,
    carreraId: data.carreraId ?? null,
    modalidad: data.modalidad,
    estado: data.estado ?? 'propuesto',
    avance: data.avance ?? 0,
  }).returning()
  revalidatePath('/dashboard/titulacion')
  return row
}

export async function updateTemaTitulacion(id: number, data: TemaTitulacionInput) {
  await getUserId()
  const [row] = await db.update(temasTitulacion).set({
    titulo: data.titulo,
    estudianteId: data.estudianteId,
    tutor: data.tutor ?? null,
    carreraId: data.carreraId ?? null,
    modalidad: data.modalidad,
    estado: data.estado ?? 'propuesto',
    avance: data.avance ?? 0,
  }).where(eq(temasTitulacion.id, id)).returning()
  revalidatePath('/dashboard/titulacion')
  return row
}

export async function deleteTemaTitulacion(id: number) {
  await getUserId()
  await db.delete(temasTitulacion).where(eq(temasTitulacion.id, id))
  revalidatePath('/dashboard/titulacion')
}
