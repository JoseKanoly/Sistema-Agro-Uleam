'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { perfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function getCurrentPerfil() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const [perfil] = await db
    .select()
    .from(perfiles)
    .where(eq(perfiles.userId, session.user.id))
    .limit(1)

  return { user: session.user, perfil: perfil ?? null }
}

export async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}
