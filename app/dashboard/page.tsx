import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { db } from "@/lib/db"
import {
  perfiles, carreras, practicas, temasTitulacion, archivos,
  laboratorios, convocatorias, user, informes, proyectosInvestigacion,
  hitosInvestigacion, proyectosVinculacion, matriculas, faltas, silabos,
} from "@/lib/db/schema"
import { eq, count, and } from "drizzle-orm"
import {
  Feather, Search, BookOpen, FlaskConical, Handshake, GraduationCap,
  Users, Building2, UserCheck, Clock, Bell, FileText,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import type { Rol } from "@/lib/types/database"

// ---------- helpers ----------
const n = (r: { c: number }[]) => r[0]?.c ?? 0

async function getAdminStats() {
  const [
    informesCumplidos,
    informesPendientes,
    informesIncumplidos,
    proyectosActivos,
    hitosAvanzados,
    hitosRevision,
    estudiantesActivos,
    estudiantesRetirados,
    faltasRegistradas,
    practicasTotal,
    practicasAgropecuaria,
    practicasAgronegocios,
    practicasAgroindustria,
    vinculacionTotal,
    vinculacionEjecutadas,
    vinculacionPendientes,
    titulacionTotal,
    titulacionGraduados,
    titulacionRevision,
    // Quick stats para header
    // totalUsuarios,
    // totalEstudiantes,
    // totalProfesores,
    // totalCarreras,
    // docsPendientes,
  ] = await Promise.all([
    db.select({ c: count() }).from(informes).where(eq(informes.estado, "aprobado")),
    db.select({ c: count() }).from(informes).where(eq(informes.estado, "pendiente")),
    db.select({ c: count() }).from(informes).where(eq(informes.estado, "rechazado")),
    db.select({ c: count() }).from(proyectosInvestigacion).where(eq(proyectosInvestigacion.estado, "activo")),
    db.select({ c: count() }).from(hitosInvestigacion).where(eq(hitosInvestigacion.estado, "aprobado")),
    db.select({ c: count() }).from(hitosInvestigacion).where(eq(hitosInvestigacion.estado, "en_revision")),
    db.select({ c: count() }).from(perfiles).where(eq(perfiles.rol, "ESTUDIANTE")),
    db.select({ c: count() }).from(matriculas).where(eq(matriculas.estado, "retirado")),
    db.select({ c: count() }).from(faltas),
    db.select({ c: count() }).from(practicas),
    db.select({ c: count() }).from(practicas).where(eq(practicas.unidadAcademica, "Agropecuaria")),
    db.select({ c: count() }).from(practicas).where(eq(practicas.unidadAcademica, "Agronegocios")),
    db.select({ c: count() }).from(practicas).where(eq(practicas.unidadAcademica, "Agroindustria")),
    db.select({ c: count() }).from(proyectosVinculacion),
    db.select({ c: count() }).from(proyectosVinculacion).where(eq(proyectosVinculacion.estado, "ejecutado")),
    db.select({ c: count() }).from(proyectosVinculacion).where(eq(proyectosVinculacion.estado, "programada")),
    db.select({ c: count() }).from(temasTitulacion),
    db.select({ c: count() }).from(temasTitulacion).where(eq(temasTitulacion.estado, "aprobado")),
    db.select({ c: count() }).from(temasTitulacion).where(eq(temasTitulacion.estado, "en_revision")),
    db.select({ c: count() }).from(user),
    db.select({ c: count() }).from(perfiles).where(eq(perfiles.rol, "ESTUDIANTE")),
    db.select({ c: count() }).from(perfiles).where(eq(perfiles.rol, "PROFESOR")),
    db.select({ c: count() }).from(carreras),
    db.select({ c: count() }).from(archivos).where(eq(archivos.estado, "pendiente")),
  ])

  const totalInformes = n(informesCumplidos) + n(informesPendientes) + n(informesIncumplidos)
  const pctDocencia = totalInformes > 0
    ? Math.round((n(informesCumplidos) / totalInformes) * 100)
    : 0

  const totalSilabos = await db.select({ c: count() }).from(silabos)
  const silabosCumplidos = await db.select({ c: count() }).from(silabos).where(eq(silabos.estado, "aprobado"))
  const pctInvestigacion = n(totalSilabos) > 0
    ? Math.round((n(silabosCumplidos) / n(totalSilabos)) * 100)
    : 0

  return {
    docencia: {
      main: `${pctDocencia}%`,
      label: "Cumplimiento",
      cumplidos: n(informesCumplidos),
      pendientes: n(informesPendientes),
      incumplidos: n(informesIncumplidos),
    },
    investigacion: {
      main: `${pctInvestigacion}%`,
      label: "Informes Subidos",
      proyectosActivos: n(proyectosActivos),
      hitosAvanzados: n(hitosAvanzados),
      enRevision: n(hitosRevision),
    },
    estudiantes: {
      main: n(estudiantesActivos),
      label: "Matriculados",
      activos: n(estudiantesActivos),
      retirados: n(estudiantesRetirados),
      faltas: n(faltasRegistradas),
    },
    practicas: {
      main: n(practicasTotal),
      label: "Realizadas",
      agropecuaria: n(practicasAgropecuaria),
      agronegocios: n(practicasAgronegocios),
      agroindustria: n(practicasAgroindustria),
    },
    vinculacion: {
      main: n(vinculacionTotal),
      label: "Actividades",
      ejecutadas: n(vinculacionEjecutadas),
      pendientes: n(vinculacionPendientes),
      empresas: 0, // no hay tabla de empresas aún
    },
    titulacion: {
      main: n(titulacionTotal),
      label: "En Progreso",
      enDesarrollo: n(titulacionTotal),
      graduados: n(titulacionGraduados),
      pendientesRevision: n(titulacionRevision),
    },
    // quick: {
    //   usuarios: n(totalUsuarios),
    //   estudiantes: n(totalEstudiantes),
    //   profesores: n(totalProfesores),
    //   carreras: n(totalCarreras),
    //   docsPendientes: n(docsPendientes),
    // },
  }
}

// ---------- Indicator Card ----------
interface DetailRow {
  label: string
  value: string | number
  color?: string
}

interface IndicatorCardProps {
  title: string
  mainValue: string | number
  mainLabel: string
  iconBg: string
  icon: React.ElementType
  details: DetailRow[]
}

function IndicatorCard({ title, mainValue, mainLabel, iconBg, icon: Icon, details }: IndicatorCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#D9D9D9] bg-[#D9D9D9] transition-shadow hover:shadow-md">
      {/* Top section */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#353535]/80">{title}</p>
          <p className="mt-2 text-4xl font-bold text-[#353535]">{mainValue}</p>
          <p className="mt-1 text-xs text-[#353535]/60">{mainLabel}</p>
        </div>
        <div className={`flex items-center justify-center rounded-xl p-3 text-white ${iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {/* Divider + details */}
      <div className="border-none bg-[#D9D9D9] px-6 py-4">
        <div className="space-y-2">
          {details.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-[#353535]/75">{d.label}</span>
              <span className={d.color ?? "font-semibold text-[#353535]"}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------- Small stat card (for students/professor view) ----------
function SmallStatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#D9D9D9] bg-[#D9D9D9] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-[#353535]">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: color + "18" }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </div>
  )
}

// ---------- Page ----------
export default async function DashboardPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const rawRol = (data.perfil?.rol ?? "ESTUDIANTE").toUpperCase()
  const rol: Rol = ["SUPER_ADMIN", "ADMIN", "COORDINADOR", "PROFESOR", "SECRETARIA", "ESTUDIANTE"].includes(rawRol)
    ? (rawRol as Rol) : "ESTUDIANTE"

  const isStaff = ["SUPER_ADMIN", "ADMIN", "SECRETARIA", "COORDINADOR"].includes(rol)
  const stats = isStaff ? await getAdminStats() : null

  const studentLinks = [
    { name: "Mi Perfil", href: "/dashboard/perfil", icon: GraduationCap },
    { name: "Mis Asistencias", href: "/dashboard/mis-asistencias", icon: BookOpen },
    { name: "Notificaciones", href: "/dashboard/notificaciones", icon: Bell },
    { name: "Mis Documentos", href: "/dashboard/mis-documentos", icon: FileText },
  ]

  const professorLinks = [
    { name: "Mis Silabos", href: "/dashboard/silabos", icon: FileText },
    { name: "Mis Informes", href: "/dashboard/informes", icon: BookOpen },
    { name: "Investigación", href: "/dashboard/investigacion", icon: FlaskConical },
    { name: "Notificaciones", href: "/dashboard/notificaciones", icon: Bell },
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-base font-normal text-[#353535]">Bienvenido, {data.user.name}</h1>

      {/* ── STAFF: indicadores del prototipo ── */}
      {isStaff && stats && (
        <>
          {/* Quick stats row */}
          {/* <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <SmallStatCard label="Usuarios" value={stats.quick.usuarios} icon={Users} color="#3C6E71" />
            <SmallStatCard label="Estudiantes" value={stats.quick.estudiantes} icon={GraduationCap} color="#536493" />
            <SmallStatCard label="Profesores" value={stats.quick.profesores} icon={UserCheck} color="#72c184" />
            <SmallStatCard label="Carreras" value={stats.quick.carreras} icon={Building2} color="#D4A373" />
            <SmallStatCard label="Docs. Pendientes" value={stats.quick.docsPendientes} icon={Clock} color="#ef4444" />
          </div> */}

          {/* Indicator cards grid — 2 rows × 3 cols */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <IndicatorCard
              title="Docencia"
              mainValue={stats.docencia.main}
              mainLabel={stats.docencia.label}
              iconBg="bg-blue-500"
              icon={Feather}
              details={[
                { label: "Informes Cumplidos", value: stats.docencia.cumplidos, color: "font-bold text-green-600" },
                { label: "Informes Pendientes", value: stats.docencia.pendientes, color: "font-bold text-yellow-600" },
                { label: "Informes Incumplidos", value: stats.docencia.incumplidos, color: "font-bold text-red-600" },
              ]}
            />
            <IndicatorCard
              title="Investigación"
              mainValue={stats.investigacion.main}
              mainLabel={stats.investigacion.label}
              iconBg="bg-purple-500"
              icon={Search}
              details={[
                { label: "Proyectos Activos", value: stats.investigacion.proyectosActivos },
                { label: "Hitos Avanzados", value: stats.investigacion.hitosAvanzados },
                { label: "En Revisión", value: stats.investigacion.enRevision },
              ]}
            />
            <IndicatorCard
              title="Estudiantes"
              mainValue={stats.estudiantes.main}
              mainLabel={stats.estudiantes.label}
              iconBg="bg-green-500"
              icon={BookOpen}
              details={[
                { label: "Activos", value: stats.estudiantes.activos },
                { label: "Retirados", value: stats.estudiantes.retirados },
                { label: "Faltas Registradas", value: stats.estudiantes.faltas },
              ]}
            />
            <IndicatorCard
              title="Prácticas de Laboratorio"
              mainValue={stats.practicas.main}
              mainLabel={stats.practicas.label}
              iconBg="bg-orange-500"
              icon={FlaskConical}
              details={[
                { label: "Agropecuaria", value: stats.practicas.agropecuaria },
                { label: "Agronegocios", value: stats.practicas.agronegocios },
                { label: "Agroindustria", value: stats.practicas.agroindustria },
              ]}
            />
            <IndicatorCard
              title="Vinculación"
              mainValue={stats.vinculacion.main}
              mainLabel={stats.vinculacion.label}
              iconBg="bg-red-500"
              icon={Handshake}
              details={[
                { label: "Ejecutadas", value: stats.vinculacion.ejecutadas },
                { label: "Pendientes", value: stats.vinculacion.pendientes },
                { label: "Empresas Beneficiadas", value: stats.vinculacion.empresas },
              ]}
            />
            <IndicatorCard
              title="Titulación"
              mainValue={stats.titulacion.main}
              mainLabel={stats.titulacion.label}
              iconBg="bg-indigo-500"
              icon={GraduationCap}
              details={[
                { label: "Temas en Desarrollo", value: stats.titulacion.enDesarrollo },
                { label: "Graduados", value: stats.titulacion.graduados },
                { label: "Pendientes de Revisión", value: stats.titulacion.pendientesRevision },
              ]}
            />
          </div>

          {/* Action cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/admin/usuarios">
              <div className="cursor-pointer rounded-xl border border-[#D9D9D9] bg-white p-5 transition-shadow hover:shadow-md">
                <p className="font-semibold text-[#353535]">Gestión de usuarios</p>
                <p className="mt-2 text-xs text-[#6B7280]">Administrar roles y accesos</p>
              </div>
            </Link>
            <Link href="/dashboard/revision/documentos">
              <div className="cursor-pointer rounded-xl border border-[#D9D9D9] bg-white p-5 transition-shadow hover:shadow-md">
                <p className="font-semibold text-[#353535]">Revisar documentos</p>
                {/* <p className="mt-2 text-xs text-[#6B7280]">{stats.quick.docsPendientes} pendiente(s) de aprobación</p> */}
              </div>
            </Link>
            <Link href="/dashboard/fechas-limite">
              <div className="cursor-pointer rounded-xl border border-[#D9D9D9] bg-white p-5 transition-shadow hover:shadow-md">
                <p className="font-semibold text-[#353535]">Convocatorias</p>
                <p className="mt-2 text-xs text-[#6B7280]">Gestionar fechas y convocatorias activas</p>
              </div>
            </Link>
          </div>
        </>
      )}

      {/* ── ESTUDIANTE ── */}
      {rol === "ESTUDIANTE" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {studentLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <div className="cursor-pointer rounded-xl border border-[#D9D9D9] bg-white p-6 transition-shadow hover:shadow-lg flex flex-col items-center text-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3C6E71]/10">
                    <Icon className="h-5 w-5 text-[#3C6E71]" />
                  </div>
                  <p className="text-sm font-medium text-[#353535]">{item.name}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* ── PROFESOR ── */}
      {rol === "PROFESOR" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {professorLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <div className="cursor-pointer rounded-xl border border-[#D9D9D9] bg-white p-6 transition-shadow hover:shadow-lg flex flex-col items-center text-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3C6E71]/10">
                    <Icon className="h-5 w-5 text-[#3C6E71]" />
                  </div>
                  <p className="text-sm font-medium text-[#353535]">{item.name}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
