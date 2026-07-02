import pg from 'pg'

const connectionString = process.env.DATABASE_URL

const statements = [
  `CREATE TABLE IF NOT EXISTS "empresas_vinculacion" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT,
    "sector" TEXT,
    "contacto" TEXT,
    "telefono" TEXT,
    "createdat" TIMESTAMP DEFAULT NOW()
  )`,

  `ALTER TABLE "proyectos_vinculacion"
   ADD COLUMN IF NOT EXISTS "empresaid" INTEGER`,

  `ALTER TABLE "proyectos_vinculacion"
   ADD COLUMN IF NOT EXISTS "lideruserid" TEXT`,
]

async function main() {
  const pool = new pg.Pool({
    connectionString,
    ssl: false,
  })

  try {
    for (const sql of statements) {
      await pool.query(sql)
    }

    console.log('Migración v6 aplicada correctamente.')
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Error en migración v6:', err.message)
  process.exit(1)
})