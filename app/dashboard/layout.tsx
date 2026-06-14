import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import type { Rol } from "@/lib/types/database"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  // The rol stored in DB is already UPPER_CASE (SUPER_ADMIN, ADMIN, PROFESOR, etc.)
  // Default to ESTUDIANTE if no perfil record exists yet
  const rawRol = (data.perfil?.rol ?? "ESTUDIANTE").toUpperCase()
  const validRoles: Rol[] = ["SUPER_ADMIN", "ADMIN", "COORDINADOR", "PROFESOR", "SECRETARIA", "ESTUDIANTE"]
  const rol: Rol = validRoles.includes(rawRol as Rol) ? (rawRol as Rol) : "ESTUDIANTE"

  return (
    <DashboardShell
      rol={rol}
      userName={data.user.name}
      userEmail={data.user.email}
      esInvestigador={data.perfil?.esInvestigador ?? false}
      esTutorTitulacion={data.perfil?.esTutorTitulacion ?? false}
    >
      {children}
    </DashboardShell>
  )
}
