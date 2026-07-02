'use server'

import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export async function getLideresVinculacion() {
  return db
    .select({
      id: user.id,
      nombre: user.name,
      correo: user.email,
    })
    .from(user)
    .orderBy(asc(user.name))
}