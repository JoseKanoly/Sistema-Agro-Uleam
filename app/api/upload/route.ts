import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { perfiles, gruposDocumentos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import {
  ensureUserFolder,
  getUploadPublicUrl,
  getUserFolderName,
  sanitizeFolderPart,
} from '@/lib/storage/usuario'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const grupoIdRaw = formData.get('grupoId') as string | null

  if (!file) {
    return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
  }

  if (!grupoIdRaw) {
    return NextResponse.json({ error: 'Seleccione un grupo de documentos' }, { status: 400 })
  }

  const grupoId = Number(grupoIdRaw)
  const [grupo] = await db
    .select()
    .from(gruposDocumentos)
    .where(eq(gruposDocumentos.id, grupoId))
    .limit(1)

  if (!grupo) {
    return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 400 })
  }

  const [perfil] = await db
    .select()
    .from(perfiles)
    .where(eq(perfiles.userId, session.user.id))
    .limit(1)

  if (!perfil?.cedula) {
    return NextResponse.json({
      error: 'Su cuenta no tiene cédula registrada. Contacte a secretaría.',
    }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filename = `${Date.now()}-${safeName}`

  await ensureUserFolder(session.user.name, perfil.cedula, grupo.nombre)

  const uploadDir = join(
    process.cwd(),
    'public',
    'uploads',
    'usuarios',
    getUserFolderName(session.user.name, perfil.cedula),
    sanitizeFolderPart(grupo.nombre),
  )

  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, filename), buffer)

  const url = getUploadPublicUrl(session.user.name, perfil.cedula, grupo.nombre, filename)

  return NextResponse.json({
    url,
    nombre: file.name,
    grupoId: grupo.id,
    grupoNombre: grupo.nombre,
  })
}
