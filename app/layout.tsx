import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema Académico | Gestión Universitaria",
  description:
    "Plataforma integral de gestión académica universitaria: docencia, estudiantes, laboratorio, vinculación, investigación y titulación.",
}

export const viewport: Viewport = {
  themeColor: "#3C6E71",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="bg-white">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
