"use server"

import { db } from "@/lib/db"
import { notificaciones } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { getUserId } from "@/app/actions/auth"

export async function getNotificaciones() {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(notificaciones)
    .where(eq(notificaciones.destinatarioId, userId))
    .orderBy(desc(notificaciones.createdAt))
    .limit(50)

  return rows.map((r) => ({
    id: r.id,
    titulo: r.titulo,
    mensaje: r.mensaje,
    tipo: r.tipo,
    leida: r.leida,
    createdAt: r.createdAt.toISOString(),
  }))
}

export async function marcarLeida(id: number) {
  const userId = await getUserId()
  await db
    .update(notificaciones)
    .set({ leida: true })
    .where(and(eq(notificaciones.id, id), eq(notificaciones.destinatarioId, userId)))
}

export async function marcarTodasLeidas() {
  const userId = await getUserId()
  await db
    .update(notificaciones)
    .set({ leida: true })
    .where(eq(notificaciones.destinatarioId, userId))
}
