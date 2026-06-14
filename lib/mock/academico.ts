import type { Matricula, Falta, Justificacion } from "@/lib/types/database"

export const matriculasMock: Matricula[] = [
  { id: 1, estudianteId: 1, materiaId: 1, periodoId: 1, estado: "matriculado", nota: 0 },
  { id: 2, estudianteId: 1, materiaId: 2, periodoId: 1, estado: "matriculado", nota: 0 },
  { id: 3, estudianteId: 2, materiaId: 1, periodoId: 1, estado: "matriculado", nota: 0 },
  { id: 4, estudianteId: 3, materiaId: 3, periodoId: 1, estado: "matriculado", nota: 0 },
]

export const faltasMock: Falta[] = [
  {
    id: 1,
    estudianteId: 1,
    materiaId: 1,
    fecha: "2025-03-10",
    tipo: "injustificada",
    observacion: "Ausencia sin aviso",
  },
  {
    id: 2,
    estudianteId: 2,
    materiaId: 1,
    fecha: "2025-03-12",
    tipo: "atraso",
    observacion: "Llegó 15 minutos tarde",
  },
]

export const justificacionesMock: Justificacion[] = [
  {
    id: 1,
    estudianteId: 1,
    faltaId: 1,
    motivo: "Consulta médica",
    fecha: "2025-03-11",
    estado: "pendiente",
  },
]
