import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: "green" | "blue" | "amber" | "red" | "slate"
}

const colorMap = {
  green: { bg: "bg-[#E0EEEF]", icon: "bg-[#3C6E71] text-white", value: "text-[#3C6E71]" },
  blue: { bg: "bg-[#ECEEF5]", icon: "bg-[#536493] text-white", value: "text-[#536493]" },
  amber: { bg: "bg-amber-50", icon: "bg-amber-500 text-white", value: "text-amber-700" },
  red: { bg: "bg-red-50", icon: "bg-red-500 text-white", value: "text-red-700" },
  slate: { bg: "bg-slate-50", icon: "bg-slate-600 text-white", value: "text-slate-700" },
}

export function StatCard({ title, value, subtitle, icon: Icon, color = "green" }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={cn("rounded-xl p-4 border border-[#D9D9D9]", c.bg)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">{title}</p>
          <p className={cn("text-2xl font-bold mt-1", c.value)}>{value}</p>
          {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", c.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
