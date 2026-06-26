"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerEstudiante } from "@/app/actions/registro"
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [cedula, setCedula] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !cedula || !email || !password || !confirmPassword) {
      toast.error("Complete todos los campos")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }

    if (cedula.trim().length < 10) {
      toast.error("Ingrese una cédula válida (10 dígitos)")
      return
    }

    setLoading(true)
    try {
      const res = await registerEstudiante({
        name: name.trim(),
        cedula: cedula.trim(),
        email: email.trim(),
        password,
      })

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Cuenta creada. Se creó tu carpeta personal para documentos.")
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      toast.error("Error al conectar con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex">
      <div className="hidden lg:flex w-1/2 bg-[#0f2419] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-[#0f2419]" />
          </div>
          <div>
            <p className="text-[#d1fae5] font-bold text-lg leading-tight">SISPAA</p>
            <p className="text-[#6b9a7f] text-xs">Sistema de Gestion Academica</p>
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-[#d1fae5] leading-tight">
            Tu carpeta de documentos se crea al registrarte
          </h1>
          <p className="text-[#6b9a7f] text-lg">
            Nombre + cédula → carpeta personal. Los grupos (SGA, etc.) aparecen como subcarpetas para subir archivos.
          </p>
        </div>
        <p className="text-[#4a6b56] text-sm">&copy; {new Date().getFullYear()} SISPAA</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#0f172a]">Crear cuenta</h2>
              <p className="text-sm text-[#64748b] mt-1">Rol estudiante · carpeta personal automática</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Julio Maeza" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cedula">Cédula de identidad *</Label>
                <Input
                  id="cedula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, "").slice(0, 13))}
                  placeholder="1312345678"
                  maxLength={13}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#1a6b3c] hover:bg-[#155730]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Crear cuenta"}
              </Button>
            </form>
          </div>
          <p className="text-center text-xs text-[#94a3b8] mt-4">
            ¿Ya tiene cuenta? <Link href="/auth/login" className="text-[#1a6b3c] font-semibold hover:underline">Inicie sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
