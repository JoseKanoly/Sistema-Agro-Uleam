"use client"

import { useState } from "react"
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExportButtonsProps {
  onExportPDF: () => Promise<void> | void
  onExportExcel: () => Promise<void> | void
}

export function ExportButtons({ onExportPDF, onExportExcel }: ExportButtonsProps) {
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingXls, setLoadingXls] = useState(false)

  const handlePDF = async () => {
    setLoadingPdf(true)
    try { await onExportPDF() } finally { setLoadingPdf(false) }
  }

  const handleExcel = async () => {
    setLoadingXls(true)
    try { await onExportExcel() } finally { setLoadingXls(false) }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handlePDF} disabled={loadingPdf} className="h-8 text-xs gap-1.5 border-[#e2e8f0]">
        {loadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-red-500" />}
        PDF
      </Button>
      <Button variant="outline" size="sm" onClick={handleExcel} disabled={loadingXls} className="h-8 text-xs gap-1.5 border-[#e2e8f0]">
        {loadingXls ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />}
        Excel
      </Button>
    </div>
  )
}
