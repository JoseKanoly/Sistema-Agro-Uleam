import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentPerfil } from "@/app/actions/auth"
import { db } from "@/lib/db"
import {
  perfiles, carreras, practicas, temasTitulacion, archivos,
  laboratorios, convocatorias, user,
} from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users, Building2, FlaskConical, Trophy, FileText, Bell,
  GraduationCap, BookOpen, UserCheck, Clock,
} from "lucide-react"
import type { Rol } from "@/lib/types/database"

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number | string; icon: React.ElementType; color: string
}) {
  return (
    <Card className="border-[#e2e8f0]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-[#0f172a] mt-1">{value}</p>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "18" }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

async function getAdminStats() {
  const [
    totalUsuarios,
    totalEstudiantes,
    totalProfesores,
    totalCarreras,
    totalLabs,
    totalPracticas,
    totalTitulacion,
    docsPendientes,
    convocatoriasActivas,
  ] = await Promise.all([
    db.select({ c: count() }).from(user),
    db.select({ c: count() }).from(perfiles).where(eq(perfiles.rol, "ESTUDIANTE")),
    db.select({ c: count() }).from(perfiles).where(eq(perfiles.rol, "PROFESOR")),
    db.select({ c: count() }).from(carreras),
    db.select({ c: count() }).from(laboratorios),
    db.select({ c: count() }).from(practicas),
    db.select({ c: count() }).from(temasTitulacion),
    db.select({ c: count() }).from(archivos).where(eq(archivos.estado, "pendiente")),
    db.select({ c: count() }).from(convocatorias).where(eq(convocatorias.estado, "activa")),
  ])
  const n = (r: { c: number }[]) => r[0]?.c ?? 0
  return {
    usuarios: n(totalUsuarios),
    estudiantes: n(totalEstudiantes),
    profesores: n(totalProfesores),
    carreras: n(totalCarreras),
    laboratorios: n(totalLabs),
    practicas: n(totalPracticas),
    titulacion: n(totalTitulacion),
    docsPendientes: n(docsPendientes),
    convocatorias: n(convocatoriasActivas),
  }
}

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
    <div className="space-y-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Bienvenido, {data.user.name}</h1>
        <p className="text-[#64748b] mt-1">Sistema Académico de Gestión Integral — SISPAA</p>
      </div>

      {isStaff && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Usuarios" value={stats.usuarios} icon={Users} color="#1a6b3c" />
            <StatCard label="Estudiantes" value={stats.estudiantes} icon={GraduationCap} color="#3b82f6" />
            <StatCard label="Profesores" value={stats.profesores} icon={UserCheck} color="#22c55e" />
            <StatCard label="Carreras" value={stats.carreras} icon={Building2} color="#f59e0b" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Laboratorios" value={stats.laboratorios} icon={FlaskConical} color="#8b5cf6" />
            <StatCard label="Prácticas" value={stats.practicas} icon={FlaskConical} color="#536493" />
            <StatCard label="Titulación" value={stats.titulacion} icon={Trophy} color="#ef4444" />
            <StatCard label="Docs. pendientes" value={stats.docsPendientes} icon={Clock} color="#f59e0b" />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/dashboard/admin/usuarios">
              <Card className="border-[#e2e8f0] hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader><CardTitle className="text-sm">Gestión de usuarios</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-[#64748b]">Administrar roles y accesos</p></CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/revision/documentos">
              <Card className="border-[#e2e8f0] hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader><CardTitle className="text-sm">Revisar documentos</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-[#64748b]">{stats.docsPendientes} pendiente(s) de aprobación</p></CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/fechas-limite">
              <Card className="border-[#e2e8f0] hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader><CardTitle className="text-sm">Convocatorias</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-[#64748b]">{stats.convocatorias} convocatoria(s) activa(s)</p></CardContent>
              </Card>
            </Link>
          </div>
        </>
      )}

      {rol === "ESTUDIANTE" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {studentLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Card className="border-[#e2e8f0] hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1a6b3c]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#1a6b3c]" />
                    </div>
                    <p className="font-medium text-[#0f172a] text-sm">{item.name}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {rol === "PROFESOR" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {professorLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Card className="border-[#e2e8f0] hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1a6b3c]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#1a6b3c]" />
                    </div>
                    <p className="font-medium text-[#0f172a] text-sm">{item.name}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
