import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está configurada. Cree un archivo .env.local con la conexión a PostgreSQL.')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
})

export const db = drizzle(pool, { schema })
