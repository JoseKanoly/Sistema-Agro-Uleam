import pg from 'pg'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://postgres:2026@localhost:5432/postgres'

const statements = [
  `ALTER TABLE "perfiles" ADD COLUMN IF NOT EXISTS "cedula" TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "perfiles_cedula_unique" ON "perfiles" ("cedula") WHERE "cedula" IS NOT NULL`,
  `CREATE TABLE IF NOT EXISTS "grupos_documentos" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "requisitos_grupo" (
    "id" SERIAL PRIMARY KEY,
    "grupoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `ALTER TABLE "archivos" ADD COLUMN IF NOT EXISTS "grupoId" INTEGER`,
  `ALTER TABLE "archivos" ADD COLUMN IF NOT EXISTS "requisitoId" INTEGER`,
]

async function seedDefaultGrupo(pool) {
  const existing = await pool.query(`SELECT id FROM grupos_documentos WHERE nombre = 'SGA' LIMIT 1`)
  if (existing.rows.length > 0) return

  const grupo = await pool.query(
    `INSERT INTO grupos_documentos (nombre, descripcion, activo) VALUES ('SGA', 'Sistema de Gestión Académica - documentos de matrícula', TRUE) RETURNING id`,
  )
  const grupoId = grupo.rows[0].id
  const requisitos = [
    'Cédula de identidad',
    'Título de bachiller',
    'Inscripción',
    'Foto carnet',
    'Certificado de votación',
  ]
  for (let i = 0; i < requisitos.length; i++) {
    await pool.query(
      `INSERT INTO requisitos_grupo ("grupoId", nombre, orden, activo) VALUES ($1, $2, $3, TRUE)`,
      [grupoId, requisitos[i], i + 1],
    )
  }
  console.log('Grupo SGA de ejemplo creado con requisitos.')
}

async function main() {
  const pool = new pg.Pool({ connectionString, ssl: false })
  try {
    for (const sql of statements) {
      await pool.query(sql)
    }
    await seedDefaultGrupo(pool)
    console.log('Migración v5 aplicada correctamente.')
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Error en migración v5:', err.message)
  process.exit(1)
})
