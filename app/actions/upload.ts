'use server'

import { put } from '@vercel/blob'
import { getUserId } from '@/lib/session'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']

export async function uploadAttachment(
  formData: FormData,
): Promise<{ url: string; name: string }> {
  const userId = await getUserId()
  const file = formData.get('file') as File | null

  if (!file) throw new Error('Nenhum arquivo enviado')
  if (file.size > MAX_SIZE) throw new Error('Arquivo excede o limite de 5MB')
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Formato invalido. Use PNG, JPG, WEBP ou PDF')
  }

  const blob = await put(`comprovantes/${userId}/${Date.now()}-${file.name}`, file, {
    access: 'private',
    addRandomSuffix: true,
  })

  return { url: blob.pathname, name: file.name }
}
