"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerEstudiante } from "@/app/actions/registro";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => { // Corregir
    e.preventDefault();

    if (!name || !cedula || !email || !password || !confirmPassword) {
      toast.error("Complete todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (cedula.trim().length < 10) {
      toast.error("Ingrese una cédula válida (10 dígitos)");
      return;
    }

    setLoading(true);
    try {
      const res = await registerEstudiante({
        name: name.trim(),
        cedula: cedula.trim(),
        email: email.trim(),
        password,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          "Cuenta creada. Se creó tu carpeta personal para documentos.",
        );
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative">
      {/* Left text panel */}
      <div className="hidden lg:flex w-1/3  bg-[#353535] flex-col p-8">
        {/* Logo and title */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#3C6E71] flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>

          <div className="space-y-0.5">
            <p className="text-[#3C6E71] font-semibold text-base leading-none">
              SISPAA
            </p>
            <p className="text-[#9199a7] text-sm leading-5">
              Sistema Integral de Seguimiento de Procesos Académicos y
              Administrativos.
            </p>
          </div>
        </div>

        {/* Informacion */}
        <div className="mt-40 space-y-2">
          <h3 className="text-xl font-bold text-[#E0E0E0] leading-tight">
            Tu carpeta de documentos se crea al registrarte
          </h3>

          <p className="text-[#9199a7] text-base leading-7">
            Nombre + cédula → Carpeta personal
            <br />
            Los grupos (SGA, etc.) aparecen como subcarpetas para subir
            archivos
          </p>
        </div>
      </div>

      {/* Right/Center panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Signup Container */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-[#D9D9D9] p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#353535]">Crear cuenta</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-[#353535]"
                >
                  Nombre completo *
                </Label>

                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombres y apellidos"
                  className="h-10 border-[#D9D9D9]"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="cedula"
                  className="text-sm font-medium text-[#353535]"
                >
                  Cédula de identidad *
                </Label>

                <Input
                  id="cedula"
                  value={cedula}
                  onChange={(e) =>
                    setCedula(e.target.value.replace(/\D/g, "").slice(0, 13))
                  }
                  placeholder="Ingrese su cédula (solo números)"
                  maxLength={13}
                  className="h-10 border-[#D9D9D9]"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-[#353535]"
                >
                  Correo electrónico *
                </Label>

                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="Ingrese su correo institucional"
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 border-[#D9D9D9]"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-[#353535]"
                >
                  Contraseña *
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres alfanuméricos"
                    className="h-10 border-[#D9D9D9] pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#353535]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-[#353535]"
                >
                  Confirmar contraseña *
                </Label>

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme su contraseña"
                    className="h-10 border-[#D9D9D9] pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#353535]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#3C6E71] hover:bg-[#2F5A5C] text-white font-semibold mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando cuenta...
                  </span>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-[#9CA3AF] mt-4">
            ¿Ya tiene cuenta?{" "}
            <Link
              href="/auth/login"
              className="text-[#3C6E71] font-semibold hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-6">
        <p className="text-[#6B7280] text-sm">
          &copy; {new Date().getFullYear()} SISPAA. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
