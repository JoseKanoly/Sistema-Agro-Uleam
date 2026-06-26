'use server'

import { db } from '@/lib/db'
import { notificaciones, perfiles } from '@/lib/db/schema'
import { eq, inArray, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserId } from './auth'

export type TipoNotificacion = 'info' | 'success' | 'warning' | 'error'

function mapTipo(tipo: string): TipoNotificacion {
  if (tipo === 'advertencia') return 'warning'
  if (tipo === 'urgente') return 'error'
  if (tipo === 'success' || tipo === 'warning' || tipo === 'error' || tipo === 'info') return tipo
  return 'info'
}

export async function crearNotificacion(data: {
  destinatarioId: string
  titulo: string
  mensaje: string
  tipo?: string
}) {
  const [row] = await db
    .insert(notificaciones)
    .values({
      destinatarioId: data.destinatarioId,
      titulo: data.titulo,
      mensaje: data.mensaje,
      tipo: mapTipo(data.tipo ?? 'info'),
      leida: false,
    })
    .returning()

  revalidatePath('/dashboard/notificaciones')
  return row
}

export async function enviarNotificacionesPorRoles(data: {
  titulo: string
  mensaje: string
  tipo: string
  roles: string[]
}) {
  const userId = await getUserId()
  const roles = data.roles.map((r) => r.toUpperCase())

  const destinatarios = await db
    .select({ userId: perfiles.userId })
    .from(perfiles)
    .where(inArray(perfiles.rol, roles))

  const uniqueIds = [...new Set(destinatarios.map((d) => d.userId).filter((id) => id !== userId))]

  if (uniqueIds.length === 0) {
    return { enviados: 0 }
  }

  const tipo = mapTipo(data.tipo)
  await db.insert(notificaciones).values(
    uniqueIds.map((destinatarioId) => ({
      destinatarioId,
      titulo: data.titulo,
      mensaje: data.mensaje,
      tipo,
      leida: false,
    })),
  )

  revalidatePath('/dashboard/notificaciones')
  revalidatePath('/dashboard/notificaciones-masivas')
  return { enviados: uniqueIds.length }
}

export async function getHistorialMasivas() {
  const rows = await db
    .select()
    .from(notificaciones)
    .orderBy(desc(notificaciones.createdAt))
    .limit(100)

  const grouped = new Map<string, { titulo: string; mensaje: string; tipo: string; fecha: string; roles: string[] }>()

  for (const row of rows) {
    const key = `${row.titulo}|${row.mensaje}|${row.createdAt.toISOString().slice(0, 16)}`
    if (!grouped.has(key)) {
      grouped.set(key, {
        titulo: row.titulo,
        mensaje: row.mensaje,
        tipo: row.tipo,
        fecha: row.createdAt.toISOString().split('T')[0],
        roles: [],
      })
    }
  }

  return Array.from(grouped.values()).slice(0, 20)
}

export async function getNotificacionesNoLeidasCount() {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(notificaciones)
    .where(eq(notificaciones.destinatarioId, userId))

  return rows.filter((r) => !r.leida).length
}
