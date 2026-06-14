"use client"

import { Sidebar } from "./sidebar"
import type { Rol } from "@/lib/types/database"

interface DashboardShellProps {
  children: React.ReactNode
  rol: Rol
  userName: string
  userEmail: string
  esInvestigador?: boolean
  esTutorTitulacion?: boolean
}

export function DashboardShell({ children, rol, userName, userEmail, esInvestigador, esTutorTitulacion }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <Sidebar rol={rol} userName={userName} userEmail={userEmail} esInvestigador={esInvestigador} esTutorTitulacion={esTutorTitulacion} />
      <main className="lg:pl-60">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
