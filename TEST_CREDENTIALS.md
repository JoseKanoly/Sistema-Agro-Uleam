# SISPAA - Credenciales de Prueba

## ✓ USUARIOS LISTOS PARA USAR

Todos los usuarios de prueba han sido registrados correctamente en el sistema. Puedes acceder directamente con las credenciales a continuación.

---

## Usuarios de Prueba por Rol

### 1. ADMINISTRADOR
- **Email:** admin@agro23.edu
- **Nombre:** Admin Agro23
- **Contraseña:** Admin123!
- **Rol:** admin
- **Acceso a:** Panel de administración completo

### 2. DOCENTES

#### Docente 1
- **Email:** carlos.mendoza@agro23.edu
- **Nombre:** Dr. Carlos Mendoza
- **Contraseña:** Docente123!
- **Rol:** docente
- **Carrera:** Ingeniería Agronómica

#### Docente 2
- **Email:** elena.rodriguez@agro23.edu
- **Nombre:** Dra. Elena Rodríguez
- **Contraseña:** Docente123!
- **Rol:** docente
- **Carrera:** Ingeniería Agronómica

### 3. ESTUDIANTES

#### Estudiante 1
- **Email:** juan.perez@agro23.edu
- **Nombre:** Juan Pérez García
- **Contraseña:** Estudiante123!
- **Rol:** estudiante
- **Carrera:** Ingeniería Agronómica

#### Estudiante 2
- **Email:** maria.lopez@agro23.edu
- **Nombre:** María López Sánchez
- **Contraseña:** Estudiante123!
- **Rol:** estudiante
- **Carrera:** Ingeniería Agronómica

#### Estudiante 3
- **Email:** roberto.flores@agro23.edu
- **Nombre:** Roberto Flores Moreno
- **Contraseña:** Estudiante123!
- **Rol:** estudiante
- **Carrera:** Ingeniería Agronómica

---

## Cómo Acceder

### Iniciar Sesión
1. Ve a `http://localhost:3000/auth/login`
2. Ingresa el email del usuario
3. Ingresa la contraseña
4. Haz clic en "Ingresar al sistema"
5. Serás redirigido al dashboard automáticamente

**Ejemplo:**
- Email: `carlos.mendoza@agro23.edu`
- Contraseña: `Docente123!`

---

## Notas Importantes

- **Seguridad:** Las contraseñas están hasheadas en la base de datos con Better Auth
- **Roles:** Cada usuario tiene un rol asignado (admin, docente, estudiante)
- **Carrera:** Los docentes y estudiantes están asociados a "Ingeniería Agronómica"
- **Períodos Académicos:** Disponibles para sincronización en el módulo de matriculas

---

## Funcionalidades Disponibles por Rol

### Admin
- Ver todos los usuarios
- Gestionar carreras
- Gestionar períodos académicos
- Acceso a reportes globales

### Docente
- Ver estudiantes matriculados
- Cargar sílabos
- Ingresar calificaciones
- Crear prácticas de laboratorio

### Estudiante
- Ver matriculas
- Consultar calificaciones
- Ver silabos de materias
- Solicitar justificaciones
- Ver asistencia

---

## URL de Acceso

- **Login:** `http://localhost:3000/auth/login`
- **Signup:** `http://localhost:3000/auth/signup`
- **Dashboard:** `http://localhost:3000/dashboard`
