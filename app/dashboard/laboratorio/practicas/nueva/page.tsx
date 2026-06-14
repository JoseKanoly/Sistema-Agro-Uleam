import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { getLaboratorios } from "@/app/actions/laboratorio"
import { PracticaForm } from "@/components/laboratorio/practica-form"

export default async function NuevaPracticaPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const laboratorios = await getLaboratorios()
  if (laboratorios.length === 0) redirect("/dashboard/laboratorio/labs")

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Nueva práctica de laboratorio</h1>
        <p className="text-[#64748b] mt-1">Complete el registro oficial de la práctica</p>
      </div>
      <PracticaForm laboratorios={laboratorios} docenteNombre={data.user.name} />
    </div>
  )
}
