-- Better Auth tables
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "image" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMP NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- App tables
CREATE TABLE IF NOT EXISTS "perfiles" (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "rol" TEXT NOT NULL DEFAULT 'ESTUDIANTE',
  "cedula" TEXT,
  "carreraId" INTEGER,
  "esTutorTitulacion" BOOLEAN NOT NULL DEFAULT FALSE,
  "esInvestigador" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "carreras" (
  "id" SERIAL PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "siglas" TEXT NOT NULL,
  "facultad" TEXT NOT NULL,
  "coordinador" TEXT,
  "activa" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "materias" (
  "id" SERIAL PRIMARY KEY,
  "carreraId" INTEGER NOT NULL,
  "nombre" TEXT NOT NULL,
  "codigo" TEXT NOT NULL,
  "creditos" INTEGER NOT NULL DEFAULT 3,
  "nivel" INTEGER NOT NULL DEFAULT 1,
  "acd" INTEGER NOT NULL DEFAULT 0,
  "ape" INTEGER NOT NULL DEFAULT 0,
  "aa" INTEGER NOT NULL DEFAULT 0,
  "horas" INTEGER NOT NULL DEFAULT 0,
  "docente" TEXT,
  "activa" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "periodos" (
  "id" SERIAL PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "fechaInicio" TEXT NOT NULL,
  "fechaFin" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'planificado',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "matriculas" (
  "id" SERIAL PRIMARY KEY,
  "estudianteId" TEXT NOT NULL,
  "materiaId" INTEGER NOT NULL,
  "periodoId" INTEGER NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'matriculado',
  "nota" REAL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "faltas" (
  "id" SERIAL PRIMARY KEY,
  "estudianteId" TEXT NOT NULL,
  "materiaId" INTEGER NOT NULL,
  "fecha" TEXT NOT NULL,
  "tipo" TEXT NOT NULL DEFAULT 'injustificada',
  "observacion" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "justificaciones" (
  "id" SERIAL PRIMARY KEY,
  "solicitanteId" TEXT NOT NULL,
  "faltaId" INTEGER,
  "motivo" TEXT NOT NULL,
  "fecha" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "silabos" (
  "id" SERIAL PRIMARY KEY,
  "docenteId" TEXT NOT NULL,
  "materiaId" INTEGER NOT NULL,
  "periodoId" INTEGER NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "archivoUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "informes" (
  "id" SERIAL PRIMARY KEY,
  "docenteId" TEXT NOT NULL,
  "materiaId" INTEGER NOT NULL,
  "periodoId" INTEGER NOT NULL,
  "tipo" TEXT NOT NULL DEFAULT 'asignatura',
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "archivoUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "documentos_estudiante" (
  "id" SERIAL PRIMARY KEY,
  "estudianteId" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "archivoUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "proyectos_vinculacion" (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "carreraId" INTEGER,
  "estado" TEXT NOT NULL DEFAULT 'programada',
  "fechaInicio" TEXT,
  "fechaFin" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "proyectos_investigacion" (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "lineaInvestigacion" TEXT,
  "carreraId" INTEGER,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "hitos_investigacion" (
  "id" SERIAL PRIMARY KEY,
  "proyectoId" INTEGER NOT NULL,
  "userId" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "fecha" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "temas_titulacion" (
  "id" SERIAL PRIMARY KEY,
  "estudianteId" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "tutor" TEXT,
  "carreraId" INTEGER,
  "modalidad" TEXT NOT NULL DEFAULT 'proyecto',
  "estado" TEXT NOT NULL DEFAULT 'propuesto',
  "avance" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "laboratorios" (
  "id" SERIAL PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "ubicacion" TEXT,
  "carreraId" INTEGER,
  "capacidad" INTEGER NOT NULL DEFAULT 30,
  "responsable" TEXT,
  "estado" TEXT NOT NULL DEFAULT 'activo',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "equipos" (
  "id" SERIAL PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "codigo" TEXT NOT NULL,
  "laboratorioId" INTEGER NOT NULL,
  "cantidad" INTEGER NOT NULL DEFAULT 1,
  "estado" TEXT NOT NULL DEFAULT 'operativo',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "reactivos" (
  "id" SERIAL PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "formula" TEXT,
  "laboratorioId" INTEGER NOT NULL,
  "cantidad" REAL NOT NULL DEFAULT 0,
  "unidad" TEXT NOT NULL DEFAULT 'g',
  "estado" TEXT NOT NULL DEFAULT 'disponible',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "practicas" (
  "id" SERIAL PRIMARY KEY,
  "tema" TEXT NOT NULL,
  "carreraId" INTEGER,
  "materiaId" INTEGER,
  "periodoId" INTEGER,
  "laboratorioId" INTEGER NOT NULL,
  "docenteId" TEXT NOT NULL,
  "fecha" TEXT NOT NULL,
  "objetivo" TEXT,
  "estado" TEXT NOT NULL DEFAULT 'programada',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "notificaciones" (
  "id" SERIAL PRIMARY KEY,
  "destinatarioId" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "mensaje" TEXT NOT NULL,
  "tipo" TEXT NOT NULL DEFAULT 'info',
  "leida" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
