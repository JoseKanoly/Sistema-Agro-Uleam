import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { user, account, perfiles, carreras } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const testUsers = [
  {
    name: 'Admin Agro23',
    email: 'admin@local.test',
    password: 'Admin123!',
    rol: 'ADMIN',
  },
  {
    name: 'María Secretaría',
    email: 'secretaria@local.test',
    password: 'Secretaria123!',
    rol: 'SECRETARIA',
  },
  {
    name: 'Dr. Carlos Mendoza',
    email: 'carlos.mendoza@local.test',
    password: 'Docente123!',
    rol: 'PROFESOR',
  },
  {
    name: 'Dra. Elena Rodríguez',
    email: 'elena.rodriguez@local.test',
    password: 'Docente123!',
    rol: 'PROFESOR',
  },
  {
    name: 'Juan Pérez García',
    email: 'juan.perez@local.test',
    password: 'Estudiante123!',
    rol: 'ESTUDIANTE',
  },
  {
    name: 'María López Sánchez',
    email: 'maria.lopez@local.test',
    password: 'Estudiante123!',
    rol: 'ESTUDIANTE',
  },
  {
    name: 'Roberto Flores Moreno',
    email: 'roberto.flores@local.test',
    password: 'Estudiante123!',
    rol: 'ESTUDIANTE',
  },
]

async function main() {
  console.log('Creating test users...')

  // Create a test career reference (Ingeniería Agropecuaria = id 2 after seed)
  const [carreraAgropec] = await db
    .select({ id: carreras.id })
    .from(carreras)
    .where(eq(carreras.siglas, 'IAgropec'))
    .limit(1)

  const carreraId = carreraAgropec?.id ?? 2

  for (const testUser of testUsers) {
    try {
      // Use Better Auth to create user (this will hash the password)
      const result = await auth.api.signUpEmail({
        body: {
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        },
      })

      if (result) {
        console.log(`✓ Created user: ${testUser.email}`)

        // Get the created user to get their ID
        const createdUser = await db
          .select()
          .from(user)
          .where(eq(user.email, testUser.email))
          .limit(1)

        if (createdUser.length > 0) {
          const userId = createdUser[0].id

          const [existingPerfil] = await db
            .select()
            .from(perfiles)
            .where(eq(perfiles.userId, userId))
            .limit(1)

          if (existingPerfil) {
            await db
              .update(perfiles)
              .set({
                rol: testUser.rol,
                carreraId: testUser.rol === 'ESTUDIANTE' ? carreraId : null,
              })
              .where(eq(perfiles.userId, userId))
          } else {
            await db.insert(perfiles).values({
              userId,
              rol: testUser.rol,
              carreraId: testUser.rol === 'ESTUDIANTE' ? carreraId : null,
            })
          }

          console.log(`✓ Perfil configurado con rol: ${testUser.rol}`)
        }
      }
    } catch (error: any) {
      console.log(`✗ Error creating user ${testUser.email}:`, error.message)
    }
  }

  console.log('\n=== TEST USER CREDENTIALS ===\n')
  testUsers.forEach((testUser) => {
    console.log(`${testUser.rol.toUpperCase()}: ${testUser.email}`)
    console.log(`Password: ${testUser.password}\n`)
  })

  process.exit(0)
}

main().catch(console.error)
