# SISPAA - Sistema Integral de Seguimiento de Procesos Académicos y Administrativos

## Descripción General

SISPAA es un sistema web completamente integrado para la Universidad ULEAM que proporciona un dashboard centralizado para gestionar todas las actividades académicas y administrativas, organizadas por períodos académicos (2026-1, 2026-2, etc.).

El sistema incluye:
- Autenticación y autorización basada en Supabase
- 6 roles con permisos granulares (32 permisos diferentes)
- Dashboard con KPIs y gráficos
- 24 tablas de base de datos con Row Level Security (RLS)
- 15+ módulos académicos

## Stack Tecnológico

### Frontend
- **Next.js 15.2** - Framework React con App Router
- **React 19** - Librería de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Framework CSS
- **shadcn/ui** - Componentes pre-diseñados
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconos vectoriales

### Backend
- **Supabase** - Platform de base de datos con Auth integrado
- **PostgreSQL** - Motor de base de datos
- **Next.js API Routes** - Backend serverless

### Seguridad
- **JWT** - Tokens para autenticación
- **RLS (Row Level Security)** - Control de acceso de datos a nivel de filas
- **CORS** - Protección de cross-origin requests

## Requisitos Previos

- Node.js 18+ (recomendado 20+)
- npm, yarn, pnpm o bun
- Cuenta de Supabase (gratuita en supabase.com)

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repo-url>
cd sispaa
```

### 2. Instalar Dependencias

```bash
pnpm install
# o: npm install / yarn install / bun install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Supabase API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback

# (Para producción en Vercel)
# NEXT_PUBLIC_SUPABASE_REDIRECT_URL=https://your-domain.com/auth/callback
```

**¿Cómo obtener las credenciales?**

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Accede a `Settings > API` en tu proyecto
3. Copia `Project URL` y `anon public key`
4. Pégalas en `.env.local`

### 4. Configurar Base de Datos

El schema de la base de datos ya está creado en Supabase. Las políticas RLS y datos de prueba se aplican automáticamente.

Si necesitas recrear la base de datos:

1. Ve a SQL Editor en Supabase
2. Ejecuta los scripts en `database/schema.sql` (si existe)
3. Luego ejecuta `database/policies.sql` y `database/seed.sql`

### 5. Iniciar Servidor de Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura de Carpetas

```
sispaa/
├── app/                           # Rutas y páginas (Next.js App Router)
│   ├── auth/
│   │   ├── login/                # Página de login
│   │   ├── logout/               # Página de logout
│   │   └── callback/             # Callback de Supabase
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── docencia/             # Módulo de Docencia
│   │   ├── estudiantes/          # Módulo de Estudiantes
│   │   ├── investigacion/        # Módulo de Investigación
│   │   ├── laboratorio/          # Prácticas de Laboratorio
│   │   ├── vinculacion/          # Vinculación Comunitaria
│   │   ├── titulacion/           # Titulación
│   │   └── admin/                # Panel de Administración
│   ├── globals.css               # Estilos globales
│   └── layout.tsx                # Layout raíz
├── components/
│   ├── dashboard/
│   │   ├── dashboard-layout.tsx  # Layout del dashboard
│   │   ├── kpi-card.tsx          # Componentes de KPI
│   │   └── filters.tsx           # Filtros de período/carrera
│   ├── sidebar-nav.tsx           # Navegación lateral
│   └── ui/                       # Componentes shadcn/ui
├── lib/
│   ├── auth/
│   │   └── auth-context.tsx      # Contexto de autenticación
│   ├── supabase/
│   │   ├── client.ts             # Cliente Supabase (browser)
│   │   ├── server.ts             # Cliente Supabase (server)
│   │   └── middleware.ts         # Middleware de sesión
│   ├── types/
│   │   └── database.ts           # Tipos TypeScript
│   ├── navigation.ts             # Configuración de navegación
│   └── utils.ts                  # Funciones utilitarias
├── middleware.ts                 # Middleware global
├── next.config.mjs               # Configuración de Next.js
├── tailwind.config.ts            # Configuración de Tailwind
└── tsconfig.json                 # Configuración de TypeScript
```

## Estructura de la Base de Datos

### Tablas Principales

#### Gestión de Usuarios y Acceso
- `periodos_academicos` - Períodos (2026-1, 2026-2)
- `carreras` - Carreras académicas
- `profiles` - Perfil extendido de usuarios
- `roles` - 6 roles del sistema
- `permisos` - 32 permisos granulares
- `roles_permisos` - Relación N:M

#### Docencia
- `materias` - Materias por carrera
- `silabos` - Sílabos de asignaturas
- `informes_docente` - Informes del docente

#### Estudiantes
- `documentos_estudiante` - Documentos SGA
- `faltas_estudiante` - Registro de faltas
- `justificaciones_falta` - Justificaciones de faltas

#### Investigación
- `investigaciones` - Proyectos de investigación
- `hitos_investigacion` - Hitos con seguimiento
- `informes_investigacion` - Reportes

#### Vinculación
- `vinculacion_actividades` - Actividades comunitarias
- `vinculacion_empresas` - Empresas beneficiadas
- `reportes_vinculacion` - Reportes

#### Titulación
- `titulacion_temas` - Temas de titulación
- `titulacion_estudiantes` - Relación tema-estudiante
- `titulacion_avances` - Avances de temas

#### Laboratorio
- `practicas_laboratorio` - Prácticas realizadas

#### Sistema
- `notificaciones` - Sistema de notificaciones

## Roles y Permisos

### 6 Roles Disponibles

| Rol | Descripción | Módulos Accesibles |
|-----|---|---|
| **Super Admin** | Control total del sistema | Todos |
| **Coordinador Carrera** | Supervisa toda la carrera | Dashboard, Estadísticas, Todas las vistas |
| **Coordinador Investigación** | Gestiona investigación | Investigación, Reportes, KPIs |
| **Docente** | Docencia diaria | Silabos, Informes, Investigación, Laboratorio, Vinculación |
| **Secretaria** | Operaciones académicas | Aprobación de documentos, Faltas, Estudiantes |
| **Estudiante** | Acceso limitado | Solo sus documentos, faltas y estado |

### Permisos Granulares (32 Total)

```
silabos.view           - Ver sílabos
silabos.upload         - Subir sílabos
silabos.approve        - Aprobar sílabos
silabos.stats          - Ver estadísticas

informes.view          - Ver informes
informes.upload        - Subir informes
informes.approve       - Aprobar informes

investigacion.view     - Ver investigaciones
investigacion.create   - Crear investigaciones
investigacion.respond  - Responder seguimiento
investigacion.report   - Exportar reportes

(... y 18 más)
```

## Autenticación y Flujo de Login

1. Usuario accede a `/auth/login`
2. Ingresa email y contraseña (usando Supabase Auth)
3. Supabase genera JWT token
4. Middleware refresh automáticamente los tokens
5. Usuario redirigido a `/dashboard`
6. Sidebar muestra menú dinámico según rol

**JWT & RLS:**
- Cada request incluye JWT en Authorization header
- RLS policies verifican `auth.uid()` para datos sensibles
- Estudiantes solo ven sus datos, docentes sus silabos, etc.

## Uso de Principales Funcionalidades

### Dashboard Principal
- **KPIs** - Métricas por módulo (Docencia, Investigación, Estudiantes, etc.)
- **Gráficos** - Cumplimiento por área y tendencias
- **Filtros** - Cambiar período académico y carrera
- **Semáforo** - Indicador visual de deadlines (verde, amarillo, rojo)

### Módulo Docencia
- Subir/gestionar sílabos (estado: pendiente, aprobado, rechazado)
- Subir/gestionar informes (mensuales, parciales, finales)
- Ver plazos y observaciones
- Sistema de seguimiento con deadline indicator

### Módulo Estudiantes
- Listar matriculados, activos, retirados
- Gestionar documentos (cédula, matricula, certificado, foto)
- Registrar faltas con justificaciones
- Ver historial académico

### Módulo Investigación
- Crear/editar proyectos de investigación
- Registrar hitos y avances
- Generar reportes
- Seguimiento de presupuesto

### Módulo Laboratorio
- Registrar prácticas realizadas
- Asistencia de estudiantes
- Descripción y ubicación

### Panel Admin
- **Usuarios** - CRUD de usuarios
- **Carreras** - CRUD de carreras
- **Períodos** - CRUD de períodos académicos
- **Permisos** - Asignar permisos

## Características Avanzadas

### Sistema de Permisos Dinámicos
El sidebar se actualiza automáticamente basado en los permisos del usuario:
```typescript
const filteredNav = filterNavigation(navigationConfig, permissions, isSuperAdmin)
```

### Row Level Security (RLS)
Protege datos a nivel de base de datos:
```sql
CREATE POLICY "Docentes can view own silabos" ON silabos 
FOR SELECT USING (auth.uid() = docente_id);
```

### Gráficos Interactivos
- Barras (cumplimiento por área)
- Líneas (tendencias)
- Cards (KPIs rápidos)

### Indicador Visual de Deadlines
- Verde (>7 días)
- Amarillo (3-7 días)  
- Rojo (<3 días)

## Deployment

### En Vercel

1. Push a GitHub
2. Conectar proyecto en [vercel.com](https://vercel.com)
3. Configurar variables de entorno en Settings
4. Deploy automático en cada push

### En Localhost
```bash
pnpm dev
```

### Con Docker
```bash
docker build -t sispaa .
docker run -p 3000:3000 sispaa
```

## Troubleshooting

### Error: "Your project's URL and Key are required"
**Solución:** Verifica que `.env.local` tenga las variables correctas

### Error: 404 en rutas
**Solución:** Asegúrate de que los archivos existen en `app/` con estructura correcta

### Error: CORS bloqueado
**Solución:** En `next.config.mjs`, agrega:
```javascript
allowedDevOrigins: ['tu-dominio.vusercontent.net']
```

### Error: "Table not found"
**Solución:** Ejecuta los SQL scripts en Supabase SQL Editor

## Datos de Prueba

### Usuarios de Ejemplo
```
Admin:        admin@uleam.edu.ec (contraseña: test123)
Coordinador:  coordinador@uleam.edu.ec
Docente:      docente@uleam.edu.ec
Secretaria:   secretaria@uleam.edu.ec
Estudiante:   estudiante@live.uleam.edu.ec
```

### Carreras
- Ingeniería Agropecuaria (AGR)
- Agronegocios (AGN)
- Agroindustria (AGI)

### Períodos
- 2026-1 (Activo)
- 2025-2 (Inactivo)

## API Endpoints

### Rutas de Autenticación
- `POST /auth/callback` - Callback de Supabase

### Rutas del Dashboard
- `GET /dashboard` - Dashboard principal
- `GET /dashboard/docencia/silabos` - Gestión de sílabos
- `GET /dashboard/estudiantes/matriculados` - Listado de estudiantes

(Más rutas en la documentación completa)

## Próximas Características

- Notificaciones en tiempo real
- Exportación de reportes (PDF/Excel)
- Integración con Vercel Blob para archivos
- Chat integrado
- Calendario académico
- Sistema de auditoría

## Contribución

Está permitida la contribución siguiendo estos pasos:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'Add nueva-feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## Licencia

MIT - Ver `LICENSE.md`

## Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub o contacta a soporte@uleam.edu.ec

---

**Versión:** 1.0.0
**Estado:** MVP Completo
**Última actualización:** Mayo 2026
**Desarrollado con:** Next.js + Supabase + Tailwind CSS
