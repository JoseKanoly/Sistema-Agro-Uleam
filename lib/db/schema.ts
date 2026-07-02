import { pgTable, text, timestamp, boolean, integer, real, serial } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const perfiles = pgTable('perfiles', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  rol: text('rol').notNull().default('ESTUDIANTE'),
  cedula: text('cedula'),
  carreraId: integer('carreraId'),
  esTutorTitulacion: boolean('esTutorTitulacion').notNull().default(false),
  esInvestigador: boolean('esInvestigador').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const carreras = pgTable('carreras', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  siglas: text('siglas').notNull(),
  facultad: text('facultad').notNull(),
  coordinador: text('coordinador'),
  activa: boolean('activa').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const materias = pgTable('materias', {
  id: serial('id').primaryKey(),
  carreraId: integer('carreraId').notNull(),
  nombre: text('nombre').notNull(),
  codigo: text('codigo').notNull(),
  creditos: integer('creditos').notNull().default(3),
  nivel: integer('nivel').notNull().default(1),
  acd: integer('acd').notNull().default(0),
  ape: integer('ape').notNull().default(0),
  aa: integer('aa').notNull().default(0),
  horas: integer('horas').notNull().default(0),
  docente: text('docente'),
  activa: boolean('activa').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const periodos = pgTable('periodos', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  fechaInicio: text('fechaInicio').notNull(),
  fechaFin: text('fechaFin').notNull(),
  estado: text('estado').notNull().default('planificado'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const matriculas = pgTable('matriculas', {
  id: serial('id').primaryKey(),
  estudianteId: text('estudianteId').notNull(),
  materiaId: integer('materiaId').notNull(),
  periodoId: integer('periodoId').notNull(),
  estado: text('estado').notNull().default('matriculado'),
  nota: real('nota'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const faltas = pgTable('faltas', {
  id: serial('id').primaryKey(),
  estudianteId: text('estudianteId').notNull(),
  materiaId: integer('materiaId').notNull(),
  fecha: text('fecha').notNull(),
  tipo: text('tipo').notNull().default('injustificada'),
  observacion: text('observacion'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const justificaciones = pgTable('justificaciones', {
  id: serial('id').primaryKey(),
  solicitanteId: text('solicitanteId').notNull(),
  faltaId: integer('faltaId'),
  motivo: text('motivo').notNull(),
  fecha: text('fecha').notNull(),
  estado: text('estado').notNull().default('pendiente'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const silabos = pgTable('silabos', {
  id: serial('id').primaryKey(),
  docenteId: text('docenteId').notNull(),
  materiaId: integer('materiaId').notNull(),
  periodoId: integer('periodoId').notNull(),
  estado: text('estado').notNull().default('pendiente'),
  archivoUrl: text('archivoUrl'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const informes = pgTable('informes', {
  id: serial('id').primaryKey(),
  docenteId: text('docenteId').notNull(),
  materiaId: integer('materiaId').notNull(),
  periodoId: integer('periodoId').notNull(),
  tipo: text('tipo').notNull().default('asignatura'),
  estado: text('estado').notNull().default('pendiente'),
  archivoUrl: text('archivoUrl'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const documentosEstudiante = pgTable('documentos_estudiante', {
  id: serial('id').primaryKey(),
  estudianteId: text('estudianteId').notNull(),
  nombre: text('nombre').notNull(),
  tipo: text('tipo').notNull(),
  estado: text('estado').notNull().default('pendiente'),
  archivoUrl: text('archivoUrl'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const proyectosVinculacion = pgTable('proyectos_vinculacion', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  liderUserId: text('lideruserid'),
  empresaId: integer('empresaid'),
  nombre: text('nombre').notNull(),
  beneficiarios: integer('beneficiarios')
    .notNull()
    .default(0),
  carreraId: integer('carreraId'),
  estado: text('estado')
    .notNull()
    .default('programada'),
  fechaInicio: text('fechaInicio'),
  fechaFin: text('fechaFin'),
  createdAt: timestamp('createdAt')
    .notNull()
    .defaultNow(),
})

export const empresasVinculacion = pgTable('empresas_vinculacion', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  ruc: text('ruc'),
  sector: text('sector'),
  contacto: text('contacto'),
  telefono: text('telefono'),
  createdAt: timestamp('createdat').defaultNow(),
})

export const proyectosInvestigacion = pgTable('proyectos_investigacion', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  titulo: text('titulo').notNull(),
  lineaInvestigacion: text('lineaInvestigacion'),
  carreraId: integer('carreraId'),
  estado: text('estado').notNull().default('pendiente'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const hitosInvestigacion = pgTable('hitos_investigacion', {
  id: serial('id').primaryKey(),
  proyectoId: integer('proyectoId').notNull(),
  userId: text('userId').notNull(),
  descripcion: text('descripcion').notNull(),
  fecha: text('fecha').notNull(),
  estado: text('estado').notNull().default('pendiente'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const temasTitulacion = pgTable('temas_titulacion', {
  id: serial('id').primaryKey(),
  estudianteId: text('estudianteId').notNull(),
  titulo: text('titulo').notNull(),
  tutor: text('tutor'),
  carreraId: integer('carreraId'),
  modalidad: text('modalidad').notNull().default('proyecto'),
  estado: text('estado').notNull().default('propuesto'),
  avance: integer('avance').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const laboratorios = pgTable('laboratorios', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  ubicacion: text('ubicacion'),
  carreraId: integer('carreraId'),
  capacidad: integer('capacidad').notNull().default(30),
  responsable: text('responsable'),
  estado: text('estado').notNull().default('activo'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const equipos = pgTable('equipos', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  codigo: text('codigo').notNull(),
  laboratorioId: integer('laboratorioId').notNull(),
  cantidad: integer('cantidad').notNull().default(1),
  estado: text('estado').notNull().default('operativo'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const reactivos = pgTable('reactivos', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  formula: text('formula'),
  laboratorioId: integer('laboratorioId').notNull(),
  cantidad: real('cantidad').notNull().default(0),
  unidad: text('unidad').notNull().default('g'),
  estado: text('estado').notNull().default('disponible'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const gruposDocumentos = pgTable('grupos_documentos', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const requisitosGrupo = pgTable('requisitos_grupo', {
  id: serial('id').primaryKey(),
  grupoId: integer('grupoId').notNull(),
  nombre: text('nombre').notNull(),
  orden: integer('orden').notNull().default(0),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const convocatorias = pgTable('convocatorias', {
  id: serial('id').primaryKey(),
  titulo: text('titulo').notNull(),
  descripcion: text('descripcion'),
  modulo: text('modulo').notNull().default('Academico'),
  tipoDocumento: text('tipoDocumento').notNull().default('general'),
  fechaInicio: text('fechaInicio').notNull(),
  fechaFin: text('fechaFin').notNull(),
  creadoPor: text('creadoPor').notNull(),
  estado: text('estado').notNull().default('activa'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const archivos = pgTable('archivos', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  convocatoriaId: integer('convocatoriaId'),
  grupoId: integer('grupoId'),
  requisitoId: integer('requisitoId'),
  nombre: text('nombre').notNull(),
  tipo: text('tipo').notNull(),
  archivoUrl: text('archivoUrl').notNull(),
  estado: text('estado').notNull().default('pendiente'),
  revisadoPor: text('revisadoPor'),
  observacion: text('observacion'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const practicas = pgTable('practicas', {
  id: serial('id').primaryKey(),
  tema: text('tema').notNull(),
  subtema: text('subtema'),
  logroAprendizaje: text('logroAprendizaje'),
  carreraId: integer('carreraId'),
  materiaId: integer('materiaId'),
  periodoId: integer('periodoId'),
  laboratorioId: integer('laboratorioId').notNull(),
  docenteId: text('docenteId').notNull(),
  docenteNombre: text('docenteNombre'),
  asignatura: text('asignatura'),
  unidadAcademica: text('unidadAcademica'),
  semestre: text('semestre'),
  institucion: text('institucion'),
  ciudad: text('ciudad'),
  numEstudiantes: integer('numEstudiantes'),
  horaEntrada: text('horaEntrada'),
  horaSalida: text('horaSalida'),
  fecha: text('fecha').notNull(),
  objetivo: text('objetivo'),
  metodologia: text('metodologia'),
  resultados: text('resultados'),
  conclusiones: text('conclusiones'),
  observacionesDetalle: text('observacionesDetalle'),
  equiposUsados: text('equiposUsados'),
  reactivosUsados: text('reactivosUsados'),
  asistencia: text('asistencia'),
  estado: text('estado').notNull().default('programada'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const notificaciones = pgTable('notificaciones', {
  id: serial('id').primaryKey(),
  destinatarioId: text('destinatarioId').notNull(),
  titulo: text('titulo').notNull(),
  mensaje: text('mensaje').notNull(),
  tipo: text('tipo').notNull().default('info'),
  leida: boolean('leida').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})