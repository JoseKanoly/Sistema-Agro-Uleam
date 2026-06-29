import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { carreras } from "@/lib/db/schema"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Building2, Shield, CreditCard, Code2 } from "lucide-react"

const DESARROLLADORES = [
  "Bosada Bosada Jesús Andrés",
  "Loor Vera Jordy Lenin",
  "Parrales Pico Douglas Andrés",
  "Santos Toala José Sebastián",
]

const rolLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Administrador",
  ADMIN: "Administrador",
  COORDINADOR: "Coordinador",
  PROFESOR: "Profesor",
  SECRETARIA: "Secretaria",
  ESTUDIANTE: "Estudiante",
}

export default async function PerfilPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const { user, perfil } = data
  const carrerasList = await db.select().from(carreras)
  const carreraMap = Object.fromEntries(carrerasList.map((c) => [c.id, c.nombre]))

  const rol = perfil?.rol ?? "estudiante"
  const carreraNombre = perfil?.carreraId ? carreraMap[perfil.carreraId] : null

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Mi Perfil</h1>
        <p className="text-[#6B7280] mt-1">Informacion de tu cuenta y configuracion</p>
      </div>

      {/* Avatar + name hero */}
      <Card className="border-[#D9D9D9]">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#E0EEEF] flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-[#3C6E71]">
                {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#353535]">{user.name}</h2>
              <p className="text-[#6B7280] text-sm">{user.email}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Badge variant="default" className="bg-[#3C6E71] hover:bg-[#3C6E71]">
                  {rolLabel[rol] ?? rol}
                </Badge>
                {carreraNombre && (
                  <Badge variant="secondary">{carreraNombre}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <CardTitle className="text-[#353535]">Datos de la cuenta</CardTitle>
          <CardDescription>Informacion registrada en el sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Nombre completo", value: user.name, icon: User },
            { label: "Cédula", value: perfil?.cedula ?? "No registrada", icon: CreditCard },
            { label: "Correo electronico", value: user.email, icon: Mail },
            { label: "Rol en el sistema", value: rolLabel[rol] ?? rol, icon: Shield },
            { label: "Carrera", value: carreraNombre ?? "No asignada", icon: Building2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[#E0EEEF] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#3C6E71]" />
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">{label}</p>
                <p className="text-sm font-semibold text-[#353535]">{value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Account created */}
      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <CardTitle className="text-[#353535]">Actividad de la cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-[#F5F5F5]">
              <span className="text-[#6B7280]">Cuenta creada</span>
              <span className="font-medium text-[#353535]">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" })
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F5F5F5]">
              <span className="text-[#6B7280]">Correo verificado</span>
              <Badge variant={user.emailVerified ? "default" : "secondary"}>
                {user.emailVerified ? "Verificado" : "Pendiente"}
              </Badge>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6B7280]">ID de usuario</span>
              <span className="font-mono text-xs text-[#6B7280]">{user.id.slice(0, 16)}…</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <CardTitle className="text-[#353535] flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#3C6E71]" />
            Sistema desarrollado por
          </CardTitle>
          <CardDescription>Equipo de desarrollo SISPAA — ULEAM</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {DESARROLLADORES.map((dev) => (
              <li key={dev} className="text-sm font-medium text-[#353535] py-2 px-4 bg-[#F5F5F5] rounded-lg border border-[#F5F5F5]">
                {dev}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
