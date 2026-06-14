# SISPAA v1.0 - Implementación Completa

## Visión General
SISPAA es un Sistema Integral de Seguimiento de Procesos Académicos y Administrativos para la Universidad ULEAM. Proporciona un dashboard centralizado para gestionar todas las actividades académicas organizadas por períodos académicos (2026-1, 2026-2, etc.).

## Base de Datos
### 24 Tablas Creadas
1. **periodos_academicos** - Organiza todo el sistema por período (2026-1, 2026-2, etc.)
2. **carreras** - Agropecuaria, Agronegocios, Agroindustria
3. **materias** - Materias por carrera y semestre
4. **roles** - 6 roles: super_admin, coordinador_carrera, coordinador_investigacion, docente, secretaria, estudiante
5. **permisos** - 32 permisos granulares (silabos.view, silabos.upload, etc.)
6. **roles_permisos** - Relación N:M entre roles y permisos
7. **profiles** - Extiende auth.users con datos académicos (cedula, rol_id, carrera_id, etc.)
8. **usuarios_permisos_extra** - Permisos adicionales individuales

### Módulos Académicos
9. **documentos_estudiante** - Documentos SGA (cedula, matricula, certificado, foto)
10. **faltas_estudiante** - Registro de faltas con justificaciones
11. **silabos** - Sílabos de asignaturas por período
12. **informes_docente** - Informes mensuales, parciales y finales

### Investigación
13. **investigaciones** - Proyectos de investigación por docente
14. **hitos_investigacion** - Hitos con seguimiento de avances
15. **informes_investigacion** - Reportes de investigación

### Vinculación
16. **vinculacion_actividades** - Actividades de vinculación comunitaria
17. **vinculacion_empresas** - Empresas beneficiadas
18. **reportes_vinculacion** - Reportes de actividades

### Titulación
19. **titulacion_temas** - Temas de titulación
20. **titulacion_estudiantes** - Relación tema-estudiantes
21. **titulacion_avances** - Avances en temas

### Laboratorio y Notificaciones
22. **practicas_laboratorio** - Prácticas realizadas
23. **notificaciones** - Sistema de notificaciones por usuario
24. **fechas_limite** - Configurables por secretaria

## Arquitectura de Autenticación y Permisos

### 6 Roles del Sistema
| Rol | Permisos Clave | Casos de Uso |
|-----|---|---|
| **Super Admin** | TODOS | Gestión total del sistema |
| **Coordinador Carrera** | Ver TODAS las estadísticas + asignar docentes vinculación | Toma decisiones académicas |
| **Coordinador Investigación** | Ver investigaciones, reportes, KPIs | Supervisa investigación |
| **Docente** | Subir silabos, informes, crear investigaciones, prácticas | Docencia diaria |
| **Secretaria** | Revisar/aprobar documentos, gestionar fechas | Operaciones |
| **Estudiante** | Subir documentos, ver estado | Limitado a sus datos |

### Sistema de Permisos Granulares
Estructura: `modulo.accion` (ej: `silabos.view`, `investigacion.create`, `reportes.export`)

## Frontend - Componentes Creados

### Autenticación
- **app/page.tsx** - Redirección automática (auth/login o /dashboard)
- **app/auth/login/page.tsx** - Página de login
- **app/auth/logout/page.tsx** - Logout
- **app/auth/callback/route.ts** - Callback de Supabase

### Dashboard Principal
- **app/dashboard/page.tsx** - Dashboard con KPIs y gráficos
- **app/dashboard/layout.tsx** - Layout con sidebar dinámico
- **components/dashboard/dashboard-layout.tsx** - Layout principal
- **components/dashboard/kpi-card.tsx** - Tarjetas KPI con semáforo
- **components/dashboard/filters.tsx** - Filtros por período/carrera
- **components/sidebar-nav.tsx** - Sidebar dinámico por permisos

### Módulo Docencia
- **app/dashboard/docencia/informes/page.tsx** - Gestión de informes
- **app/dashboard/docencia/silabos/page.tsx** - Gestión de sílabos

### Módulo Estudiantes
- **app/dashboard/estudiantes/matriculados/page.tsx** - Listado de matriculados
- **app/dashboard/estudiantes/documentos/page.tsx** - Carga de documentos (SGA)

### Módulo Investigación
- **app/dashboard/investigacion/informes/page.tsx** - Proyectos y reportes

### Módulo Laboratorio
- **app/dashboard/laboratorio/page.tsx** - Prácticas de laboratorio

### Administración
- **app/dashboard/admin/usuarios/page.tsx** - Gestión de usuarios
- **app/dashboard/admin/carreras/page.tsx** - Gestión de carreras
- **app/dashboard/admin/periodos/page.tsx** - Gestión de períodos

## Infraestructura de Supabase

### Configuración
- **lib/supabase/client.ts** - Cliente Supabase (lado cliente)
- **lib/supabase/server.ts** - Cliente Supabase (lado servidor)
- **lib/supabase/middleware.ts** - Middleware de sesión
- **middleware.ts** - Refresh de tokens

### Contexto y Tipos
- **lib/auth/auth-context.tsx** - Contexto de autenticación
- **lib/types/database.ts** - Tipos de base de datos
- **lib/navigation.ts** - Configuración de navegación dinámica

## Sistema de Visualización de Datos

### KPIs en Dashboard
1. **Docencia** - 85% cumplimiento (informes/sílabos aprobados)
2. **Investigación** - Proyectos activos y hitos
3. **Estudiantes** - Matriculados, activos, retirados
4. **Prácticas Lab** - Realizadas por carrera
5. **Vinculación** - Actividades ejecutadas/pendientes
6. **Titulación** - Temas en proceso, graduados

### Gráficos (Recharts)
- Barras: Cumplimiento por área
- Líneas: Tendencia temporal

### Sistema Semáforo
```
Verde (>7 días)   - Plazo disponible
Amarillo (3-7)    - Próximo a vencer
Rojo (<3 días)    - Crítico
```

## Características Implementadas

### ✅ Completadas
1. Schema de 24 tablas con RLS (Row Level Security)
2. Autenticación Supabase con JWT
3. 6 roles con 32 permisos granulares
4. Dashboard con KPIs y gráficos
5. Sidebar dinámico (menú cambia por rol)
6. Módulos: Docencia, Estudiantes, Investigación, Laboratorio, Admin
7. Sistema de documentos estudiantiles
8. Gestión de faltas y justificaciones
9. Control de sílabos e informes con semáforo

### 🔄 En Progreso
- Carga de archivos (integración Vercel Blob)
- Notificaciones en tiempo real
- Reportes exportables (PDF/Excel)

### 📋 Próximos Pasos
- Vinculación comunitaria (completa)
- Titulación (temas y avances)
- Modelos de permisos avanzados
- Auditoría de cambios

## Tecnologías Stack

### Frontend
- **Next.js 15.2** - App Router
- **React 19** - UI
- **Tailwind CSS v4** - Estilos
- **shadcn/ui** - Componentes
- **Recharts** - Gráficos
- **Lucide React** - Iconos

### Backend
- **Supabase** - Database + Auth + RLS
- **PostgreSQL** - Motor de datos

### Seguridad
- **JWT** - Autenticación
- **RLS** - Control de acceso de datos
- **Permisos Granulares** - Control fino

## Configuración y Deploy

### Variables de Entorno
```env
NEXT_PUBLIC_SUPABASE_URL=<tu_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key>
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback (dev)
```

### Inicio Local
```bash
pnpm install
pnpm dev
# http://localhost:3000
```

### Deploy a Vercel
```bash
vercel deploy
```

## Datos de Prueba

### Usuarios de Ejemplo
- Super Admin: admin@uleam.edu.ec
- Coordinador: coord@uleam.edu.ec
- Docente: docente@uleam.edu.ec
- Secretaria: secretaria@uleam.edu.ec
- Estudiante: estudiante@live.uleam.edu.ec

### Carreras
- Ingeniería Agropecuaria (AGR)
- Agronegocios (AGN)
- Agroindustria (AGI)

### Períodos
- 2026-1 (activo)
- 2025-2 (inactivo)

## Estadísticas
- **Tablas**: 24
- **Permisos**: 32
- **Roles**: 6
- **Páginas**: 15+
- **Componentes**: 20+
- **Líneas de Código**: ~2000+

## Notas Importantes

1. **Todo organizado por período** - El coordinador cambia el período activo y todos los datos se filtran automáticamente
2. **Coordinador ve TODO** - A diferencia de otros roles, ve todas las estadísticas del sistema
3. **RLS protege datos** - Los estudiantes solo ven sus documentos, los docentes sus silabos, etc.
4. **Menú dinámico** - El sidebar muestra solo opciones según permisos del usuario

---

**Versión**: 1.0
**Estado**: MVP Completado
**Próxima Versión**: Notificaciones en Tiempo Real, Exportación de Reportes
