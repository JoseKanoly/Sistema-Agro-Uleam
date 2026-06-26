import { mkdir } from 'fs/promises'
import { join } from 'path'

export function sanitizeFolderPart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
}

export function getUserFolderName(name: string, cedula: string): string {
  const safeName = sanitizeFolderPart(name)
  const safeCedula = sanitizeFolderPart(cedula)
  return `${safeName}_${safeCedula}`
}

export function getUserUploadRoot(name: string, cedula: string): string {
  return join(process.cwd(), 'public', 'uploads', 'usuarios', getUserFolderName(name, cedula))
}

export async function ensureUserFolder(name: string, cedula: string, grupoNombre?: string) {
  const root = getUserUploadRoot(name, cedula)
  await mkdir(root, { recursive: true })
  if (grupoNombre) {
    await mkdir(join(root, sanitizeFolderPart(grupoNombre)), { recursive: true })
  }
  return root
}

export function getUploadPublicUrl(name: string, cedula: string, grupoNombre: string, filename: string) {
  const folder = getUserFolderName(name, cedula)
  const grupo = sanitizeFolderPart(grupoNombre)
  return `/uploads/usuarios/${folder}/${grupo}/${filename}`
}
