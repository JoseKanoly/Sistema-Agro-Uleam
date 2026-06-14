import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"
import { MisDocumentosClient } from "@/components/documentos/mis-documentos-client"

export default async function MisDocumentosPage() {
  const data = await getCurrentPerfil()
  if (!data?.user) redirect("/auth/login")
  return <MisDocumentosClient />
}
