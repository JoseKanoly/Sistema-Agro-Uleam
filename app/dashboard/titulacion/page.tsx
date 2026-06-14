import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { TitulacionCrud } from "@/components/titulacion/titulacion-crud"

export default async function TitulacionPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")
  return <TitulacionCrud />
}
