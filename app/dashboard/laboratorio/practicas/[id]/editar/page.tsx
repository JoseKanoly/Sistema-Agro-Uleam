import { redirect, notFound } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { getLaboratorios, getPracticaById } from "@/app/actions/laboratorio"
import { PracticaForm } from "@/components/laboratorio/practica-form"

export default async function EditarPracticaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")

  const practicaId = Number(id)
  if (Number.isNaN(practicaId)) notFound()

  const [practica, laboratorios] = await Promise.all([
    getPracticaById(practicaId),
    getLaboratorios(),
  ])

  if (!practica) notFound()

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Editar práctica</h1>
        <p className="text-[#64748b] mt-1">{practica.tema}</p>
      </div>
      <PracticaForm laboratorios={laboratorios} docenteNombre={data.user.name} initial={practica} />
    </div>
  )
}
