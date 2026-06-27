import pg from 'pg'

const connectionString =
  process.env.DATABASE_URL
const statements = [
  `CREATE TABLE IF NOT EXISTS "convocatorias" (
    "id" SERIAL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "modulo" TEXT NOT NULL DEFAULT 'Academico',
    "tipoDocumento" TEXT NOT NULL DEFAULT 'general',
    "fechaInicio" TEXT NOT NULL,
    "fechaFin" TEXT NOT NULL,
    "creadoPor" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "archivos" (
    "id" SERIAL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "convocatoriaId" INTEGER,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "revisadoPor" TEXT,
    "observacion" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "subtema" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "logroAprendizaje" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "docenteNombre" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "asignatura" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "unidadAcademica" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "semestre" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "institucion" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "ciudad" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "numEstudiantes" INTEGER`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "horaEntrada" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "horaSalida" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "metodologia" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "resultados" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "conclusiones" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "observacionesDetalle" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "equiposUsados" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "reactivosUsados" TEXT`,
  `ALTER TABLE "practicas" ADD COLUMN IF NOT EXISTS "asistencia" TEXT`,
]

async function main() {
  const pool = new pg.Pool({ connectionString, ssl: false })
  try {
    for (const sql of statements) {
      await pool.query(sql)
    }
    console.log('Migración v2 aplicada correctamente.')
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Error en migración:', err.message)
  process.exit(1)
})
