"use client"

import { Button } from "@/components/ui/button"
import { FileDown, FileSpreadsheet } from "lucide-react"
import { exportToExcel, exportToPDF, type ExportColumn } from "@/lib/utils/export"

interface ExportButtonsProps<T> {
  filename: string
  title: string
  subtitle?: string
  columns: ExportColumn<T>[]
  rows: T[]
  size?: "sm" | "default"
  disabled?: boolean
}

export function ExportButtons<T>({
  filename,
  title,
  subtitle,
  columns,
  rows,
  size = "sm",
  disabled,
}: ExportButtonsProps<T>) {
  const noData = disabled || rows.length === 0

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size={size}
        variant="outline"
        onClick={() => exportToPDF(filename, title, columns, rows, subtitle)}
        disabled={noData}
        title="Descargar PDF"
      >
        <FileDown className="mr-2 h-4 w-4" />
        PDF
      </Button>
      <Button
        type="button"
        size={size}
        variant="outline"
        onClick={() => exportToExcel(filename, title.slice(0, 28), columns, rows)}
        disabled={noData}
        title="Descargar Excel"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Excel
      </Button>
    </div>
  )
}
