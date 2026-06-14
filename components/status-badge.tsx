import { cn } from "@/lib/utils"
import type { EstadoRevision } from "@/lib/types/database"

const LABELS: Record<EstadoRevision, string> = {
  aprobado: "Aprobado",
  pendiente: "En revision",
  rechazado: "Rechazado",
}

const STYLES: Record<EstadoRevision, string> = {
  aprobado: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  pendiente: "bg-amber-100 text-amber-800 ring-amber-200",
  rechazado: "bg-red-100 text-red-800 ring-red-200",
}

export function StatusBadge({ estado, className }: { estado: EstadoRevision; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[estado],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          estado === "aprobado" && "bg-emerald-500",
          estado === "pendiente" && "bg-amber-500",
          estado === "rechazado" && "bg-red-500",
        )}
      />
      {LABELS[estado]}
    </span>
  )
}

// Semaforo basado en cercania a una fecha limite
export function FechaLimiteBadge({ fechaLimite, hoy }: { fechaLimite: string; hoy?: string }) {
  const ref = hoy ?? new Date().toISOString().slice(0, 10)
  const diff = Math.ceil((new Date(fechaLimite).getTime() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24))

  let color = "bg-emerald-100 text-emerald-800 ring-emerald-200"
  let label = `Faltan ${diff} dias`
  if (diff < 0) {
    color = "bg-red-100 text-red-800 ring-red-200"
    label = `Vencida hace ${Math.abs(diff)} dias`
  } else if (diff <= 3) {
    color = "bg-red-100 text-red-800 ring-red-200"
    label = diff === 0 ? "Vence hoy" : `Faltan ${diff} dias`
  } else if (diff <= 7) {
    color = "bg-amber-100 text-amber-800 ring-amber-200"
  }

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", color)}>
      {label}
    </span>
  )
}
