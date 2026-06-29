"use client"

import { carrerasMock } from "@/lib/mock/carreras"
import { usuariosMock } from "@/lib/mock/users"
import { estudiantesMock } from "@/lib/mock/estudiantes"
import { materiasMock } from "@/lib/mock/materias"
import { matriculasMock } from "@/lib/mock/academico"
import { temasTitulacionMock } from "@/lib/mock/titulacion"
import { practicasMock } from "@/lib/mock/laboratorio"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts"
import { Users, GraduationCap, BookOpen, FlaskConical, Award, TrendingUp } from "lucide-react"

function StatCard({ label, value, sub, icon: Icon, color = "#3C6E71" }: {
  label: string; value: string | number; sub?: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color?: string
}) {
  return (
    <Card className="border-[#D9D9D9]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-[#353535] mt-1">{value}</p>
            {sub && <p className="text-xs text-[#6B7280] mt-1">{sub}</p>}
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EstadisticasPage() {
  const totalDocentes = usuariosMock.filter((u) => u.rol === "PROFESOR").length
  const totalEstudiantes = estudiantesMock.length
  const totalMaterias = materiasMock.length
  const totalTitulacion = temasTitulacionMock.length
  const totalPracticas = practicasMock.length
  const promedioGeneral = (estudiantesMock.reduce((acc, e) => acc + e.promedio, 0) / estudiantesMock.length).toFixed(2)

  const estudiantesPorCarrera = carrerasMock.map((c) => ({
    name: c.siglas,
    estudiantes: estudiantesMock.filter((e) => e.carreraId === c.id).length,
    docentes: usuariosMock.filter((u) => u.rol === "PROFESOR" && u.carreraId === c.id).length,
    materias: materiasMock.filter((m) => m.carreraId === c.id).length,
  }))

  const estadoEstudiantes = [
    { name: "Activo", value: estudiantesMock.filter((e) => e.estado === "activo").length, fill: "#3C6E71" },
    { name: "Egresado", value: estudiantesMock.filter((e) => e.estado === "egresado").length, fill: "#72c184" },
    { name: "Retirado", value: estudiantesMock.filter((e) => e.estado === "retirado").length, fill: "#ef4444" },
  ]

  const estadoMatriculas = [
    { name: "Matriculado", value: matriculasMock.filter((m) => m.estado === "matriculado").length },
    { name: "Aprobado", value: matriculasMock.filter((m) => m.estado === "aprobado").length },
    { name: "Reprobado", value: matriculasMock.filter((m) => m.estado === "reprobado").length },
    { name: "Retirado", value: matriculasMock.filter((m) => m.estado === "retirado").length },
  ]

  const promediosPorNivel = Array.from({ length: 9 }, (_, i) => {
    const nivel = i + 1
    const estudiantes = estudiantesMock.filter((e) => e.nivel === nivel)
    return {
      nivel: `N${nivel}`,
      promedio: estudiantes.length > 0
        ? Number((estudiantes.reduce((acc, e) => acc + e.promedio, 0) / estudiantes.length).toFixed(2))
        : 0,
    }
  })

  const estadoTitulacion = [
    { name: "Propuesto", value: temasTitulacionMock.filter((t) => t.estado === "propuesto").length, fill: "#536493" },
    { name: "En progreso", value: temasTitulacionMock.filter((t) => t.estado === "en_progreso").length, fill: "#D4A373" },
    { name: "Completado", value: temasTitulacionMock.filter((t) => t.estado === "completado").length, fill: "#3C6E71" },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9D9D9] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#353535]">Estadisticas de Coordinacion</h1>
        <p className="text-[#6B7280] mt-1">Vision general del rendimiento academico de la carrera</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Docentes" value={totalDocentes} icon={Users} color="#3C6E71" />
        <StatCard label="Estudiantes" value={totalEstudiantes} icon={GraduationCap} color="#536493" />
        <StatCard label="Materias" value={totalMaterias} icon={BookOpen} color="#D4A373" />
        <StatCard label="Titulacion" value={totalTitulacion} icon={Award} color="#7C6FA0" />
        <StatCard label="Practicas" value={totalPracticas} icon={FlaskConical} color="#72c184" />
        <StatCard label="Promedio general" value={promedioGeneral} sub="sobre 10.0" icon={TrendingUp} color="#ef4444" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#D9D9D9]">
          <CardHeader>
            <CardTitle className="text-[#353535]">Distribucion por carrera</CardTitle>
            <CardDescription>Docentes, estudiantes y materias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={estudiantesPorCarrera} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #D9D9D9" }} />
                <Legend />
                <Bar dataKey="estudiantes" name="Estudiantes" fill="#3C6E71" radius={[4, 4, 0, 0]} />
                <Bar dataKey="docentes" name="Docentes" fill="#72c184" radius={[4, 4, 0, 0]} />
                <Bar dataKey="materias" name="Materias" fill="#86efac" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#D9D9D9]">
          <CardHeader>
            <CardTitle className="text-[#353535]">Estado de estudiantes</CardTitle>
            <CardDescription>Distribucion por situacion academica</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={estadoEstudiantes} dataKey="value" nameKey="name" outerRadius={95} paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {estadoEstudiantes.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#D9D9D9]">
          <CardHeader>
            <CardTitle className="text-[#353535]">Promedio por nivel</CardTitle>
            <CardDescription>Rendimiento academico segun el nivel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={promediosPorNivel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis dataKey="nivel" tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #D9D9D9" }} />
                <Line type="monotone" dataKey="promedio" name="Promedio" stroke="#3C6E71" strokeWidth={2} dot={{ fill: "#3C6E71", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#D9D9D9]">
          <CardHeader>
            <CardTitle className="text-[#353535]">Estado de titulacion</CardTitle>
            <CardDescription>Temas por fase del proceso</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={estadoTitulacion} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
                <Tooltip />
                {estadoTitulacion.map((entry, i) => (
                  <Bar key={i} dataKey="value" name={entry.name} fill={entry.fill} radius={[0, 4, 4, 0]} />
                ))}
                <Bar dataKey="value" name="Temas" radius={[0, 4, 4, 0]}>
                  {estadoTitulacion.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#D9D9D9]">
        <CardHeader>
          <CardTitle className="text-[#353535]">Estado de matriculas</CardTitle>
          <CardDescription>Distribucion de matriculas en el periodo actual</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={estadoMatriculas}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #D9D9D9" }} />
              <Bar dataKey="value" name="Matriculas" fill="#3C6E71" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
