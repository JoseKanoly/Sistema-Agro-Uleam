import { createService } from "./create-service"
import { carrerasMock } from "@/lib/mock/carreras"
import { usuariosMock } from "@/lib/mock/users"
import { periodosMock } from "@/lib/mock/periodos"
import { materiasMock } from "@/lib/mock/materias"
import { estudiantesMock } from "@/lib/mock/estudiantes"
import { matriculasMock, faltasMock, justificacionesMock } from "@/lib/mock/academico"
import { laboratoriosMock, equiposMock, reactivosMock, practicasMock } from "@/lib/mock/laboratorio"
import { lideresVinculacionMock, actividadesVinculacionMock, empresasVinculacionMock } from "@/lib/mock/vinculacion"
import { temasTitulacionMock } from "@/lib/mock/titulacion"
import { informesDocenciaMock, informesInvestigacionMock } from "@/lib/mock/docencia"

export const CarreraService = createService(carrerasMock)
export const UsuarioService = createService(usuariosMock)
export const PeriodoService = createService(periodosMock)
export const MateriaService = createService(materiasMock)
export const EstudianteService = createService(estudiantesMock)
export const MatriculaService = createService(matriculasMock)
export const FaltaService = createService(faltasMock)
export const JustificacionService = createService(justificacionesMock)
export const LaboratorioService = createService(laboratoriosMock)
export const EquipoService = createService(equiposMock)
export const ReactivoService = createService(reactivosMock)
export const PracticaService = createService(practicasMock)
export const LiderVinculacionService = createService(lideresVinculacionMock)
export const ActividadVinculacionService = createService(actividadesVinculacionMock)
export const EmpresaVinculacionService = createService(empresasVinculacionMock)
export const TitulacionService = createService(temasTitulacionMock)
export const DocenciaService = createService(informesDocenciaMock)
export const InvestigacionService = createService(informesInvestigacionMock)
