import type { Materia } from "@/lib/types/database"

export const materiasMock: Materia[] = [
  {
    id: 1,
    carreraId: 1,
    nombre: "Botánica General",
    codigo: "BOT-101",
    creditos: 4,
    nivel: 1,
    docente: "Dr. Carlos Mendoza",
    activa: true,
  },
  {
    id: 2,
    carreraId: 1,
    nombre: "Química Orgánica",
    codigo: "QUI-201",
    creditos: 5,
    nivel: 2,
    docente: "Dra. Elena Rodríguez",
    activa: true,
  },
  {
    id: 3,
    carreraId: 2,
    nombre: "Anatomía Veterinaria",
    codigo: "ANV-101",
    creditos: 4,
    nivel: 1,
    docente: "Dr. Carlos Mendoza",
    activa: true,
  },
]
