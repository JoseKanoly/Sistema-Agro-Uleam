# Sistema Agro ULEAM

Sistema desarrollado con **Next.js + PostgreSQL + Better Auth**.

---

# Requisitos

* Node.js 18+
* npm
* PostgreSQL instalado y ejecutándose en `localhost:5432`

---

# Configuración inicial

## Variables de entorno

Crear el archivo `.env.local` basado en `.env.example`.

Configuración requerida:

```env
DATABASE_URL=postgresql://postgres:2026@localhost:5432/postgres

BETTER_AUTH_URL=http://localhost:3000

BETTER_AUTH_SECRET=sispaa-local-dev-secret-32chars-min
```

---

# Instalación

Instalar dependencias del proyecto:

```bash
npm install
```

---

# Configuración de base de datos

Ejecutar los comandos en el siguiente orden:

```bash
npm run db:setup

npm run db:migrate

npm run db:seed-carreras

npm run db:seed
```

Estos comandos realizan:

* Creación de tablas del sistema.
* Configuración de Better Auth.
* Carga de carreras ULEAM.
* Carga de materias de las mallas curriculares.
* Creación de usuarios de prueba.

---

# Carreras cargadas

El sistema incluye las siguientes carreras:

* Ingeniería Agroindustrial
* Ingeniería Agropecuaria
* Agronegocios

Total cargado:

* **3 carreras**
* **129 materias**

Las materias incluyen:

* ACD
* APE
* AA
* Horas
* Créditos

---

# Ejecución de la aplicación

## Desarrollo

Ejecutar:

```bash
npm run dev
```

Abrir en el navegador:

```
http://localhost:3000
```

---

# Usuarios de prueba

| Rol           | Usuario                                                         | Contraseña     |
| ------------- | --------------------------------------------------------------- | -------------- |
| Administrador | [admin@local.test](mailto:admin@local.test)                     | Admin123!      |
| Secretaria    | [secretaria@local.test](mailto:secretaria@local.test)           | Secretaria123! |
| Profesor      | [carlos.mendoza@local.test](mailto:carlos.mendoza@local.test)   | Docente123!    |
| Profesor      | [elena.rodriguez@local.test](mailto:elena.rodriguez@local.test) | Docente123!    |
| Estudiante    | [juan.perez@local.test](mailto:juan.perez@local.test)           | Estudiante123! |
| Estudiante    | [maria.lopez@local.test](mailto:maria.lopez@local.test)         | Estudiante123! |
| Estudiante    | [roberto.flores@local.test](mailto:roberto.flores@local.test)   | Estudiante123! |

---

# Producción

Generar compilación:

```bash
npm run build
```

Ejecutar aplicación compilada:

```bash
npm start
```

---

# Solución de problemas

## Error de conexión PostgreSQL

Verificar:

* PostgreSQL está activo.
* Usuario `postgres` correcto.
* Contraseña correcta.
* Puerto `5432` disponible.
* Base de datos `postgres` existente.

---

## Error en login o registro

Revisar:

* Archivo `.env.local`.
* Variable `DATABASE_URL`.
* Variable `BETTER_AUTH_URL`.
* Que se haya ejecutado:

```bash
npm run db:seed
```

---

## Error en seed

Ejecutar primero:

```bash
npm run db:setup

npm run db:migrate
```

Después ejecutar:

```bash
npm run db:seed-carreras

npm run db:seed
```
