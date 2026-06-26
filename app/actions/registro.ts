'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { perfiles, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { ensureUserFolder } from '@/lib/storage/usuario'
import { crearNotificacion } from './notificaciones'

export async function registerEstudiante(data: {
  name: string
  email: string
  password: string
  cedula: string
}) {
  const cedula = data.cedula.trim()
  if (!cedula || cedula.length < 10) {
    return { error: 'La cédula debe tener al menos 10 dígitos' }
  }

  const [cedulaExistente] = await db
    .select()
    .from(perfiles)
    .where(eq(perfiles.cedula, cedula))
    .limit(1)

  if (cedulaExistente) {
    return { error: 'Esta cédula ya está registrada en el sistema' }
  }

  const res = await auth.api.signUpEmail({
    body: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    },
    headers: await headers(),
  })

  if (res.error) {
    return { error: res.error.message || 'No se pudo completar el registro' }
  }

  const [createdUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, data.email.trim().toLowerCase()))
    .limit(1)

  if (!createdUser) {
    return { error: 'Usuario creado pero no se encontró en la base de datos' }
  }

  await db
    .update(perfiles)
    .set({ cedula })
    .where(eq(perfiles.userId, createdUser.id))

  await ensureUserFolder(createdUser.name, cedula)

  await crearNotificacion({
    destinatarioId: createdUser.id,
    titulo: 'Bienvenido a SISPAA',
    mensaje: 'Tu cuenta fue creada. Revisa Mis Documentos para subir los archivos de los grupos activos (ej. SGA).',
    tipo: 'success',
  })

  return { success: true }
}
