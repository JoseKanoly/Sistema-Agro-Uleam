# Credenciales de Acceso - Sistema SISPAA

## Sistema de Gestión Académica

Estas son las credenciales creadas en la base de datos Neon para acceder a la plataforma.

---

## Super Administrador
**Rol:** Super Admin (Acceso Total)

```
Email:    marco.zambrano@uleam.edu.ec
Password: SuperAdmin1234
```

**Permisos:**
- Gestión de usuarios y roles
- Configuración del sistema
- Reportes administrativos
- Acceso a todas las funcionalidades

---

## Administrador
**Rol:** Admin

```
Email:    marco.admin@uleam.edu.ec
Password: Admin1234
```

**Permisos:**
- Gestión de estudiantes y docentes
- Administración de carreras
- Configuración académica
- Reportes

---

## Docente
**Rol:** Docente

```
Email:    marco.docente@uleam.edu.ec
Password: Docente1234
```

**Permisos:**
- Calificación de estudiantes
- Seguimiento de asistencia
- Carga de silabos
- Gestión de laboratorios
- Seguimiento de investigación

---

## Coordinador
**Rol:** Coordinador

```
Email:    marco.coordinador@uleam.edu.ec
Password: Coordinador1234
```

**Permisos:**
- Supervisión académica
- Revisión de documentos
- Reporte de vinculación
- Control de titulación

---

## Estudiante
**Rol:** Estudiante

```
Email:    e1317851911@live.uleam.edu.ec
Password: Estudiante1234
```

**Permisos:**
- Visualización de calificaciones
- Registro de faltas
- Solicitud de justificaciones
- Seguimiento de titulación
- Acceso a laboratorios

---

## 📝 Crear Nueva Cuenta

También puedes crear una nueva cuenta utilizando el formulario de registro:

1. Ve a `/auth/signup`
2. Completa los datos: nombre, correo, contraseña
3. Se te asignará automáticamente el rol de **Estudiante**
4. Accede a través de `/auth/login`

---

## 🔄 Cambiar Contraseña

Para cambiar la contraseña:
1. Inicia sesión en tu cuenta
2. Ve a tu perfil
3. Selecciona "Cambiar contraseña"
4. Ingresa tu contraseña actual y la nueva

---

## ⚠️ Notas de Seguridad

- **En Producción:** Todas las contraseñas deben cambiarse inmediatamente
- **No compartir:** Estas credenciales son solo para desarrollo
- **Base de Datos:** Las contraseñas se almacenan con hash seguro (scrypt)
- **Sesiones:** Se utiliza Better Auth para gestionar sesiones de forma segura

---

**Última actualización:** 2026-06-13  
**Plataforma:** SISPAA v1.0  
**Base de Datos:** Neon Postgres  
**Autenticación:** Better Auth con scrypt hashing
