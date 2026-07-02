'use server'

import { db } from '@/lib/db'
import { proyectosVinculacion } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserId } from './auth'

export type ProyectoVinculacionInput = {
  nombre: string
  empresaId?: number | null
  liderUserId?: string | null
  beneficiarios?: number
  carreraId?: number | null
  estado?: string
  fechaInicio?: string
  fechaFin?: string
}

export async function getProyectosVinculacion() {
  return db
    .select()
    .from(proyectosVinculacion)
    .orderBy(desc(proyectosVinculacion.createdAt))
}

export async function createProyectoVinculacion(
  data: ProyectoVinculacionInput
) {
  const userId = await getUserId()

  const [row] = await db
    .insert(proyectosVinculacion)
    .values({
      userId,
      liderUserId: data.liderUserId ?? null,
      empresaId: data.empresaId ?? null,
      nombre: data.nombre,
      beneficiarios: data.beneficiarios ?? 0,
      carreraId: data.carreraId ?? null,
      estado: data.estado ?? 'programada',
      fechaInicio: data.fechaInicio ?? null,
      fechaFin: data.fechaFin ?? null,
    })
    .returning()

  revalidatePath('/dashboard/vinculacion')

  return row
}

export async function updateProyectoVinculacion(
  id: number,
  data: ProyectoVinculacionInput
) {
  await getUserId()

  const [row] = await db
    .update(proyectosVinculacion)
    .set({
      liderUserId: data.liderUserId ?? null,
      empresaId: data.empresaId ?? null,
      nombre: data.nombre,
      beneficiarios: data.beneficiarios ?? 0,
      carreraId: data.carreraId ?? null,
      estado: data.estado ?? 'programada',
      fechaInicio: data.fechaInicio ?? null,
      fechaFin: data.fechaFin ?? null,
    })
    .where(eq(proyectosVinculacion.id, id))
    .returning()

  revalidatePath('/dashboard/vinculacion')

  return row
}

export async function deleteProyectoVinculacion(id: number) {
  await getUserId()

  await db
    .delete(proyectosVinculacion)
    .where(eq(proyectosVinculacion.id, id))

  revalidatePath('/dashboard/vinculacion')
}