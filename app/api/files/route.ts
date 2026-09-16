import { get } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const pathname = request.nextUrl.searchParams.get('pathname')
  if (!pathname || !pathname.startsWith(`comprovantes/${session.user.id}/`)) {
    return NextResponse.json({ error: 'Arquivo invalido' }, { status: 403 })
  }

  const result = await get(pathname, {
    access: 'private',
    ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
  })
  if (!result) return new NextResponse('Arquivo nao encontrado', { status: 404 })
  if (result.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: result.blob.etag, 'Cache-Control': 'private, no-cache' },
    })
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType,
      'Content-Disposition': 'inline',
      ETag: result.blob.etag,
      'Cache-Control': 'private, no-cache',
    },
  })
}
