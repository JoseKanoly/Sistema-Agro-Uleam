# SISPAA - Guía Rápida de Inicio

## En 5 Minutos

### 1. Clonar y Instalar

```bash
git clone <repo>
cd sispaa
pnpm install
```

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En `Settings > API`, copia la URL y la anon key
3. Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

### 3. Ejecutar

```bash
pnpm dev
# Abre http://localhost:3000
```

## URLs Importantes

| Página | URL | Descripción |
|--------|-----|---|
| Login | `/auth/login` | Página de autenticación |
| Dashboard | `/dashboard` | Panel principal |
| Sílabos | `/dashboard/docencia/silabos` | Gestión de sílabos |
| Estudiantes | `/dashboard/estudiantes/matriculados` | Listado de estudiantes |
| Admin | `/dashboard/admin/usuarios` | Panel administrativo |

## Credenciales de Prueba

```
Email: admin@uleam.edu.ec
Contraseña: test123
```

## Estructura Rápida

```
app/           → Páginas (Next.js App Router)
components/    → Componentes reutilizables
lib/           → Lógica y utilidades
database/      → Scripts SQL (si existen)
```

## Comandos Útiles

```bash
# Iniciar desarrollo
pnpm dev

# Build para producción
pnpm build

# Ejecutar en producción
pnpm start

# Linter
pnpm lint

# Formateo de código
pnpm format
```

## Troubleshooting Rápido

**Error: "URL y Key requeridas"**
→ Revisa `.env.local` tiene las variables correctas

**Error: 404 en rutas**
→ Verifica que la carpeta exista en `app/`

**Error: Conexión rechazada**
→ Asegúrate que `pnpm dev` está corriendo

## Estructura de Carpetas Clave

```
app/
├── dashboard/
│   ├── page.tsx (Dashboard principal)
│   ├── docencia/ (Sílabos, Informes)
│   ├── estudiantes/ (Matriculados, Faltas)
│   ├── admin/ (Usuarios, Carreras, Períodos)
│   └── layout.tsx (Sidebar dinámico)
├── auth/
│   ├── login/page.tsx
│   └── callback/route.ts
└── layout.tsx

lib/
├── supabase/
│   ├── client.ts (Browser client)
│   ├── server.ts (Server client)
│   └── middleware.ts (Session refresh)
├── auth/
│   └── auth-context.tsx (Auth provider)
└── navigation.ts (Menu config)

components/
├── dashboard/
│   ├── dashboard-layout.tsx
│   └── kpi-card.tsx
└── sidebar-nav.tsx
```

## ¿Qué hace cada módulo?

**Docencia** → Sílabos e informes de profesores
**Estudiantes** → Matriculados, faltas, documentos
**Investigación** → Proyectos y reportes
**Laboratorio** → Prácticas realizadas
**Vinculación** → Actividades comunitarias
**Titulación** → Temas y avances
**Admin** → Gestión de sistema

## Roles y Acceso

| Rol | Puede Ver | No Puede |
|-----|-----------|---------|
| Super Admin | TODO | Nada |
| Coordinador | Todas estadísticas | Editar base de datos |
| Docente | Sus módulos | Datos de otros |
| Secretaria | Documentos, aprobaciones | Crear usuarios |
| Estudiante | Solo sus datos | Otras áreas |

## Base de Datos

La BD está en Supabase (PostgreSQL):
- 24 tablas
- Row Level Security habilitado
- 32 permisos granulares
- Datos de prueba incluidos

## Personalización

### Cambiar colores
→ Edita `app/globals.css` (design tokens)

### Agregar nuevo rol
→ Inserta en tabla `roles` + `permisos`

### Crear nueva página
→ Crea `app/dashboard/nuevo-modulo/page.tsx`

### Cambiar sidebar
→ Edita `lib/navigation.ts`

## Desplegar en Vercel

```bash
# Conectar repo en vercel.com
# Agregar env vars en Settings
# Push a main branch
# Auto-deploy! 🚀
```

## Documentación Completa

Ver `README_SISPAA.md` para:
- Estructura detallada
- API endpoints
- Row Level Security
- Scripts de base de datos
- Ejemplos de código

---

**Listo! Ahora puedes:**
1. Loguarte con `admin@uleam.edu.ec`
2. Ver el dashboard
3. Explorar cada módulo
4. Personalizar según necesites

Preguntas? Ver `README_SISPAA.md` 📖
