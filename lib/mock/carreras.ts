import type { Carrera } from "@/lib/types/database"

export const carrerasMock: Carrera[] = [
  {
    id: 1,
    nombre: "Ingeniería Agronómica",
    siglas: "IAgr",
    facultad: "Ciencias Agrícolas",
    coordinador: "Dr. Carlos Mendoza",
    estado: "activo",
  },
  {
    id: 2,
    nombre: "Medicina Veterinaria",
    siglas: "MVet",
    facultad: "Ciencias Agrícolas",
    coordinador: "Dra. Elena Rodríguez",
    estado: "activo",
  },
]
