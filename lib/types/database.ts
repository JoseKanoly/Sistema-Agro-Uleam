// ============================================================
// Tipos del Sistema Académico Universitario (100% mock, sin BD)
// ============================================================

export type Rol =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "COORDINADOR"
  | "PROFESOR"
  | "SECRETARIA"
  | "ESTUDIANTE"

export const ROLES: { value: Rol; label: string }[] = [
  { value: "SUPER_ADMIN", label: "Super Administrador" },
  { value: "ADMIN", label: "Administrador" },
  { value: "COORDINADOR", label: "Coordinador" },
  { value: "PROFESOR", label: "Profesor" },
  { value: "SECRETARIA", label: "Secretaria" },
  { value: "ESTUDIANTE", label: "Estudiante" },
]

export type EstadoBase = "activo" | "inactivo"

export interface Usuario {
  id: number
  nombres: string
  apellidos: string
  correo: string
  cedula: string
  telefono: string
  rol: Rol
  carreraId: number | null
  estado: EstadoBase
  createdAt: string
}

export interface Carrera {
  id: number
  nombre: string
  siglas: string
  facultad: string
  coordinador: string
  estado: EstadoBase
}

export interface PeriodoAcademico {
  id: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  estado: "activo" | "finalizado" | "planificado"
}

export interface Materia {
  id: number
  carreraId: number
  nombre: string
  codigo: string
  creditos: number
  nivel: number
  acd?: number
  ape?: number
  aa?: number
  horas?: number
  docente: string
  activa: boolean
}

export type EstadoEstudiante = "activo" | "retirado" | "egresado"

export interface Estudiante {
  id: number
  nombres: string
  apellidos: string
  cedula: string
  correo: string
  carreraId: number
  nivel: number
  estado: EstadoEstudiante
  promedio: number
}

export interface Matricula {
  id: number
  estudianteId: number
  materiaId: number
  periodoId: number
  estado: "matriculado" | "aprobado" | "reprobado" | "retirado"
  nota: number
}

export interface Falta {
  id: number
  estudianteId: number
  materiaId: number
  fecha: string
  tipo: "injustificada" | "justificada" | "atraso"
  observacion: string
}

export interface Justificacion {
  id: number
  estudianteId: number
  faltaId: number
  motivo: string
  fecha: string
  estado: "pendiente" | "aprobado" | "rechazado"
}

export type EstadoEquipo = "operativo" | "mantenimiento" | "dañado"

export interface Laboratorio {
  id: number
  nombre: string
  ubicacion: string
  carreraId: number
  capacidad: number
  responsable: string
  estado: EstadoBase
}

export interface Equipo {
  id: number
  nombre: string
  codigo: string
  laboratorioId: number
  cantidad: number
  estado: EstadoEquipo
}

export type EstadoReactivo = "disponible" | "bajo_stock" | "agotado"

export interface Reactivo {
  id: number
  nombre: string
  formula: string
  laboratorioId: number
  cantidad: number
  unidad: string
  estado: EstadoReactivo
}

export interface PracticaItem {
  nombre: string
  cantidad: number
}

export interface AsistenciaPractica {
  cedula: string
  estudiante: string
  carrera: string
  asistencia: "presente" | "ausente"
}

export interface Practica {
  id: number
  tema: string
  carreraId: number
  materiaId: number
  periodoId: number
  laboratorioId: number
  docente: string
  fecha: string
  objetivo: string
  fundamento: string
  procedimiento: string
  observaciones: string
  equipos: PracticaItem[]
  reactivos: PracticaItem[]
  asistencia: AsistenciaPractica[]
  estado: "programada" | "realizada" | "cancelada"
}

export interface LiderVinculacion {
  id: number
  nombres: string
  apellidos: string
  correo: string
  carreraId: number
  proyectosActivos: number
}

export interface ActividadVinculacion {
  id: number
  nombre: string
  liderId: number
  empresaId: number
  carreraId: number
  fechaInicio: string
  fechaFin: string
  beneficiarios: number
  estado: "programada" | "en_progreso" | "completado" | "cancelada"
}

export interface EmpresaVinculacion {
  id: number
  nombre: string
  ruc: string
  sector: string
  contacto: string
  telefono: string
  convenios: number
}

export type EstadoTitulacion = "propuesto" | "en_progreso" | "completado"

export interface TemaTitulacion {
  id: number
  titulo: string
  estudiante: string
  tutor: string
  carreraId: number
  modalidad: "proyecto" | "tesis" | "examen_complexivo"
  estado: EstadoTitulacion
  avance: number
}

export interface InformeDocencia {
  id: number
  docente: string
  materiaId: number
  periodoId: number
  tipo: "asignatura" | "silabo"
  fechaEntrega: string
  estado: "pendiente" | "aprobado" | "rechazado"
}

export interface InformeInvestigacion {
  id: number
  titulo: string
  investigador: string
  carreraId: number
  lineaInvestigacion: string
  fecha: string
  estado: "pendiente" | "aprobado" | "rechazado"
}
