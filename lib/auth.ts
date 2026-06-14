import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'
import { db } from '@/lib/db'
import { perfiles } from '@/lib/db/schema'

const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'
const isLocal = baseURL.includes('localhost') || baseURL.includes('127.0.0.1')

export const auth = betterAuth({
  database: pool,
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET ?? 'sispaa-local-dev-secret-32chars-min',
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  advanced: isLocal
    ? {
        defaultCookieAttributes: {
          sameSite: 'lax',
          secure: false,
        },
      }
    : undefined,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(perfiles).values({
            userId: user.id,
            rol: 'ESTUDIANTE',
          })
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
})
