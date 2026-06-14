import type {
  Laboratorio,
  Equipo,
  Reactivo,
  Practica,
} from "@/lib/types/database"

export const laboratoriosMock: Laboratorio[] = [
  {
    id: 1,
    nombre: "Laboratorio de Botánica",
    ubicacion: "Edificio A - Piso 2",
    carreraId: 1,
    capacidad: 30,
    responsable: "Dr. Carlos Mendoza",
    estado: "activo",
  },
  {
    id: 2,
    nombre: "Laboratorio de Química",
    ubicacion: "Edificio B - Piso 1",
    carreraId: 1,
    capacidad: 25,
    responsable: "Dra. Elena Rodríguez",
    estado: "activo",
  },
]

export const equiposMock: Equipo[] = [
  {
    id: 1,
    nombre: "Microscopio binocular",
    codigo: "MIC-001",
    laboratorioId: 1,
    cantidad: 10,
    estado: "operativo",
  },
  {
    id: 2,
    nombre: "Balanza analítica",
    codigo: "BAL-001",
    laboratorioId: 2,
    cantidad: 5,
    estado: "operativo",
  },
]

export const reactivosMock: Reactivo[] = [
  {
    id: 1,
    nombre: "Etanol",
    formula: "C2H5OH",
    laboratorioId: 2,
    cantidad: 500,
    unidad: "ml",
    estado: "disponible",
  },
  {
    id: 2,
    nombre: "Yoduro de potasio",
    formula: "KI",
    laboratorioId: 2,
    cantidad: 50,
    unidad: "g",
    estado: "bajo_stock",
  },
]

export const practicasMock: Practica[] = [
  {
    id: 1,
    tema: "Identificación de especies vegetales",
    carreraId: 1,
    materiaId: 1,
    periodoId: 1,
    laboratorioId: 1,
    docente: "Dr. Carlos Mendoza",
    fecha: "2025-04-15",
    objetivo: "Reconocer especies locales mediante observación microscópica",
    fundamento: "La morfología celular permite clasificar plantas",
    procedimiento: "Recolección, montaje y observación al microscopio",
    observaciones: "",
    equipos: [{ nombre: "Microscopio binocular", cantidad: 1 }],
    reactivos: [],
    asistencia: [
      {
        cedula: "0956789012",
        estudiante: "Juan Pérez García",
        carrera: "Ingeniería Agronómica",
        asistencia: "presente",
      },
    ],
    estado: "programada",
  },
]
