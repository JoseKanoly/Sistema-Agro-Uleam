"use client"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

export interface ExportColumn<T> {
  header: string
  accessor: (row: T) => string | number
}

const todayISO = () => new Date().toISOString().slice(0, 10)

function sanitize(s: string) {
  return s.replace(/[^a-zA-Z0-9._-]+/g, "_").toLowerCase()
}

export function exportToPDF<T>(
  filename: string,
  title: string,
  columns: ExportColumn<T>[],
  rows: T[],
  subtitle?: string,
) {
  const doc = new jsPDF({ orientation: columns.length > 5 ? "landscape" : "portrait" })

  // Encabezado
  doc.setFontSize(16)
  doc.setTextColor(30, 30, 30)
  doc.text(title, 14, 18)

  doc.setFontSize(10)
  doc.setTextColor(120, 120, 120)
  if (subtitle) {
    doc.text(subtitle, 14, 25)
  }
  doc.text(`SISPAA - Generado el ${todayISO()}`, 14, subtitle ? 31 : 25)

  autoTable(doc, {
    startY: subtitle ? 36 : 30,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => String(c.accessor(r) ?? ""))),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 245] },
    margin: { left: 14, right: 14 },
  })

  // Pie
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(140, 140, 140)
    doc.text(
      `Pagina ${i} de ${pageCount} - SISPAA Uleam`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    )
  }

  doc.save(`${sanitize(filename)}_${todayISO()}.pdf`)
}

export function exportToExcel<T>(
  filename: string,
  sheetName: string,
  columns: ExportColumn<T>[],
  rows: T[],
) {
  const data = rows.map((r) => {
    const obj: Record<string, string | number> = {}
    columns.forEach((c) => {
      obj[c.header] = c.accessor(r) ?? ""
    })
    return obj
  })

  const ws = XLSX.utils.json_to_sheet(data)

  // Ancho de columnas razonable
  ws["!cols"] = columns.map((c) => {
    const headerLen = c.header.length
    const maxVal = data.reduce((m, row) => Math.max(m, String(row[c.header] ?? "").length), 0)
    return { wch: Math.min(40, Math.max(12, headerLen, maxVal)) + 2 }
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 28))
  XLSX.writeFile(wb, `${sanitize(filename)}_${todayISO()}.xlsx`)
}
