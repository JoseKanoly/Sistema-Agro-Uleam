import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/auth/login")

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Bienvenido, {session.user.name}!</h1>
      <p className="text-gray-600 mt-2">Tu cuenta ha sido creada exitosamente.</p>
      <p className="text-sm text-gray-500 mt-4">Email: {session.user.email}</p>
    </div>
  )
}
