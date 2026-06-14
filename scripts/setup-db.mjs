import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://postgres:2026@localhost:5432/postgres'

async function main() {
  const pool = new pg.Pool({ connectionString, ssl: false })
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8')

  try {
    await pool.query(sql)
    console.log('Base de datos configurada correctamente.')
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Error al configurar la base de datos:', err.message)
  process.exit(1)
})
