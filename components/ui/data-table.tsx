"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchKeys?: string[]
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({ data, columns, searchKeys = [], emptyMessage = "Sin registros" }: DataTableProps<T>) {
  const [search, setSearch] = useState("")

  const filtered = search
    ? data.filter((row) =>
        searchKeys.some((key) => {
          const val = row[key]
          return String(val ?? "").toLowerCase().includes(search.toLowerCase())
        })
      )
    : data

  return (
    <div className="space-y-3">
      {searchKeys.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white border-[#D9D9D9]"
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#D9D9D9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D9D9D9] bg-[#F5F5F5]">
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-[#6B7280]">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={i} className="hover:bg-[#F5F5F5] transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-[#353535]">
                        {col.render ? col.render(row) : String(row[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-[#F5F5F5] bg-[#F5F5F5]">
            <p className="text-xs text-[#6B7280]">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>
    </div>
  )
}
