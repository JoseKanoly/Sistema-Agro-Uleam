import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  estado: string
  className?: string
}

const map: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700 border-amber-200",
  aprobado: "bg-green-100 text-green-700 border-green-200",
  rechazado: "bg-red-100 text-red-700 border-red-200",
  activo: "bg-blue-100 text-blue-700 border-blue-200",
  inactivo: "bg-slate-100 text-slate-600 border-slate-200",
  en_progreso: "bg-blue-100 text-blue-700 border-blue-200",
  completado: "bg-green-100 text-green-700 border-green-200",
  propuesto: "bg-amber-100 text-amber-700 border-amber-200",
  programada: "bg-blue-100 text-blue-700 border-blue-200",
  realizada: "bg-green-100 text-green-700 border-green-200",
  cancelada: "bg-red-100 text-red-700 border-red-200",
  operativo: "bg-green-100 text-green-700 border-green-200",
  mantenimiento: "bg-amber-100 text-amber-700 border-amber-200",
  dañado: "bg-red-100 text-red-700 border-red-200",
  disponible: "bg-green-100 text-green-700 border-green-200",
  agotado: "bg-red-100 text-red-700 border-red-200",
  bajo_stock: "bg-amber-100 text-amber-700 border-amber-200",
}

const labels: Record<string, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  activo: "Activo",
  inactivo: "Inactivo",
  en_progreso: "En Progreso",
  completado: "Completado",
  propuesto: "Propuesto",
  programada: "Programada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  operativo: "Operativo",
  mantenimiento: "Mantenimiento",
  dañado: "Danado",
  disponible: "Disponible",
  agotado: "Agotado",
  bajo_stock: "Bajo Stock",
}

export function StatusBadge({ estado, className }: StatusBadgeProps) {
  const style = map[estado] ?? "bg-slate-100 text-slate-600 border-slate-200"
  const label = labels[estado] ?? estado
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", style, className)}>
      {label}
    </span>
  )
}
