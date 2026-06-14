import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarRange,
  BookOpen,
  GraduationCap,
  FlaskConical,
  Handshake,
  Award,
  FileText,
  Microscope,
  Bell,
  UserCircle,
  ClipboardCheck,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react"
import type { Rol } from "@/lib/types/database"

export interface NavChild {
  label: string
  href: string
}

export interface NavItem {
  label: string
  icon: LucideIcon
  href?: string
  children?: NavChild[]
  roles: Rol[]
}

const ALL: Rol[] = ["SUPER_ADMIN", "ADMIN", "COORDINADOR", "PROFESOR", "SECRETARIA", "ESTUDIANTE"]
const ADMINS: Rol[] = ["SUPER_ADMIN", "ADMIN"]
const GESTION: Rol[] = ["SUPER_ADMIN", "ADMIN", "COORDINADOR"]

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ALL },

  {
    label: "Docencia",
    icon: BookOpen,
    roles: [...GESTION, "PROFESOR", "SECRETARIA"],
    children: [
      { label: "Informes de asignatura", href: "/dashboard/informes" },
      { label: "Silabos", href: "/dashboard/silabos" },
    ],
  },
  {
    label: "Investigacion",
    icon: Microscope,
    roles: [...GESTION, "PROFESOR"],
    children: [
      { label: "Informes de investigacion", href: "/dashboard/investigacion" },
      { label: "Lineas de investigacion", href: "/dashboard/investigacion/lineas" },
    ],
  },
  {
    label: "Estudiantes",
    icon: GraduationCap,
    roles: [...GESTION, "PROFESOR", "SECRETARIA"],
    children: [
      { label: "Panel general", href: "/dashboard/estudiantes" },
      { label: "Matriculados", href: "/dashboard/estudiantes/matriculados" },
      { label: "Faltas", href: "/dashboard/estudiantes/faltas" },
      { label: "Justificaciones", href: "/dashboard/estudiantes/justificaciones" },
    ],
  },
  {
    label: "Laboratorio",
    icon: FlaskConical,
    roles: [...GESTION, "PROFESOR", "SECRETARIA"],
    children: [
      { label: "Dashboard", href: "/dashboard/laboratorio" },
      { label: "Practicas", href: "/dashboard/laboratorio/practicas" },
      { label: "Equipos", href: "/dashboard/laboratorio/equipos" },
      { label: "Reactivos", href: "/dashboard/laboratorio/reactivos" },
    ],
  },
  {
    label: "Vinculacion",
    icon: Handshake,
    roles: [...GESTION, "PROFESOR"],
    children: [
      { label: "Lideres", href: "/dashboard/vinculacion" },
      { label: "Actividades", href: "/dashboard/vinculacion/actividades" },
      { label: "Empresas", href: "/dashboard/vinculacion/empresas" },
    ],
  },
  {
    label: "Titulacion",
    icon: Award,
    roles: [...GESTION, "PROFESOR"],
    children: [
      { label: "Temas", href: "/dashboard/titulacion" },
      { label: "Investigacion", href: "/dashboard/investigacion" },
    ],
  },


  { label: "Usuarios", icon: Users, href: "/dashboard/usuarios", roles: ADMINS },
  { label: "Carreras", icon: Building2, href: "/dashboard/carreras", roles: GESTION },
  { label: "Materias", icon: FileText, href: "/dashboard/materias", roles: GESTION },
  { label: "Periodos", icon: CalendarRange, href: "/dashboard/periodos", roles: ADMINS },

  { label: "Notificaciones", icon: Bell, href: "/dashboard/notificaciones", roles: ALL },
  { label: "Perfil", icon: UserCircle, href: "/dashboard/perfil", roles: ALL },
]

export const ROLE_LABELS: Record<Rol, string> = {
  SUPER_ADMIN: "Super Administrador",
  ADMIN: "Administrador",
  COORDINADOR: "Coordinador",
  PROFESOR: "Profesor",
  SECRETARIA: "Secretaria",
  ESTUDIANTE: "Estudiante",
}

export function navForRole(rol: Rol): NavItem[] {
  return navItems
    .filter((item) => item.roles.includes(rol))
    .map((item) => ({ ...item }))
}
