import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { db } from "@/lib/db"
import { temasTitulacion } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, User, BookOpen, TrendingUp } from "lucide-react"

const modalidadLabel: Record<string, string> = {
  proyecto: "Proyecto de Titulacion",
  tesis: "Tesis",
  examen_complexivo: "Examen Complexivo",
}

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  propuesto: { label: "Propuesto", variant: "secondary", color: "#D4A373" },
  en_progreso: { label: "En Progreso", variant: "default", color: "#3C6E71" },
  completado: { label: "Completado", variant: "outline", color: "#72c184" },
}

export default async function MiTitulacionPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const temas = await db
    .select()
    .from(temasTitulacion)
    .where(eq(temasTitulacion.estudianteId, data.user.id))

  const tema = temas[0] ?? null

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Mi Titulacion</h1>
        <p className="text-[#6B7280] mt-1">Estado y seguimiento de tu proceso de titulacion</p>
      </div>

      {!tema ? (
        <Card className="border-[#D9D9D9]">
          <CardContent className="py-16 text-center">
            <GraduationCap className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
            <p className="text-[#475569] font-medium">No tienes un tema de titulacion asignado aun.</p>
            <p className="text-sm text-[#6B7280] mt-1">Contacta con tu coordinador para solicitar la asignacion de tu tema.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main info card */}
          <Card className="border-[#D9D9D9]">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <CardTitle className="text-[#353535] text-lg leading-tight">{tema.titulo}</CardTitle>
                  <CardDescription className="mt-1">{modalidadLabel[tema.modalidad] ?? tema.modalidad}</CardDescription>
                </div>
                {estadoConfig[tema.estado] && (
                  <Badge variant={estadoConfig[tema.estado].variant}>
                    {estadoConfig[tema.estado].label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-[#E0EEEF] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#3C6E71]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Tutor Asignado</p>
                    <p className="text-sm font-semibold text-[#353535]">{tema.tutor ?? "Por asignar"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-[#536493]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Modalidad</p>
                    <p className="text-sm font-semibold text-[#353535]">{modalidadLabel[tema.modalidad] ?? tema.modalidad}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="p-4 bg-[#F5F5F5] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#3C6E71]" />
                    <span className="text-sm font-medium text-[#353535]">Progreso del trabajo</span>
                  </div>
                  <span className="text-2xl font-bold text-[#3C6E71]">{tema.avance}%</span>
                </div>
                <div className="w-full bg-[#D9D9D9] rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-[#3C6E71] transition-all duration-500"
                    style={{ width: `${tema.avance}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-[#6B7280]">
                  <span>Inicio</span>
                  <span>Defensa</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steps checklist */}
          <Card className="border-[#D9D9D9]">
            <CardHeader>
              <CardTitle className="text-[#353535]">Etapas del proceso</CardTitle>
              <CardDescription>Pasos requeridos para completar la titulacion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { step: "Propuesta aprobada", done: tema.avance >= 10 },
                  { step: "Asignacion de tutor", done: !!tema.tutor },
                  { step: "Desarrollo del trabajo", done: tema.avance >= 50 },
                  { step: "Revision del tutor", done: tema.avance >= 75 },
                  { step: "Aprobacion para defensa", done: tema.avance >= 90 },
                  { step: "Defensa y titulacion", done: tema.estado === "completado" },
                ].map(({ step, done }) => (
                  <div key={step} className="flex items-center gap-3 py-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-[#3C6E71]" : "bg-[#D9D9D9]"}`}>
                      {done && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`text-sm ${done ? "text-[#353535] font-medium" : "text-[#9CA3AF]"}`}>{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
