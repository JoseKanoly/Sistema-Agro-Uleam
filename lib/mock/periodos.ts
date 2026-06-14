import type { PeriodoAcademico } from "@/lib/types/database"

export const periodosMock: PeriodoAcademico[] = [
  {
    id: 1,
    nombre: "2025-I",
    fechaInicio: "2025-03-01",
    fechaFin: "2025-07-15",
    estado: "activo",
  },
  {
    id: 2,
    nombre: "2024-II",
    fechaInicio: "2024-09-01",
    fechaFin: "2025-01-31",
    estado: "finalizado",
  },
]
