import pg from 'pg'

const connectionString =
  process.env.DATABASE_URL

const statements = [
  `ALTER TABLE "perfiles" ADD COLUMN IF NOT EXISTS "esTutorTitulacion" BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE "perfiles" ADD COLUMN IF NOT EXISTS "esInvestigador" BOOLEAN NOT NULL DEFAULT FALSE`,
]

async function main() {
  const pool = new pg.Pool({ connectionString, ssl: false })
  try {
    for (const sql of statements) {
      await pool.query(sql)
    }
    console.log('Migración v3 aplicada correctamente.')
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Error en migración:', err.message)
  process.exit(1)
})
