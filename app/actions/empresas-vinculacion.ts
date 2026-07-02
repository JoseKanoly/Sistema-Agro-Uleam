'use server'

import { db } from '@/lib/db'
import { empresasVinculacion } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserId } from './auth'

export type EmpresaInput = {
  nombre: string
  ruc?: string
  sector?: string
  contacto?: string
  telefono?: string
}

export async function getEmpresasVinculacion() {
  return db
    .select()
    .from(empresasVinculacion)
    .orderBy(asc(empresasVinculacion.nombre))
}

export async function createEmpresaVinculacion(
  data: EmpresaInput
) {
  await getUserId()

  const [row] = await db
    .insert(empresasVinculacion)
    .values({
      nombre: data.nombre,
      ruc: data.ruc ?? null,
      sector: data.sector ?? null,
      contacto: data.contacto ?? null,
      telefono: data.telefono ?? null,
    })
    .returning()

  revalidatePath('/dashboard/vinculacion')

  return row
}

export async function updateEmpresaVinculacion(
  id: number,
  data: EmpresaInput
) {
  await getUserId()

  const [row] = await db
    .update(empresasVinculacion)
    .set({
      nombre: data.nombre,
      ruc: data.ruc ?? null,
      sector: data.sector ?? null,
      contacto: data.contacto ?? null,
      telefono: data.telefono ?? null,
    })
    .where(eq(empresasVinculacion.id, id))
    .returning()

  revalidatePath('/dashboard/vinculacion')

  return row
}

export async function deleteEmpresaVinculacion(
  id: number
) {
  await getUserId()

  await db
    .delete(empresasVinculacion)
    .where(eq(empresasVinculacion.id, id))

  revalidatePath('/dashboard/vinculacion')
}