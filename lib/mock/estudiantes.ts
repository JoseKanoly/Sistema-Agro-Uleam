import type { Estudiante } from "@/lib/types/database"

export const estudiantesMock: Estudiante[] = [
  {
    id: 1,
    nombres: "Juan",
    apellidos: "Pérez García",
    cedula: "0956789012",
    correo: "juan.perez@local.test",
    carreraId: 1,
    nivel: 3,
    estado: "activo",
    promedio: 8.5,
  },
  {
    id: 2,
    nombres: "María",
    apellidos: "López Sánchez",
    cedula: "0967890123",
    correo: "maria.lopez@local.test",
    carreraId: 1,
    nivel: 2,
    estado: "activo",
    promedio: 9.1,
  },
  {
    id: 3,
    nombres: "Roberto",
    apellidos: "Flores Moreno",
    cedula: "0978901234",
    correo: "roberto.flores@local.test",
    carreraId: 2,
    nivel: 4,
    estado: "activo",
    promedio: 7.8,
  },
]
