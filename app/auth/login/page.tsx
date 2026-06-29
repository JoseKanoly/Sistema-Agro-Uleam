"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Complete todos los campos");
      return;
    }
    setLoading(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        const msg = res.error.message ?? "";
        if (
          msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("credentials")
        ) {
          toast.error(
            "Credenciales incorrectas. Verifique su correo y contraseña.",
          );
        } else {
          toast.error(msg || "No se pudo iniciar sesión. Intente de nuevo.");
        }
      } else {
        toast.success("Sesión iniciada correctamente");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error(
        "Error al conectar con el servidor. Verifique que la base de datos esté activa.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        {/* Top Header - SISPAA and Sistema de Gestión... */}
        <div className="w-full max-w-md mb-5">
          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#3C6E71] flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>

            <h1 className="text-[#3C6E71] font-semibold text-base leading-none">
              SISPAA
            </h1>
          </div>

          <p className="text-[#6B7280] text-sm text-center mt-4">
            Sistema Integral de Seguimiento de Procesos Académicos y
            Administrativos.
          </p>
        </div>

        {/* Login Container */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-[#D9D9D9] p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#353535]">
                Iniciar sesión
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                Utilice su correo y contraseña
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-[#353535]"
                >
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ingrese su correo institucional"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 border-[#D9D9D9]"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-[#353535]"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 border-[#D9D9D9] pr-10"
                    autoComplete="current-password"
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
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#3C6E71] hover:bg-[#2F5A5C] text-white font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ingresando...
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
          </div>
          <p className="text-center text-xs text-[#9CA3AF] mt-4">
            ¿No tiene cuenta?{" "}
            <Link
              href="/auth/signup"
              className="text-[#3C6E71] font-semibold hover:underline"
            >
              Registrarse
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom right copyright */}
      <div className="absolute bottom-4 right-6">
        <p className="text-[#6B7280] text-sm">
          &copy; {new Date().getFullYear()} SISPAA. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
