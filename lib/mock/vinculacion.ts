import type {
  LiderVinculacion,
  ActividadVinculacion,
  EmpresaVinculacion,
} from "@/lib/types/database"

export const lideresVinculacionMock: LiderVinculacion[] = [
  {
    id: 1,
    nombres: "Carlos",
    apellidos: "Mendoza",
    correo: "carlos.mendoza@local.test",
    carreraId: 1,
    proyectosActivos: 2,
  },
]

export const actividadesVinculacionMock: ActividadVinculacion[] = [
  {
    id: 1,
    nombre: "Prácticas preprofesionales en finca modelo",
    liderId: 1,
    empresaId: 1,
    carreraId: 1,
    fechaInicio: "2025-05-01",
    fechaFin: "2025-07-31",
    beneficiarios: 15,
    estado: "programada",
  },
]

export const empresasVinculacionMock: EmpresaVinculacion[] = [
  {
    id: 1,
    nombre: "Agroindustrias del Pacífico",
    ruc: "1790123456001",
    sector: "Agroindustria",
    contacto: "Ing. Luis Torres",
    telefono: "0995555555",
    convenios: 3,
  },
]
