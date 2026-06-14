import { redirect } from "next/navigation"
import { getCurrentPerfil } from "@/app/actions/auth"

export default async function Home() {
  const data = await getCurrentPerfil()
  if (data?.user) redirect("/dashboard")
  redirect("/auth/login")
}
