import type { TemaTitulacion } from "@/lib/types/database"

export const temasTitulacionMock: TemaTitulacion[] = [
  {
    id: 1,
    titulo: "Análisis de suelos en cultivos de cacao",
    estudiante: "Juan Pérez García",
    tutor: "Dr. Carlos Mendoza",
    carreraId: 1,
    modalidad: "proyecto",
    estado: "en_progreso",
    avance: 45,
  },
  {
    id: 2,
    titulo: "Evaluación de vacunas en bovinos lecheros",
    estudiante: "Roberto Flores Moreno",
    tutor: "Dra. Elena Rodríguez",
    carreraId: 2,
    modalidad: "tesis",
    estado: "propuesto",
    avance: 10,
  },
]
