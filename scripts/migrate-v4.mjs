import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const connectionString =
  process.env.DATABASE_URL

const alterStatements = [
  `ALTER TABLE "materias" ADD COLUMN IF NOT EXISTS "acd" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "materias" ADD COLUMN IF NOT EXISTS "ape" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "materias" ADD COLUMN IF NOT EXISTS "aa" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "materias" ADD COLUMN IF NOT EXISTS "horas" INTEGER NOT NULL DEFAULT 0`,
]

async function main() {
  const pool = new pg.Pool({ connectionString, ssl: false })
  try {
    for (const sql of alterStatements) {
      await pool.query(sql)
    }
    console.log('Migración v4 aplicada: columnas acd, ape, aa, horas en materias.')

    const seedSql = readFileSync(join(__dirname, 'seed-carreras-materias.sql'), 'utf8')
    await pool.query(seedSql)
    console.log('Seed de carreras y materias aplicado correctamente.')
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Error en migración v4:', err.message)
  process.exit(1)
})
