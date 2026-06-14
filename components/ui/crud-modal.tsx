"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CrudModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onSubmit?: () => void
  submitLabel?: string
  loading?: boolean
  size?: "sm" | "md" | "lg"
}

const sizeMap = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }

export function CrudModal({ open, onClose, title, children, onSubmit, submitLabel = "Guardar", loading, size = "md" }: CrudModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeMap[size]} bg-white rounded-2xl shadow-2xl overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
          <h2 className="font-semibold text-[#0f172a]">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {children}
        </div>
        {onSubmit && (
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
            <Button variant="outline" onClick={onClose} className="h-9 text-sm">Cancelar</Button>
            <Button onClick={onSubmit} disabled={loading} className="h-9 text-sm bg-[#1a6b3c] hover:bg-[#155730] text-white">
              {loading ? "Guardando..." : submitLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
