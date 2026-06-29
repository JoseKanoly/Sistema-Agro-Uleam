"use client"

import React, { useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import type { Rol } from "@/lib/types/database"
import { PanelLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  children: React.ReactNode
  rol: Rol
  userName: string
  userEmail: string
  esInvestigador?: boolean
  esTutorTitulacion?: boolean
}

export function DashboardShell({ children, rol, userName, userEmail, esInvestigador, esTutorTitulacion }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  const renderHeaderTitle = () => {
    if (!pathname || pathname === "/dashboard") {
      return (
        <span className="font-medium text-sm text-gray-700">
          Sistema Integral de Seguimiento de Procesos Académicos y Administrativos
        </span>
      )
    }

    const parts = pathname.split("/").filter(p => p && p !== "dashboard")
    if (parts.length === 0) {
      return (
        <span className="font-medium text-sm text-gray-700">
          Sistema Integral de Seguimiento de Procesos Académicos y Administrativos
        </span>
      )
    }

    const lowerWords = ['de', 'en', 'la', 'el', 'y', 'del', 'las', 'los']
    const formatPart = (part: string) => {
      return part
        .split("-")
        .map((word, index) => {
          if (index > 0 && lowerWords.includes(word.toLowerCase())) {
            return word.toLowerCase()
          }
          return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(" ")
    }

    return (
      <div className="flex items-center gap-1.5 text-sm">
        {parts.map((part, index) => {
          const isLast = index === parts.length - 1
          return (
            <React.Fragment key={part}>
              <span className={isLast ? "font-medium text-gray-700" : "text-gray-500"}>
                {formatPart(part)}
              </span>
              {!isLast && <ChevronRight className="h-4 w-4 text-gray-400" />}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar 
        rol={rol} 
        userName={userName} 
        userEmail={userEmail} 
        esInvestigador={esInvestigador} 
        esTutorTitulacion={esTutorTitulacion}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className={cn("transition-[padding] duration-300 ease-in-out", isSidebarOpen ? "lg:pl-60" : "lg:pl-0")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-none bg-background px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex items-center justify-center rounded-md p-2 text-gray-800 hover:bg-gray-200 hover:text-gray-800"
          >
            <PanelLeft className="h-4.5 w-4.5" />
          </button>
          <div className="flex items-center gap-2">
            {renderHeaderTitle()}
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 pt-2 pb-4 sm:px-6 sm:pt-3 sm:pb-6 lg:px-8 lg:pt-4 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}

