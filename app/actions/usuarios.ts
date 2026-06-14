'use server'

import { db } from '@/lib/db'
import { user, perfiles, carreras } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentPerfil } from './auth'
import type { Rol } from '@/lib/types/database'

const ROLES_GESTION = ['SUPER_ADMIN', 'ADMIN', 'SECRETARIA'] as const

async function assertCanManageUsers() {
  const data = await getCurrentPerfil()
  const rol = data?.perfil?.rol?.toUpperCase()
  if (!rol || !ROLES_GESTION.includes(rol as typeof ROLES_GESTION[number])) {
    throw new Error('No autorizado')
  }
}

export type UsuarioSistema = {
  userId: string
  perfilId: number | null
  nombre: string
  email: string
  rol: Rol
  carreraId: number | null
  esTutorTitulacion: boolean
  esInvestigador: boolean
  createdAt: Date
}

export async function getUsuariosSistema(): Promise<UsuarioSistema[]> {
  await assertCanManageUsers()

  const [users, perfilesList] = await Promise.all([
    db.select().from(user).orderBy(desc(user.createdAt)),
    db.select().from(perfiles),
  ])

  const perfilMap = Object.fromEntries(perfilesList.map((p) => [p.userId, p]))

  return users.map((u) => {
    const perfil = perfilMap[u.id]
    const rol = (perfil?.rol ?? 'ESTUDIANTE').toUpperCase() as Rol
    return {
      userId: u.id,
      perfilId: perfil?.id ?? null,
      nombre: u.name,
      email: u.email,
      rol,
      carreraId: perfil?.carreraId ?? null,
      esTutorTitulacion: perfil?.esTutorTitulacion ?? false,
      esInvestigador: perfil?.esInvestigador ?? false,
      createdAt: u.createdAt,
    }
  })
}

export async function getCarrerasList() {
  await assertCanManageUsers()
  return db.select().from(carreras).orderBy(carreras.nombre)
}

export type UpdatePerfilInput = {
  rol: Rol
  carreraId?: number | null
  esTutorTitulacion?: boolean
  esInvestigador?: boolean
}

export async function updateUsuarioPerfil(userId: string, data: UpdatePerfilInput) {
  await assertCanManageUsers()

  const [existing] = await db
    .select()
    .from(perfiles)
    .where(eq(perfiles.userId, userId))
    .limit(1)

  const values = {
    rol: data.rol,
    carreraId: data.carreraId ?? null,
    esTutorTitulacion: data.esTutorTitulacion ?? false,
    esInvestigador: data.esInvestigador ?? false,
  }

  if (existing) {
    await db.update(perfiles).set(values).where(eq(perfiles.userId, userId))
  } else {
    await db.insert(perfiles).values({ userId, ...values })
  }

  revalidatePath('/dashboard/admin/usuarios')
  revalidatePath('/dashboard')
}
