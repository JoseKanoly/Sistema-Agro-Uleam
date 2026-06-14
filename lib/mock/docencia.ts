import type { InformeDocencia, InformeInvestigacion } from "@/lib/types/database"

export const informesDocenciaMock: InformeDocencia[] = [
  {
    id: 1,
    docente: "Dr. Carlos Mendoza",
    materiaId: 1,
    periodoId: 1,
    tipo: "silabo",
    fechaEntrega: "2025-03-05",
    estado: "aprobado",
  },
  {
    id: 2,
    docente: "Dra. Elena Rodríguez",
    materiaId: 2,
    periodoId: 1,
    tipo: "asignatura",
    fechaEntrega: "2025-03-08",
    estado: "pendiente",
  },
]

export const informesInvestigacionMock: InformeInvestigacion[] = [
  {
    id: 1,
    titulo: "Avance en biotecnología agrícola",
    investigador: "Dr. Carlos Mendoza",
    carreraId: 1,
    lineaInvestigacion: "Biotecnología vegetal",
    fecha: "2025-03-01",
    estado: "pendiente",
  },
]
