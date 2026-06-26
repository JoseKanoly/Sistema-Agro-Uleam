'use server'

import { db } from '@/lib/db'
import { gruposDocumentos, requisitosGrupo, perfiles, user, archivos } from '@/lib/db/schema'
import { eq, asc, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentPerfil, getUserId } from './auth'
import { getUserFolderName, ensureUserFolder } from '@/lib/storage/usuario'
import { enviarNotificacionesPorRoles } from './notificaciones'

export async function getGruposDocumentos() {
  const grupos = await db
    .select()
    .from(gruposDocumentos)
    .orderBy(asc(gruposDocumentos.nombre))

  const requisitos = await db
    .select()
    .from(requisitosGrupo)
    .orderBy(asc(requisitosGrupo.orden))

  return grupos.map((g) => ({
    ...g,
    requisitos: requisitos.filter((r) => r.grupoId === g.id && r.activo),
  }))
}

export async function getGruposActivos() {
  const all = await getGruposDocumentos()
  return all.filter((g) => g.activo)
}

async function initGrupoFoldersForAllUsers(grupoNombre: string) {
  const estudiantes = await db
    .select({ userId: perfiles.userId, cedula: perfiles.cedula })
    .from(perfiles)
    .where(eq(perfiles.rol, 'ESTUDIANTE'))

  const users = await db.select({ id: user.id, name: user.name }).from(user)
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  for (const est of estudiantes) {
    if (!est.cedula) continue
    const u = userMap[est.userId]
    if (!u) continue
    await ensureUserFolder(u.name, est.cedula, grupoNombre)
  }
}

export async function createGrupoDocumentos(data: {
  nombre: string
  descripcion?: string
  requisitos: string[]
}) {
  const perfil = await getCurrentPerfil()
  const rol = perfil?.perfil?.rol?.toUpperCase()
  if (!rol || !['SUPER_ADMIN', 'ADMIN', 'SECRETARIA'].includes(rol)) {
    throw new Error('No autorizado')
  }

  const nombre = data.nombre.trim()
  if (!nombre) throw new Error('Nombre del grupo requerido')

  const [grupo] = await db
    .insert(gruposDocumentos)
    .values({
      nombre,
      descripcion: data.descripcion?.trim() || null,
      activo: true,
    })
    .returning()

  const requisitos = data.requisitos.filter((r) => r.trim())
  for (let i = 0; i < requisitos.length; i++) {
    await db.insert(requisitosGrupo).values({
      grupoId: grupo.id,
      nombre: requisitos[i].trim(),
      orden: i + 1,
      activo: true,
    })
  }

  await initGrupoFoldersForAllUsers(nombre)

  await enviarNotificacionesPorRoles({
    titulo: `Nuevo grupo de documentos: ${nombre}`,
    mensaje: `Se activó el grupo "${nombre}". Entra a Mis Documentos y sube los archivos solicitados.`,
    tipo: 'info',
    roles: ['ESTUDIANTE'],
  })

  revalidatePath('/dashboard/admin/grupos-documentos')
  revalidatePath('/dashboard/mis-documentos')
  return grupo
}

export async function addRequisitoGrupo(grupoId: number, nombre: string) {
  await getUserId()
  const trimmed = nombre.trim()
  if (!trimmed) throw new Error('Nombre requerido')

  const existing = await db
    .select()
    .from(requisitosGrupo)
    .where(eq(requisitosGrupo.grupoId, grupoId))

  const [row] = await db
    .insert(requisitosGrupo)
    .values({
      grupoId,
      nombre: trimmed,
      orden: existing.length + 1,
      activo: true,
    })
    .returning()

  revalidatePath('/dashboard/admin/grupos-documentos')
  revalidatePath('/dashboard/mis-documentos')
  return row
}

export async function deleteGrupoDocumentos(id: number) {
  await getUserId()
  await db.update(gruposDocumentos).set({ activo: false }).where(eq(gruposDocumentos.id, id))
  revalidatePath('/dashboard/admin/grupos-documentos')
}

export async function getMisDocumentosPorGrupo() {
  const data = await getCurrentPerfil()
  if (!data?.user) throw new Error('No autorizado')

  const grupos = await getGruposActivos()
  const misArchivos = await db
    .select()
    .from(archivos)
    .where(eq(archivos.userId, data.user.id))
    .orderBy(desc(archivos.createdAt))

  const folderName = data.perfil?.cedula
    ? getUserFolderName(data.user.name, data.perfil.cedula)
    : null

  return {
    user: data.user,
    cedula: data.perfil?.cedula ?? null,
    folderName,
    grupos,
    archivos: misArchivos,
  }
}
